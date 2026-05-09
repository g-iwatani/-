#!/usr/bin/env node
/**
 * Claude API でガイド記事の TS object literal を生成する。
 *
 * 使い方:
 *   node scripts/draft-guide.mjs \
 *     --slug="rainy-walk-guide" \
 *     --titleJa="雨の日の散歩グッズ完全ガイド" \
 *     --concerns="rainy-walk,cold-paws" \
 *     --categories="apparel,env"
 *
 * 出力 (stdout): src/lib/guides.ts の guides 配列に挿入できる Guide object literal。
 * stderr に usage / cost 概算を出す。
 *
 * 必要な環境変数: ANTHROPIC_API_KEY。GitHub Actions で動かす時は repo secret として登録。
 *
 * 編集ポリシー (生成 LLM への制約):
 *   - 「○○病に効く」 系の医療効果断定はしない
 *   - ★/レビュー数を捏造しない
 *   - 商品名は具体ブランドを呼ぶ前に編集者確認
 *
 * 生成後の手作業:
 *   1. 生成された TS を guides.ts に貼り付け
 *   2. publishedAt を当日に
 *   3. productQuery.concerns の整合性を concerns.ts と確認
 *   4. 必要なら editorialPicks (productIds) を手動で足す
 */

import { callMessages } from "./llm/anthropic.mjs";

function parseArgs(argv) {
  const out = {};
  for (const a of argv.slice(2)) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

const args = parseArgs(process.argv);
const slug = args.slug;
const titleJa = args.titleJa;
const concerns = (args.concerns ?? "").split(",").filter(Boolean);
const categories = (args.categories ?? "apparel").split(",").filter(Boolean);

if (!slug || !titleJa || concerns.length === 0) {
  console.error(
    "Usage: node scripts/draft-guide.mjs --slug=... --titleJa=... --concerns=a,b --categories=apparel,env",
  );
  process.exit(1);
}

const SYSTEM = `あなたは日本のアフィリエイト犬用品メディア「わんプロブレム」の編集部です。
読者は犬と暮らす日本の飼い主。
記事は「悩み解決のための買い物ガイド」として、ポイント解説 + おすすめ商品リスト + FAQ で構成されます。

絶対に守る制約:
1. 医療効果・治療効果を断定しない (「○○病に効く」 等を書かない)
2. ★ 評価・レビュー件数を捏造しない (本文中で具体数値を言及しない)
3. 「絶対」「最強」「100%」 等の景表法違反になり得る断定表現は使わない
4. 飼い主が即実行可能な具体策を書く (寒気温度・サイズ計測手順・年齢目安 等は数値で)
5. JP の犬種事情を踏まえる: 小型犬 70%、トイプー柴犬 etc

出力フォーマット: JSON。以下のスキーマに正確に従う。コードフェンス や説明文は出さず、JSON だけを返す。

{
  "leadJa": "200-300字、SEO 文として独立して読めるイントロ",
  "leadEn": "150-220 chars, English version",
  "points": [
    {
      "headlineJa": "20-30字の見出し",
      "headlineEn": "30-50 chars headline",
      "bodyJa": "100-150字の本文",
      "bodyEn": "180-260 chars body"
    }
    // 5 個
  ],
  "faq": [
    {
      "qJa": "...",
      "qEn": "...",
      "aJa": "...",
      "aEn": "..."
    }
    // 4 個
  ]
}`;

const USER = `スラグ: ${slug}
タイトル (ja): ${titleJa}
対象 concerns (concerns.ts の ID): ${concerns.join(", ")}
対象 productCategory: ${categories.join(", ")}

上記の JSON スキーマで生成してください。
ポイントは 5 個 (採寸 / 機能 / シーン別選び方 / 注意点 / 実践 Tips の構成が王道)。
FAQ は 4 個 (基礎知識 / サイズ・年齢 / 代替案 / メンテナンス が王道)。`;

const reply = await callMessages({
  system: SYSTEM,
  userText: USER,
  model: "claude-sonnet-4-6",
  maxTokens: 6000,
});

// LLM 応答から JSON だけ抽出
const jsonMatch = reply.text.match(/\{[\s\S]*\}/);
if (!jsonMatch) {
  console.error("LLM 応答から JSON を抽出できませんでした:");
  console.error(reply.text);
  process.exit(1);
}
let parsed;
try {
  parsed = JSON.parse(jsonMatch[0]);
} catch (e) {
  console.error("JSON parse error:", e.message);
  console.error(reply.text);
  process.exit(1);
}

// guides.ts に貼れる TS object literal を組み立てる
const today = new Date().toISOString().slice(0, 10);
const author = "わんプロブレム編集部";
const authorEn = "WanProblem editorial team";

const tsLiteral = `  {
    slug: ${JSON.stringify(slug)},
    titleJa: ${JSON.stringify(titleJa)},
    titleEn: ${JSON.stringify(titleJa)}, // TODO: 英語タイトルを手動で
    leadJa: ${JSON.stringify(parsed.leadJa)},
    leadEn: ${JSON.stringify(parsed.leadEn)},
    publishedAt: ${JSON.stringify(today)},
    authorJa: ${JSON.stringify(author)},
    authorEn: ${JSON.stringify(authorEn)},
    productQuery: {
      categories: ${JSON.stringify(categories)},
      concerns: ${JSON.stringify(concerns)},
      limit: 6,
    },
    sections: [
      { kind: "lead", bodyJa: "", bodyEn: "" },
      {
        kind: "points",
        titleJa: "選ぶ前に押さえる ${parsed.points.length} つのポイント",
        titleEn: "${parsed.points.length} things to check before you buy",
        itemsJa: ${JSON.stringify(parsed.points.map((p) => ({ headline: p.headlineJa, body: p.bodyJa })), null, 10).replace(/\n/g, "\n        ")},
        itemsEn: ${JSON.stringify(parsed.points.map((p) => ({ headline: p.headlineEn, body: p.bodyEn })), null, 10).replace(/\n/g, "\n        ")},
      },
      {
        kind: "top_picks",
        titleJa: "編集部のおすすめ",
        titleEn: "Editor's top picks",
        productIds: [], // TODO: 手動で editorial pick を入れる
      },
      {
        kind: "faq",
        titleJa: "よくある質問",
        titleEn: "FAQ",
        itemsJa: ${JSON.stringify(parsed.faq.map((f) => ({ q: f.qJa, a: f.aJa })), null, 10).replace(/\n/g, "\n        ")},
        itemsEn: ${JSON.stringify(parsed.faq.map((f) => ({ q: f.qEn, a: f.aEn })), null, 10).replace(/\n/g, "\n        ")},
      },
    ],
  },`;

console.log(tsLiteral);

// usage は stderr に
const u = reply.usage ?? {};
console.error(
  `\n[usage] input=${u.input_tokens} output=${u.output_tokens} cache_read=${reply.cache_read} cache_create=${reply.cache_create}`,
);
const inputCost = ((u.input_tokens ?? 0) * 3) / 1_000_000;
const outputCost = ((u.output_tokens ?? 0) * 15) / 1_000_000;
console.error(
  `[cost-estimate] $${(inputCost + outputCost).toFixed(4)} (Sonnet 4.6 単価ベース)`,
);
