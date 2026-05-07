#!/usr/bin/env node
/**
 * 楽天 Ichiba Item Search API を叩いて、
 * products.ts の rakuten target 商品の画像URLを取得し、
 * src/lib/rakuten-images.generated.json に出力する。
 *
 * 必要な環境変数:
 *   RAKUTEN_APP_ID      = 楽天ウェブサービスのアプリID(UUID形式)
 *   RAKUTEN_ACCESS_KEY  = アプリのアクセスキー(pk_xxxxx)
 *
 * 使い方:
 *   node scripts/fetch-rakuten-images.mjs   # 通常実行(ビルド前に呼ばれる)
 *
 * 認証情報が無い/呼び出しに失敗した場合は、既存の generated.json を温存する。
 * → 認証情報を入れる前のビルドが壊れない。
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

function exists(p) {
  return access(p).then(() => true).catch(() => false);
}

async function main() {
  if (!APP_ID || !ACCESS_KEY) {
    console.warn(
      "[rakuten-images] RAKUTEN_APP_ID / RAKUTEN_ACCESS_KEY が未設定。スキップします。",
    );
    if (!(await exists(OUTPUT_JSON))) {
      // 空のファイルを置いて products.ts のインポートが壊れないようにする
      await writeFile(OUTPUT_JSON, "{}\n", "utf8");
    }
    return;
  }

  const source = await readFile(PRODUCTS_TS, "utf8");

  // 各商品ブロックから id と楽天 target を抽出する
  // id: "xxx" ... shopCode: "yyy", itemCode: "zzz"
  const targets = [];
  const productEntryRegex = /\{\s*\n\s*id:\s*"([^"]+)"[\s\S]*?\}/g;
  let match;
  while ((match = productEntryRegex.exec(source)) !== null) {
    const block = match[0];
    const id = match[1];
    const rakuten = block.match(
      /target:\s*\{\s*network:\s*"rakuten",\s*shopCode:\s*"([^"]+)",\s*itemCode:\s*"([^"]+)"\s*\}/,
    );
    if (rakuten) {
      targets.push({ id, shopCode: rakuten[1], itemCode: rakuten[2] });
    }
  }

  console.log(
    `[rakuten-images] ${targets.length} products with rakuten target detected`,
  );

  // 既存JSONをロード(失敗してもOK)
  let result = {};
  try {
    const existing = await readFile(OUTPUT_JSON, "utf8");
    result = JSON.parse(existing);
  } catch {
    result = {};
  }

  let updated = 0;
  for (const t of targets) {
    try {
      const url = new URL(API_BASE);
      url.searchParams.set("format", "json");
      url.searchParams.set("shopCode", t.shopCode);
      url.searchParams.set("itemCode", t.itemCode);
      url.searchParams.set("applicationId", APP_ID);
      url.searchParams.set("accessKey", ACCESS_KEY);

      const res = await fetch(url, { headers: { "User-Agent": "wanproblem-build" } });
      if (!res.ok) {
        console.warn(
          `[rakuten-images] ${t.id} (${t.shopCode}/${t.itemCode}) HTTP ${res.status}`,
        );
        continue;
      }
      const data = await res.json();
      const items = data.Items ?? [];
      const item = items[0]?.Item;
      if (!item) {
        console.warn(`[rakuten-images] ${t.id} no items returned`);
        continue;
      }
      // mediumImageUrls は文字列配列で返ってくる(古い形式) または
      // [{ imageUrl }] のオブジェクト配列で返ってくる(新しい形式)
      const raw =
        item.mediumImageUrls?.[0] ??
        item.smallImageUrls?.[0] ??
        item.images?.medium?.[0];
      const imageUrl = typeof raw === "string" ? raw : raw?.imageUrl ?? "";
      if (!imageUrl) {
        console.warn(`[rakuten-images] ${t.id} no image url in response`);
        continue;
      }
      // ?_ex=128x128 のサイズ指定を 400x400 に上げる
      const cleaned = imageUrl
        .replace(/\?_ex=\d+x\d+/, "?_ex=400x400")
        .replace(/&_ex=\d+x\d+/, "&_ex=400x400");
      result[t.id] = cleaned;
      updated++;
    } catch (e) {
      console.warn(`[rakuten-images] ${t.id} error:`, e.message);
    }
    // 楽天API のレートリミット回避
    await new Promise((r) => setTimeout(r, 400));
  }

  await writeFile(OUTPUT_JSON, JSON.stringify(result, null, 2) + "\n", "utf8");
  console.log(
    `[rakuten-images] wrote ${Object.keys(result).length} entries (${updated} updated this run)`,
  );
}

main().catch((e) => {
  console.error("[rakuten-images] fatal:", e);
  process.exit(0); // ビルド自体は止めない
});
