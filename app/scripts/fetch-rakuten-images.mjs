#!/usr/bin/env node
/**
 * 楽天市場の公開商品ページ (https://item.rakuten.co.jp/{shopCode}/{itemCode}/) を
 * 直接 fetch して OGP メタタグから画像URLを抜き、
 * src/lib/rakuten-images.generated.json に書き出す。
 *
 * Webservice API 経由 (Referer ホワイトリスト + UUID applicationId) は
 * server-side fetch を実質拒否するため、公開HTMLスクレイピングに切替。
 *
 * フェイルセーフ: 取得失敗時は既存JSONを温存。ビルド自体は止めない。
 */

import { readFile, writeFile, access } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const PRODUCTS_TS = resolve(here, "..", "src", "lib", "products.ts");
const OUTPUT_JSON = resolve(
  here,
  "..",
  "src",
  "lib",
  "rakuten-images.generated.json",
);

const exists = (p) => access(p).then(() => true).catch(() => false);

function findRakutenTargets(source) {
  const results = [];
  const targetRegex =
    /target:\s*\{\s*network:\s*"rakuten"\s*,\s*shopCode:\s*"([^"]+)"\s*,\s*itemCode:\s*"([^"]+)"\s*,?\s*\}/g;
  let m;
  while ((m = targetRegex.exec(source)) !== null) {
    const before = source.slice(0, m.index);
    const ids = [...before.matchAll(/^\s*id:\s*"([^"]+)"/gm)];
    if (!ids.length) continue;
    results.push({
      id: ids[ids.length - 1][1],
      shopCode: m[1],
      itemCode: m[2],
    });
  }
  const seen = new Set();
  return results.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

function extractOgImage(html) {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+itemprop=["']image["'][^>]+content=["']([^"']+)["']/i,
    /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) return m[1];
  }
  return "";
}

async function fetchOne(target) {
  const pageUrl = `https://item.rakuten.co.jp/${target.shopCode}/${target.itemCode}/`;
  try {
    const res = await fetch(pageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
      },
      redirect: "follow",
    });
    if (!res.ok) {
      console.warn(`[rakuten-images] ${target.id} HTTP ${res.status} ${pageUrl}`);
      return null;
    }
    const html = await res.text();
    const img = extractOgImage(html);
    if (!img) {
      console.warn(`[rakuten-images] ${target.id} 200 but no og:image in HTML (${html.length} bytes)`);
      return null;
    }
    return img.startsWith("//") ? "https:" + img : img;
  } catch (e) {
    console.warn(`[rakuten-images] ${target.id} error: ${e.message}`);
    return null;
  }
}

async function main() {
  const source = await readFile(PRODUCTS_TS, "utf8");
  const targets = findRakutenTargets(source);
  console.log(`[rakuten-images] ${targets.length} targets (HTML scrape mode)`);

  if (targets.length === 0) {
    if (!(await exists(OUTPUT_JSON))) await writeFile(OUTPUT_JSON, "{}\n", "utf8");
    return;
  }

  let result = {};
  try {
    result = JSON.parse(await readFile(OUTPUT_JSON, "utf8"));
  } catch {
    result = {};
  }

  let updated = 0;
  let failed = 0;
  for (const t of targets) {
    const url = await fetchOne(t);
    if (url) {
      result[t.id] = url;
      updated++;
      console.log(`[rakuten-images] ✓ ${t.id} → ${url}`);
    } else {
      failed++;
      console.warn(`[rakuten-images] ✗ ${t.id} 取得失敗`);
    }
    await new Promise((r) => setTimeout(r, 800));
  }

  await writeFile(OUTPUT_JSON, JSON.stringify(result, null, 2) + "\n", "utf8");
  console.log(
    `[rakuten-images] DONE total=${Object.keys(result).length} updated=${updated} failed=${failed}`,
  );
}

main().catch((e) => {
  console.error("[rakuten-images] fatal:", e);
  process.exit(0);
});
