#!/usr/bin/env node
/**
 * Amazon.co.jp 売れ筋ランキング CSV (browser Claude が手動で抽出した物) を
 * 読み込み、Product[] 形式の TS ファイルを生成する。
 *
 * 入力: scripts/amazon-bestsellers.csv (asin,brand,name,priceJpy,imageUrl,category,concerns)
 * 出力: src/lib/amazon-bestsellers.generated.ts
 *
 * - browser Claude の独自 concern 語彙を本サイトの concerns.ts ID にマッピング
 * - small-dog/medium-dog/large-dog 系の "concern" は fitsBreedSizes に振り替え
 * - ブランド欄が「犬」「猫」等のパース失敗行はスキップ
 * - 生成された商品は rawProducts に spread されて products.ts の主リストに合流する
 */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const INPUT_CSV = resolve(here, "amazon-bestsellers.csv");
const OUTPUT_TS = resolve(
  here,
  "..",
  "src",
  "lib",
  "amazon-bestsellers.generated.ts",
);

// 売れ筋カテゴリ → 本サイトの ProductCategory
const CATEGORY_MAP = {
  harness: "apparel",
  leash: "apparel",
  apparel: "apparel",
  "toy-ball": "toy",
  chew: "toy",
  bed: "env",
  bowl: "env",
  pad: "env",
  grooming: "env",
  dental: "env",
};

// 売れ筋カテゴリ → 表示用絵文字 (imageUrl が無いとき用)
const EMOJI_MAP = {
  harness: "🦮",
  leash: "🪢",
  apparel: "🧥",
  "toy-ball": "🎾",
  chew: "🦴",
  bed: "🛏️",
  bowl: "🥣",
  pad: "🧻",
  grooming: "🪮",
  dental: "🦷",
};

// 売れ筋カテゴリ → デフォルト カラーパレット
const PALETTE_MAP = {
  harness: { from: "#5C7548", to: "#2E3D24" },
  leash: { from: "#7A5A28", to: "#4A3318" },
  apparel: { from: "#C84540", to: "#7A2520" },
  "toy-ball": { from: "#F5A623", to: "#B07420" },
  chew: { from: "#9B7B3F", to: "#5A4520" },
  bed: { from: "#6B8E9E", to: "#2C4856" },
  bowl: { from: "#8B5A3C", to: "#4A2E20" },
  pad: { from: "#E8E4D8", to: "#A8A498" },
  grooming: { from: "#7A8FB0", to: "#3A4868" },
  dental: { from: "#E0D8C0", to: "#8A8470" },
};

// browser Claude の独自 concern 語彙 → concerns.ts の ID
// 該当無しは null (drop)
const CONCERN_MAP = {
  // breed sizes (drop from concerns, transferred to fitsBreedSizes elsewhere)
  "small-dog": "__BREED_SMALL__",
  "medium-dog": "__BREED_MEDIUM__",
  "large-dog": "__BREED_LARGE__",
  // direct mappings
  "pulling-training": "pulls-leash",
  "joint-care": "senior-dog",
  "mental-stim": "destroys-toys",
  odor: "dental-care",
  "leak-proof": "potty-training",
  "slow-feed": "fast-eater",
  shedding: "heavy-shedding",
  senior: "senior-dog",
  rain: "rainy-walk",
  travel: "travel-car",
  puppy: "puppy",
  "cold-winter": "cold-winter",
  "hot-summer": "hot-summer",
  "dental-care": "dental-care",
  // drops (no equivalent)
  "night-walk": null,
  "trachea-care": null,
  safety: null,
};

// パース失敗のブランド (browser Claude が name の先頭文字を brand に取り出した)
const SKIP_BRANDS = new Set(["犬", "猫", "NC", "犬服"]);

// rank 1 が popularity 80, rank 15 が popularity 50 になるよう線形補間
const popularityFromRank = (rank) =>
  Math.round(80 - ((rank - 1) * (80 - 50)) / 14);

function parseCsv(text) {
  // 最初の BOM 除去
  text = text.replace(/^﻿/, "");
  const rows = [];
  const lines = text.split(/\r?\n/);
  const header = parseCsvLine(lines[0]);
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const fields = parseCsvLine(line);
    const row = {};
    header.forEach((h, idx) => (row[h] = fields[idx] ?? ""));
    rows.push(row);
  }
  return rows;
}

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === ",") {
        out.push(cur);
        cur = "";
      } else if (ch === '"' && cur === "") {
        inQuotes = true;
      } else {
        cur += ch;
      }
    }
  }
  out.push(cur);
  return out;
}

function slugifyAsin(asin) {
  return asin.toLowerCase();
}

/**
 * Amazon 商品タイトル特有のキーワードスパム / 販促プレフィックスを剥がして、
 * 「ブランド + 商品種別 + 主要特徴」 程度の 35 字以内に整形する。
 *
 * 入力例: "【Amazon.co.jp限定】BaoCheng 犬ハーネス 犬用胴輪 小型犬/中型犬/大型犬ハーネス..."
 * 出力例: "BaoCheng 犬ハーネス 犬用胴輪 小型犬"
 */
function cleanProductName(raw) {
  let s = raw;
  // 1. 販促バッジ・括弧書きを除去
  s = s.replace(/【[^】]*】/g, " ");
  s = s.replace(/\[[^\]]*\]/g, " ");
  s = s.replace(/\([^)]*\)/g, " ");
  s = s.replace(/（[^）]*）/g, " ");
  s = s.replace(/「[^」]*」/g, " ");
  // 2. 連続空白を 1 つに
  s = s.replace(/\s+/g, " ").trim();
  // 3. 区切り文字で先頭セグメントだけ拾う (12 字以上ある場合のみ)
  for (const cut of ["、", ",", "｜", "|"]) {
    const parts = s.split(cut);
    if (parts.length > 1 && parts[0].trim().length >= 12) {
      s = parts[0].trim();
      break;
    }
  }
  // 4. ハード上限。最後の空白で切ってお尻が変にならないように
  const MAX = 35;
  if (s.length > MAX) {
    const cut = s.lastIndexOf(" ", MAX - 2);
    if (cut > 12) {
      s = s.slice(0, cut);
    } else {
      s = s.slice(0, MAX - 1) + "…";
    }
  }
  return s.trim();
}

function brandToCountry(brand) {
  // 雑だが生成ファイルなのでヒューリスティクスで OK
  if (/[ぁ-んァ-ヶ一-龯]/.test(brand)) return "JP";
  if (/Kong|PetSafe|Outward|Furminator|Hartz|Greenies|Ruffwear/i.test(brand))
    return "US";
  return "Unknown";
}

function buildProduct(row, rank) {
  const asin = row.asin.trim();
  const brand = row.brand.trim();
  const name = row.name.trim();
  const priceJpy = parseInt(row.priceJpy, 10) || 0;
  const imageUrl = row.imageUrl.trim();
  const cat = row.category.trim();
  const productCategory = CATEGORY_MAP[cat];
  if (!productCategory) return null;

  const rawConcerns = row.concerns
    .split("|")
    .map((c) => c.trim())
    .filter(Boolean);

  const concerns = [];
  const fitsBreedSizes = [];
  for (const c of rawConcerns) {
    const mapped = CONCERN_MAP[c];
    if (mapped === undefined) continue; // unknown concern, drop
    if (mapped === null) continue; // explicitly dropped
    if (mapped === "__BREED_SMALL__") {
      fitsBreedSizes.push("small", "tiny");
    } else if (mapped === "__BREED_MEDIUM__") {
      fitsBreedSizes.push("medium");
    } else if (mapped === "__BREED_LARGE__") {
      fitsBreedSizes.push("large", "giant");
    } else {
      concerns.push(mapped);
    }
  }
  // dedupe
  const uniqConcerns = [...new Set(concerns)];
  const uniqBreedSizes = [...new Set(fitsBreedSizes)];

  // breed size 指定なし = 全犬種対応 (空配列 = 全犬種というのが既存コード規約)
  const finalBreedSizes = uniqBreedSizes.length === 4 ? [] : uniqBreedSizes;

  const cleanedName = cleanProductName(name);
  // descJa: クリーン名より長い "もう少し情報があるバージョン" を狙う
  const descJa =
    name.length > 80
      ? name
          .replace(/【[^】]*】/g, "")
          .replace(/\([^)]*\)/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 80) + "…"
      : name;

  return {
    id: `amz-${cat}-${slugifyAsin(asin)}`,
    brand,
    brandCountry: brandToCountry(brand),
    nameJa: cleanedName,
    nameEn: cleanedName, // CSV に英名なし
    descJa,
    descEn: "",
    category: productCategory,
    sizes: [], // ランキングからはサイズ抽出不可
    concerns: uniqConcerns,
    fitsBreedSizes: finalBreedSizes,
    buyOptions: [
      {
        shop: "Amazon",
        target: { network: "amazon-jp", asin },
        priceJpy,
        region: "jp",
      },
    ],
    popularity: popularityFromRank(rank),
    imageUrl,
    imagePalette: PALETTE_MAP[cat] ?? { from: "#888", to: "#444" },
    imageEmoji: EMOJI_MAP[cat] ?? "📦",
    tagsJa: [],
    tagsEn: [],
  };
}

async function main() {
  const csv = await readFile(INPUT_CSV, "utf8");
  const rows = parseCsv(csv);

  // 各カテゴリ内の rank を再生成 (CSV は category 順に並んでいる前提だが念のため計算)
  const rankMap = new Map(); // category -> running counter
  const products = [];
  let skippedBrand = 0;
  let skippedCategory = 0;
  for (const row of rows) {
    if (SKIP_BRANDS.has(row.brand.trim())) {
      skippedBrand++;
      continue;
    }
    const cat = row.category.trim();
    const rank = (rankMap.get(cat) ?? 0) + 1;
    rankMap.set(cat, rank);
    const p = buildProduct(row, rank);
    if (!p) {
      skippedCategory++;
      continue;
    }
    products.push(p);
  }

  // 出力
  const banner = `// AUTO-GENERATED by scripts/build-amazon-bestsellers.mjs — DO NOT EDIT.\n// Source: scripts/amazon-bestsellers.csv (Amazon JP bestsellers, manually curated).\n\nimport type { Product } from "./products";\n\nexport const amazonBestsellers: Product[] = `;

  // Manually serialize so we get clean TS (JSON.stringify gives valid TS for plain objects)
  const body = JSON.stringify(products, null, 2);
  await writeFile(OUTPUT_TS, banner + body + ";\n");

  console.log(`Generated ${products.length} products → ${OUTPUT_TS}`);
  console.log(`Skipped: ${skippedBrand} (junk brand), ${skippedCategory} (unknown category)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
