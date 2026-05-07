#!/usr/bin/env node
/**
 * 楽天 Webservice の IchibaItem Search を叩いて商品画像URLを取得し
 * src/lib/rakuten-images.generated.json に書き出す。
 *
 * 必要な環境変数:
 *   RAKUTEN_APP_ID           = アプリID(UUID or 19-20桁の数字、どちらも可)
 *   RAKUTEN_ACCESS_KEY       = アクセスキー(新 ichibams 用、無くてもよい)
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

// 楽天 Webservice のエンドポイント候補(新→旧の順で試す)
const ENDPOINTS = [
  // 新 ichibams (accessKey + Referer 必須)
  "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401",
  // 旧 services API (applicationId のみで動く、安定版)
  "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601",
];

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

function buildUrl(endpoint, target, includeAccessKey) {
  const url = new URL(endpoint);
  url.searchParams.set("format", "json");
  url.searchParams.set("applicationId", APP_ID);
  if (includeAccessKey && ACCESS_KEY) {
    url.searchParams.set("accessKey", ACCESS_KEY);
  }
  url.searchParams.set("shopCode", target.shopCode);
  url.searchParams.set("itemCode", target.itemCode);
  // 新APIは keyword 必須。旧APIは itemCode/shopCode だけでもよいが、
  // 互換のため "ペット" を全リクエストに付けておく。日本語の最低3文字は必須。
  url.searchParams.set("keyword", "ペット");
  url.searchParams.set("hits", "1");
  return url;
}

function pickImageUrl(item) {
  // 新旧でフィールドの構造が異なる
  // 新: item.mediumImageUrls = [{ imageUrl: "..." }]
  // 旧: item.mediumImageUrls = [{ imageUrl: "..." }] / または string[]
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
  for (let i = 0; i < ENDPOINTS.length; i++) {
    const endpoint = ENDPOINTS[i];
    const includeAccessKey = i === 0; // 新APIだけ accessKey 送る
    const url = buildUrl(endpoint, target, includeAccessKey);

    for (const referer of referers) {
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": "wanproblem-build/1.0",
            Accept: "application/json",
            Referer: referer,
            Origin: SITE_URL,
          },
        });
        const bodyText = await res.text();
        if (!res.ok) {
          console.warn(
            `[rakuten-images] ${target.id} HTTP ${res.status} via ${endpoint.split("/").slice(-2).join("/")} ref=${referer}`,
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
        const cleaned = imageUrl
          .replace(/\?_ex=\d+x\d+/, "?_ex=400x400")
          .replace(/&_ex=\d+x\d+/, "&_ex=400x400");
        return cleaned;
      } catch (e) {
        console.warn(
          `[rakuten-images] ${target.id} error via ${endpoint.split("/").slice(-2).join("/")}: ${e.message}`,
        );
      }
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
