#!/usr/bin/env node
/**
 * 楽天 Ichiba Item Search API を叩いて、
 * products.ts の rakuten target 商品の画像URLを取得し、
 * src/lib/rakuten-images.generated.json に出力する。
 *
 * 必要な環境変数:
 *   RAKUTEN_APP_ID      = 楽天ウェブサービスのアプリID
 *   RAKUTEN_ACCESS_KEY  = アプリのアクセスキー(pk_xxxxx)
 *
 * 認証情報が無い/呼び出しに失敗した場合は、既存の generated.json を温存する。
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

const API_BASE =
  "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401";

const APP_ID = process.env.RAKUTEN_APP_ID;
const ACCESS_KEY = process.env.RAKUTEN_ACCESS_KEY;

const exists = (p) => access(p).then(() => true).catch(() => false);

/**
 * products.ts のソースから rakuten target を抽出する。
 * 各 target に対して、ファイルの中で「直前にある id: \"...\"」を商品IDとみなす。
 * 商品ブロック全体をパースする必要がないので nested brace に強い。
 */
function findRakutenTargets(source) {
  const results = [];
  const targetRegex =
    /target:\s*\{\s*network:\s*"rakuten"\s*,\s*shopCode:\s*"([^"]+)"\s*,\s*itemCode:\s*"([^"]+)"\s*,?\s*\}/g;
  let m;
  while ((m = targetRegex.exec(source)) !== null) {
    const shopCode = m[1];
    const itemCode = m[2];
    const before = source.slice(0, m.index);
    const ids = [...before.matchAll(/^\s*id:\s*"([^"]+)"/gm)];
    if (ids.length === 0) continue;
    const lastId = ids[ids.length - 1][1];
    results.push({ id: lastId, shopCode, itemCode });
  }
  // 同じ id が複数 target を持つケースを最初の1つに絞る
  const seen = new Set();
  return results.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

async function main() {
  if (!APP_ID || !ACCESS_KEY) {
    console.warn(
      "[rakuten-images] RAKUTEN_APP_ID / RAKUTEN_ACCESS_KEY が未設定。スキップします。",
    );
    if (!(await exists(OUTPUT_JSON))) {
      await writeFile(OUTPUT_JSON, "{}\n", "utf8");
    }
    return;
  }

  const source = await readFile(PRODUCTS_TS, "utf8");
  const targets = findRakutenTargets(source);

  console.log(
    `[rakuten-images] ${targets.length} products with rakuten target detected:`,
  );
  for (const t of targets) {
    console.log(`  - ${t.id}  (shop=${t.shopCode}, item=${t.itemCode})`);
  }

  if (targets.length === 0) {
    console.warn("[rakuten-images] 楽天ターゲットが見つからない。終了。");
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
    try {
      const url = new URL(API_BASE);
      url.searchParams.set("format", "json");
      url.searchParams.set("shopCode", t.shopCode);
      url.searchParams.set("itemCode", t.itemCode);
      url.searchParams.set("applicationId", APP_ID);
      url.searchParams.set("accessKey", ACCESS_KEY);

      const res = await fetch(url, {
        headers: {
          "User-Agent": "wanproblem-build",
          // 楽天 Webservice (ichibams) は Referer 必須。
          // アプリ登録時に設定したサイトURLを送る。
          Referer: process.env.NEXT_PUBLIC_SITE_URL ?? "https://wanproblem.com/",
        },
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.warn(
          `[rakuten-images] ${t.id}: HTTP ${res.status} ${body.slice(0, 160)}`,
        );
        failed++;
        continue;
      }

      const data = await res.json();
      const items = data.Items ?? [];
      const item = items[0]?.Item;
      if (!item) {
        console.warn(
          `[rakuten-images] ${t.id}: no Items in response (count=${items.length})`,
        );
        failed++;
        continue;
      }

      const raw =
        item.mediumImageUrls?.[0] ??
        item.smallImageUrls?.[0] ??
        item.images?.medium?.[0] ??
        item.images?.small?.[0];
      const imageUrl = typeof raw === "string" ? raw : raw?.imageUrl ?? "";

      if (!imageUrl) {
        console.warn(`[rakuten-images] ${t.id}: response had no image`);
        failed++;
        continue;
      }

      const cleaned = imageUrl
        .replace(/\?_ex=\d+x\d+/, "?_ex=400x400")
        .replace(/&_ex=\d+x\d+/, "&_ex=400x400");
      result[t.id] = cleaned;
      updated++;
      console.log(`[rakuten-images] ✓ ${t.id} → ${cleaned}`);
    } catch (e) {
      console.warn(`[rakuten-images] ${t.id}: error ${e.message}`);
      failed++;
    }
    await new Promise((r) => setTimeout(r, 400));
  }

  await writeFile(OUTPUT_JSON, JSON.stringify(result, null, 2) + "\n", "utf8");
  console.log(
    `[rakuten-images] DONE. total=${Object.keys(result).length} updated=${updated} failed=${failed}`,
  );
}

main().catch((e) => {
  console.error("[rakuten-images] fatal:", e);
  process.exit(0); // ビルド自体は止めない
});
