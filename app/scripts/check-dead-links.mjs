#!/usr/bin/env node
/**
 * 商品データ内の URL を HEAD リクエストで疎通確認するヘルスチェック。
 * 週次 cron で動かして、4xx/5xx を返す URL を Markdown レポートで stdout 出力。
 * GitHub Actions の後段が Issue として登録する。
 *
 * 対象:
 *   - manual-images.json の値
 *   - rakuten-images.generated.json の値
 *   - amazon-bestsellers.generated.ts の imageUrl
 *   - rawProducts (products.ts) 内の literal URL ("url:" or "imageUrl:")
 *
 * 対象外 (動的構築のため):
 *   - Amazon ASIN / amazon-search-jp target
 *   - Rakuten shopCode/itemCode target
 *   - VC / a8 deep-link (本番アフィリ ID で組み立てる)
 *
 * 並列度は控えめ (8 同時) にして、相手サイトのレート制限に当たらないように。
 */

import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const TARGETS = [
  resolve(root, "src", "lib", "products.ts"),
  resolve(root, "src", "lib", "amazon-bestsellers.generated.ts"),
  resolve(root, "src", "lib", "manual-images.json"),
  resolve(root, "src", "lib", "rakuten-images.generated.json"),
];

const URL_RE = /https?:\/\/[^\s"',<>)\]\\]+/g;
const SKIP_HOSTS = new Set([
  // 連絡先 / 法令 / マークアップ参照系。可用性チェック対象外。
  "schema.org",
  "www.schema.org",
  "twitter.com",
  "x.com",
  "github.com",
  "creativecommons.org",
]);

async function collectUrls() {
  const set = new Set();
  for (const f of TARGETS) {
    let body;
    try {
      body = await readFile(f, "utf8");
    } catch {
      continue;
    }
    const matches = body.match(URL_RE) ?? [];
    for (const u of matches) {
      try {
        const h = new URL(u).hostname;
        if (SKIP_HOSTS.has(h)) continue;
      } catch {
        continue;
      }
      set.add(u);
    }
  }
  return [...set];
}

async function checkOne(url, signal) {
  // Amazon は HEAD を 405 で返すことがあるので、HEAD 失敗時 GET で再試行。
  const headers = {
    "user-agent":
      "Mozilla/5.0 (compatible; WanProblemHealthCheck/1.0; +https://wanproblem.com/legal/about)",
    accept: "*/*",
  };
  const opts = { method: "HEAD", redirect: "follow", headers, signal };
  try {
    const r = await fetch(url, opts);
    if (r.status === 405 || r.status === 403) {
      // HEAD 拒否 → GET range 1 byte で確認
      const r2 = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: { ...headers, range: "bytes=0-0" },
        signal,
      });
      return { url, status: r2.status };
    }
    return { url, status: r.status };
  } catch (e) {
    return { url, status: 0, error: e instanceof Error ? e.message : String(e) };
  }
}

async function pool(urls, concurrency, perRequestTimeoutMs) {
  const results = [];
  let cursor = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (cursor < urls.length) {
      const i = cursor++;
      const u = urls[i];
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), perRequestTimeoutMs);
      try {
        results.push(await checkOne(u, ctrl.signal));
      } finally {
        clearTimeout(t);
      }
    }
  });
  await Promise.all(workers);
  return results;
}

const urls = await collectUrls();
const start = Date.now();
const results = await pool(urls, 8, 12_000);
const elapsed = ((Date.now() - start) / 1000).toFixed(1);
const dead = results.filter((r) => r.status === 0 || r.status >= 400);

console.log(
  `Checked ${results.length} URLs in ${elapsed}s. Dead/blocked: ${dead.length}.`,
);
console.log("");
console.log("# 死リンク検出レポート");
console.log("");
console.log(`実行日時: ${new Date().toISOString()}`);
console.log(`対象URL数: ${results.length}`);
console.log(`問題あり: ${dead.length}`);
console.log("");
if (dead.length === 0) {
  console.log("すべての URL が 2xx/3xx を返しました。");
  process.exit(0);
}
console.log("| status | URL |");
console.log("|---|---|");
for (const r of dead.sort((a, b) => a.status - b.status)) {
  const status = r.error ? `ERR (${r.error.slice(0, 40)})` : String(r.status);
  console.log(`| ${status} | <${r.url}> |`);
}
// 死リンクがあっても non-zero exit はしない (CI を赤にしない)。
// GitHub Actions 側でレポート本文を Issue 化する。
