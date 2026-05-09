#!/usr/bin/env node
/**
 * amazon-bestsellers.generated.ts の nameJa を LLM でさらにクレンジング。
 *
 * 既存の build-amazon-bestsellers.mjs の regex クレンジングは
 * 「【】[]() の除去 + ホワイトスペース整理 + 末尾切り詰め」 までで、
 *
 *   "BELLA & PAL 犬用 ハーネス リード セット 小型犬 超小型犬 猫用ハーネス"
 *   → "BELLA & PAL 犬用 ハーネス リード セット 小型犬"
 *
 * のように冗長キーワードが残るケースがある。
 * 本スクリプトは LLM で「ブランド + 商品種別 + 主要属性 (3-5 単語)」 まで
 * 圧縮して、商品カードの readability を上げる。
 *
 * 使い方:
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/cleanup-product-names.mjs
 *
 * - 既に短くきれいな名前 (≤ 20 字) は LLM 通さない (コスト節約)
 * - 翻訳と独立 — 順序は cleanup → translate が望ましい
 *   (cleanup 後の nameJa が翻訳 input になるので品質安定)
 *
 * cost: 30 文字以上の対象を仮に 100 件、Sonnet 4.6 で ~$0.04 程度。
 */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { callMessages } from "./llm/anthropic.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const TARGET = resolve(
  here,
  "..",
  "src",
  "lib",
  "amazon-bestsellers.generated.ts",
);
const BATCH = 15;
const SHORT_ENOUGH = 20; // 20 字以下の名前は LLM 通さない (節約)

const SYSTEM = `あなたは EC 商品名のクリーンアップ編集者。日本語の犬用品名を、
商品カードに表示しやすい簡潔な日本語に書き換える。

入力: 番号付きリスト
出力: 同じ番号で書き換え後のみ。前置き・コードフェンス・説明文は出さない。

書き換えルール:
1. ブランド名 (Kong / Ruffwear / ペティオ / アイリスオーヤマ 等) は維持
2. 「ブランド + 商品種別 + 主要属性 1-2」 まで圧縮、目安 8-25 字
3. 重複・冗長キーワードを削る:
   - 「犬用 ハーネス 犬用胴輪」 → 「犬用ハーネス」
   - 「小型犬 中型犬 大型犬対応」 → 「全サイズ対応」 (短いほうへ)
   - 「引っ張り防止 反射材 通気性」 → 主要 1 つに絞る or 削除
4. 商品本来の意味を変えない (「クールベスト」 と 「ハーネス」 は混同しない)
5. ブランド不明な場合 (Generic) は商品種別だけ残す

例:
入力:
1. BaoCheng 犬ハーネス 犬用胴輪
2. BELLA & PAL 犬用 ハーネス リード セット 小型犬
3. ファーミネーター 中・大型犬 短毛種用
4. Kong コング L サイズ
出力:
1. BaoCheng 犬用ハーネス
2. BELLA & PAL ハーネス・リードセット
3. ファーミネーター 中大型犬用 (短毛)
4. Kong クラシック L`;

async function main() {
  const src = await readFile(TARGET, "utf8");
  const m = src.match(/export const \w+: Product\[\] = (\[[\s\S]*\]);/);
  if (!m) {
    console.error("Generated TS の Product 配列を抽出できませんでした");
    process.exit(1);
  }
  const arr = JSON.parse(m[1]);
  const todo = arr.filter((p) => p.nameJa.length > SHORT_ENOUGH);
  if (todo.length === 0) {
    console.log("[cleanup-product-names] 対象なし");
    return;
  }
  console.log(`[cleanup-product-names] ${todo.length} 商品をクレンジング`);

  let totalIn = 0;
  let totalOut = 0;
  for (let start = 0; start < todo.length; start += BATCH) {
    const batch = todo.slice(start, start + BATCH);
    const prompt = batch.map((p, i) => `${i + 1}. ${p.nameJa}`).join("\n");
    const reply = await callMessages({
      system: SYSTEM,
      userText: prompt,
      model: "claude-sonnet-4-6",
      maxTokens: 800,
    });
    totalIn += reply.usage?.input_tokens ?? 0;
    totalOut += reply.usage?.output_tokens ?? 0;
    const lines = reply.text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    for (const line of lines) {
      const lm = line.match(/^(\d+)\.\s*(.+)$/);
      if (!lm) continue;
      const idx = parseInt(lm[1], 10) - 1;
      const product = batch[idx];
      if (!product) continue;
      const cleaned = lm[2].trim();
      // 翻訳との順序整合性のため、nameEn が nameJa と等しい場合は同期する
      // (translate-products.mjs が後で nameEn を上書きする)
      if (product.nameEn === product.nameJa) {
        product.nameEn = cleaned;
      }
      product.nameJa = cleaned;
    }
    process.stderr.write(
      `  batch ${start / BATCH + 1}/${Math.ceil(todo.length / BATCH)} done\n`,
    );
  }

  const newJson = JSON.stringify(arr, null, 2);
  const newSrc = src.replace(m[1], newJson);
  await writeFile(TARGET, newSrc, "utf8");

  const cost = (totalIn * 3) / 1_000_000 + (totalOut * 15) / 1_000_000;
  console.log(
    `[cleanup-product-names] 完了。tokens in=${totalIn} out=${totalOut}、概算 $${cost.toFixed(4)}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
