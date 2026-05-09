#!/usr/bin/env node
/**
 * amazon-bestsellers.generated.ts の nameEn を nameJa から LLM 翻訳する。
 * 翻訳済み (nameJa !== nameEn) は飛ばす。バッチ化して API 呼び出し回数を最小化。
 *
 * 使い方:
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/translate-products.mjs
 *
 * CI で動かす想定: monthly-data-refresh.yml に組み込めば、CSV 取込後に
 * 自動で翻訳まで走らせられる。Sonnet 4.6 で 135 商品 ≈ $0.05 程度。
 *
 * 翻訳ポリシー (system prompt 制約):
 *   - ブランド名はそのまま (Amazon → Amazon、Kong → Kong)
 *   - 過剰な意訳は避け「商品種別 + 主要特徴」 を端的に
 *   - 30 文字以内 (商品カード幅で line-clamp なしで収まる)
 *
 * 設計上の選択: 翻訳結果は generated.ts に直接書き込む。CSV 更新で再生成
 * された時は monthly cron で再実行される前提。
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

const SYSTEM = `あなたは EC 商品タイトルの ja → en 翻訳エディタです。

入力: 日本語の犬用品商品名のリスト (1 行 1 タイトル、行頭に番号)
出力: 同じ番号付きで英訳のみを 1 行 1 件、説明文や前置きは出さない

翻訳の原則:
1. ブランド名 (Kong / Ruffwear / Petio / アイリスオーヤマ 等) は本来の英語表記を保つ
2. アイテム種別 + 主要属性に絞る (3-6 単語が目安)
3. 30 文字以内
4. 英語ネイティブが商品検索に使う一般的な語彙で
   - 「ハーネス」 → "harness" (not "body harness" 等冗長表現)
   - 「クールマット」 → "cooling mat"
5. メーカー側の英語名が定着している場合はそれを優先 (e.g. "Hurtta Summit Parka")
6. ジャンク的な日本語キーワード (引っ張り防止 / 反射材 等) は端的な英語に集約
7. 推測できないブランド/モデル名は ja のローマ字化はせず、ブランド未明な場合は "Dog harness" 等のジェネリック名で逃げる

例:
入力:
1. BaoCheng 犬ハーネス 犬用胴輪
2. ファーミネーター 中・大型犬 短毛種用
3. Kong コング L サイズ
出力:
1. BaoCheng dog harness
2. FURminator for medium-to-large short-haired dogs
3. Kong Classic L`;

async function main() {
  const src = await readFile(TARGET, "utf8");
  // ファイル先頭の "= [" 以降が JSON 構造。コメント等を含まないので JSON.parse 可。
  const m = src.match(/export const \w+: Product\[\] = (\[[\s\S]*\]);/);
  if (!m) {
    console.error("Generated TS の Product 配列を抽出できませんでした");
    process.exit(1);
  }
  const arr = JSON.parse(m[1]);
  const todo = arr.filter((p) => p.nameJa === p.nameEn);
  if (todo.length === 0) {
    console.log("[translate-products] 翻訳必要なし (全件 nameEn 設定済)");
    return;
  }
  console.log(`[translate-products] ${todo.length} 商品を翻訳します`);

  let totalIn = 0,
    totalOut = 0;
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
      product.nameEn = lm[2].trim();
    }
    process.stderr.write(
      `  batch ${start / BATCH + 1}/${Math.ceil(todo.length / BATCH)} done\n`,
    );
  }

  // 元配列は参照同一性で繋がっているので arr のシリアライズで反映される
  const newJson = JSON.stringify(arr, null, 2);
  const newSrc = src.replace(m[1], newJson);
  await writeFile(TARGET, newSrc, "utf8");

  const cost = (totalIn * 3) / 1_000_000 + (totalOut * 15) / 1_000_000;
  console.log(
    `[translate-products] 完了。tokens in=${totalIn} out=${totalOut}、概算 $${cost.toFixed(4)}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
