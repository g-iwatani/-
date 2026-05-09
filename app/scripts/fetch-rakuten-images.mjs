#!/usr/bin/env node
/**
 * 楽天 Webservice の IchibaItem Search を叩いて商品画像URLを取得し
 * src/lib/rakuten-images.generated.json に書き出す。
 *
 * 必要な環境変数:
 *   RAKUTEN_APP_ID           = アプリID(UUID形式)
 *   RAKUTEN_ACCESS_KEY       = アクセスキー
 *   NEXT_PUBLIC_SITE_URL     = アプリ登録時のサイトURL(Referer 用、デフォルト wanproblem.com)
 *
 * フェイルセーフ: API 失敗時は既存JSONを温存。ビルド自体は止めない。
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

// 楽天 Webservice 新 ichibams エンドポイント (UUID 形式の applicationId に対応する唯一の入口)
const ENDPOINT = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401";

const APP_ID = process.env.RAKUTEN_APP_ID;
const ACCESS_KEY = process.env.RAKUTEN_ACCESS_KEY;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://wanproblem.com").replace(/\/$/, "");

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

function buildUrl(target) {
  const url = new URL(ENDPOINT);
  url.searchParams.set("format", "json");
  url.searchParams.set("applicationId", APP_ID);
  if (ACCESS_KEY) url.searchParams.set("accessKey", ACCESS_KEY);
  url.searchParams.set("shopCode", target.shopCode);
  url.searchParams.set("itemCode", target.itemCode);
  url.searchParams.set("keyword", "ペット");
  url.searchParams.set("hits", "1");
  return url;
}

function pickImageUrl(item) {
  const tryList = [
    item.mediumImageUrls,
    item.smallImageUrls,
    item.images?.medium,
    item.images?.small,
  ];
  for (const list of tryList) {
    if (!Array.isArray(list) || list.length === 0) continue;
    const first = list[0];
    const u = typeof first === "string" ? first : first?.imageUrl;
    if (u) return u;
  }
  return "";
}

async function fetchOne(target) {
  const referers = [SITE_URL + "/", SITE_URL];
  const url = buildUrl(target);

  for (const referer of referers) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "application/json",
          Referer: referer,
          Origin: SITE_URL,
        },
      });
      const bodyText = await res.text();
      if (!res.ok) {
        console.warn(
          `[rakuten-images] ${target.id} HTTP ${res.status} ref=${referer}`,
        );
        console.warn(`  body: ${bodyText.slice(0, 240)}`);
        continue;
      }
      const data = JSON.parse(bodyText);
      const items = data.Items ?? data.items ?? [];
      const item = items[0]?.Item ?? items[0]?.item ?? items[0];
      if (!item) {
        console.warn(`[rakuten-images] ${target.id} 200 but no items`);
        continue;
      }
      const imageUrl = pickImageUrl(item);
      if (!imageUrl) {
        console.warn(`[rakuten-images] ${target.id} 200 but no image url`);
        continue;
      }
      return imageUrl
        .replace(/\?_ex=\d+x\d+/, "?_ex=400x400")
        .replace(/&_ex=\d+x\d+/, "&_ex=400x400");
    } catch (e) {
      console.warn(`[rakuten-images] ${target.id} error: ${e.message}`);
    }
  }
  return null;
}

async function main() {
  if (!APP_ID) {
    console.warn("[rakuten-images] RAKUTEN_APP_ID 未設定。スキップ。");
    if (!(await exists(OUTPUT_JSON))) await writeFile(OUTPUT_JSON, "{}\n", "utf8");
    return;
  }

  const source = await readFile(PRODUCTS_TS, "utf8");
  const targets = findRakutenTargets(source);
  console.log(
    `[rakuten-images] ${targets.length} targets / Referer=${SITE_URL}/  (accessKey=${ACCESS_KEY ? "set" : "missing"})`,
  );

  if (targets.length === 0) {
    console.warn("[rakuten-images] 楽天ターゲット 0 件。終了。");
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
      console.warn(`[rakuten-images] ✗ ${t.id} 全エンドポイント失敗`);
    }
    await new Promise((r) => setTimeout(r, 1100)); // レート1req/s 厳守
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
