export type ProductCategory = "apparel" | "toy" | "env";

export type ProductSize = {
  label: string; // e.g. "S", "M", "3", "XS"
  chestMin: number;
  chestMax: number;
  backMin: number;
  backMax: number;
  neckMin: number;
  neckMax: number;
};

export type BuyOption = {
  shop: string; // e.g. "楽天", "Amazon", "公式"
  url: string; // affiliate URL (mock #)
  priceJpy: number;
  priceUsd?: number;
  region: "jp" | "global";
};

export type Product = {
  id: string;
  brand: string;
  brandCountry: string;
  nameJa: string;
  nameEn: string;
  descJa: string;
  descEn: string;
  category: ProductCategory;
  sizes: ProductSize[];
  /** 適合する困りごとID(concerns.tsのID) */
  concerns: string[];
  /** 適合する犬種ID(空配列 = 全犬種対応) */
  fitsBreedSizes: ("tiny" | "small" | "medium" | "large" | "giant")[];
  buyOptions: BuyOption[];
  popularity: number; // 0-100
  imagePalette: { from: string; to: string };
  imageEmoji: string;
  tagsJa: string[];
  tagsEn: string[];
};

/**
 * モック商品データ。MVPはアフィリエイトリンクを # にしておく。
 * 各SKUのサイズはブランドサイトを参考にした想定値。
 */
export const products: Product[] = [
  // ─── 服 (apparel) ────────────────────────────────────────
  {
    id: "ruffwear-overcoat-utility",
    brand: "Ruffwear",
    brandCountry: "US",
    nameJa: "オーバーコート ユーティリティ",
    nameEn: "Overcoat Utility",
    descJa:
      "撥水・防風・保温の3拍子。アウトドア犬の冬を支える定番ジャケット。",
    descEn:
      "Water-shedding, wind-blocking, insulating. A workhorse winter jacket.",
    category: "apparel",
    sizes: [
      {
        label: "XS",
        chestMin: 43,
        chestMax: 56,
        backMin: 30,
        backMax: 38,
        neckMin: 30,
        neckMax: 40,
      },
      {
        label: "S",
        chestMin: 56,
        chestMax: 69,
        backMin: 38,
        backMax: 46,
        neckMin: 36,
        neckMax: 46,
      },
      {
        label: "M",
        chestMin: 69,
        chestMax: 81,
        backMin: 46,
        backMax: 56,
        neckMin: 41,
        neckMax: 51,
      },
      {
        label: "L",
        chestMin: 81,
        chestMax: 94,
        backMin: 53,
        backMax: 64,
        neckMin: 46,
        neckMax: 56,
      },
    ],
    concerns: ["cold-winter", "rainy-walk", "active-sports"],
    fitsBreedSizes: ["small", "medium", "large"],
    buyOptions: [
      { shop: "公式", url: "#", priceJpy: 14800, priceUsd: 99, region: "global" },
      { shop: "Amazon", url: "#", priceJpy: 13900, priceUsd: 95, region: "global" },
    ],
    popularity: 88,
    imagePalette: { from: "#5C7548", to: "#2E3D24" },
    imageEmoji: "🧥",
    tagsJa: ["防寒", "撥水", "アウトドア"],
    tagsEn: ["winter", "water-resistant", "outdoor"],
  },
  {
    id: "hurtta-summit-parka",
    brand: "Hurtta",
    brandCountry: "FI",
    nameJa: "サミットパーカ",
    nameEn: "Summit Parka",
    descJa:
      "極寒対応。フィンランド発、本気の冬装備。シェルティから大型犬まで。",
    descEn:
      "Built for sub-zero. A serious winter parka straight from Finland.",
    category: "apparel",
    sizes: [
      {
        label: "30cm",
        chestMin: 40,
        chestMax: 52,
        backMin: 28,
        backMax: 34,
        neckMin: 28,
        neckMax: 38,
      },
      {
        label: "40cm",
        chestMin: 52,
        chestMax: 66,
        backMin: 36,
        backMax: 44,
        neckMin: 34,
        neckMax: 46,
      },
      {
        label: "55cm",
        chestMin: 66,
        chestMax: 82,
        backMin: 50,
        backMax: 60,
        neckMin: 40,
        neckMax: 54,
      },
      {
        label: "70cm",
        chestMin: 82,
        chestMax: 100,
        backMin: 64,
        backMax: 76,
        neckMin: 48,
        neckMax: 64,
      },
    ],
    concerns: ["cold-winter", "active-sports"],
    fitsBreedSizes: ["small", "medium", "large", "giant"],
    buyOptions: [
      { shop: "公式", url: "#", priceJpy: 19800, priceUsd: 135, region: "global" },
      { shop: "楽天", url: "#", priceJpy: 18500, region: "jp" },
    ],
    popularity: 75,
    imagePalette: { from: "#3D5466", to: "#1F2A36" },
    imageEmoji: "❄️",
    tagsJa: ["極寒", "防水", "プレミアム"],
    tagsEn: ["sub-zero", "waterproof", "premium"],
  },
  {
    id: "canada-pooch-cool-vest",
    brand: "Canada Pooch",
    brandCountry: "CA",
    nameJa: "クールベスト",
    nameEn: "Chill Seeker Cool Vest",
    descJa:
      "水で濡らして着せるだけ。気化熱で体温を下げる夏の救世主。",
    descEn:
      "Soak, wring, wear. Evaporative cooling for hot summer walks.",
    category: "apparel",
    sizes: [
      {
        label: "XXS",
        chestMin: 27,
        chestMax: 35,
        backMin: 20,
        backMax: 25,
        neckMin: 20,
        neckMax: 26,
      },
      {
        label: "XS",
        chestMin: 35,
        chestMax: 44,
        backMin: 25,
        backMax: 32,
        neckMin: 25,
        neckMax: 32,
      },
      {
        label: "S",
        chestMin: 44,
        chestMax: 56,
        backMin: 32,
        backMax: 40,
        neckMin: 30,
        neckMax: 40,
      },
      {
        label: "M",
        chestMin: 56,
        chestMax: 70,
        backMin: 40,
        backMax: 50,
        neckMin: 38,
        neckMax: 50,
      },
      {
        label: "L",
        chestMin: 70,
        chestMax: 85,
        backMin: 50,
        backMax: 60,
        neckMin: 46,
        neckMax: 58,
      },
    ],
    concerns: ["hot-summer", "active-sports"],
    fitsBreedSizes: ["tiny", "small", "medium", "large"],
    buyOptions: [
      { shop: "公式", url: "#", priceJpy: 7800, priceUsd: 52, region: "global" },
      { shop: "Amazon", url: "#", priceJpy: 8200, priceUsd: 55, region: "global" },
    ],
    popularity: 91,
    imagePalette: { from: "#7BB6CC", to: "#3A6E84" },
    imageEmoji: "💧",
    tagsJa: ["夏対策", "気化熱", "アウトドア"],
    tagsEn: ["summer", "cooling", "outdoor"],
  },
  {
    id: "mandarine-bros-raincoat",
    brand: "Mandarine Brothers",
    brandCountry: "JP",
    nameJa: "ハイブリッドレインコート",
    nameEn: "Hybrid Raincoat",
    descJa:
      "脚まで覆う4本足タイプのレインコート。雨の日の散歩を変える1着。",
    descEn:
      "Four-leg coverage rain suit. Walks in the rain finally make sense.",
    category: "apparel",
    sizes: [
      {
        label: "SS",
        chestMin: 28,
        chestMax: 36,
        backMin: 21,
        backMax: 25,
        neckMin: 19,
        neckMax: 25,
      },
      {
        label: "S",
        chestMin: 36,
        chestMax: 44,
        backMin: 25,
        backMax: 30,
        neckMin: 23,
        neckMax: 30,
      },
      {
        label: "M",
        chestMin: 44,
        chestMax: 54,
        backMin: 30,
        backMax: 36,
        neckMin: 28,
        neckMax: 36,
      },
      {
        label: "L",
        chestMin: 54,
        chestMax: 64,
        backMin: 36,
        backMax: 42,
        neckMin: 33,
        neckMax: 42,
      },
    ],
    concerns: ["rainy-walk", "small-breed"],
    fitsBreedSizes: ["tiny", "small", "medium"],
    buyOptions: [
      { shop: "楽天", url: "#", priceJpy: 5980, region: "jp" },
      { shop: "Amazon", url: "#", priceJpy: 6280, region: "jp" },
    ],
    popularity: 82,
    imagePalette: { from: "#E8C975", to: "#A88930" },
    imageEmoji: "☔",
    tagsJa: ["雨の日", "全身カバー", "国産"],
    tagsEn: ["rainy", "full-body", "japanese"],
  },
  {
    id: "free-stitch-bigtee",
    brand: "Free Stitch",
    brandCountry: "JP",
    nameJa: "ビッグTシャツ",
    nameEn: "Oversized Tee",
    descJa:
      "ゆったり着られる、抜け毛キャッチも兼ねたデイリーTシャツ。",
    descEn:
      "Loose-fit daily tee that doubles as a fur-shedding cover.",
    category: "apparel",
    sizes: [
      {
        label: "XS",
        chestMin: 26,
        chestMax: 34,
        backMin: 20,
        backMax: 25,
        neckMin: 18,
        neckMax: 24,
      },
      {
        label: "S",
        chestMin: 34,
        chestMax: 42,
        backMin: 25,
        backMax: 30,
        neckMin: 22,
        neckMax: 30,
      },
      {
        label: "M",
        chestMin: 42,
        chestMax: 52,
        backMin: 30,
        backMax: 36,
        neckMin: 28,
        neckMax: 36,
      },
      {
        label: "L",
        chestMin: 52,
        chestMax: 62,
        backMin: 36,
        backMax: 42,
        neckMin: 32,
        neckMax: 42,
      },
    ],
    concerns: ["cute-outing", "small-breed", "senior-dog"],
    fitsBreedSizes: ["tiny", "small", "medium"],
    buyOptions: [{ shop: "楽天", url: "#", priceJpy: 3980, region: "jp" }],
    popularity: 68,
    imagePalette: { from: "#E8D5C0", to: "#B89070" },
    imageEmoji: "👕",
    tagsJa: ["デイリー", "ナチュラル", "国産"],
    tagsEn: ["daily", "natural", "japanese"],
  },
  {
    id: "alphaicon-down",
    brand: "ALPHAICON",
    brandCountry: "JP",
    nameJa: "ライトダウンコート",
    nameEn: "Light Down Coat",
    descJa:
      "国産ダウンの軽量防寒着。MIX犬・小型犬の細部までフィットするパターン。",
    descEn:
      "Featherweight Japanese down. Cut to fit small and mixed breeds.",
    category: "apparel",
    sizes: [
      {
        label: "1",
        chestMin: 28,
        chestMax: 34,
        backMin: 20,
        backMax: 24,
        neckMin: 18,
        neckMax: 24,
      },
      {
        label: "2",
        chestMin: 34,
        chestMax: 40,
        backMin: 24,
        backMax: 28,
        neckMin: 22,
        neckMax: 28,
      },
      {
        label: "3",
        chestMin: 40,
        chestMax: 48,
        backMin: 28,
        backMax: 33,
        neckMin: 26,
        neckMax: 33,
      },
      {
        label: "4",
        chestMin: 48,
        chestMax: 58,
        backMin: 33,
        backMax: 40,
        neckMin: 32,
        neckMax: 40,
      },
    ],
    concerns: ["cold-winter", "small-breed", "mix-fit"],
    fitsBreedSizes: ["tiny", "small", "medium"],
    buyOptions: [{ shop: "楽天", url: "#", priceJpy: 8800, region: "jp" }],
    popularity: 79,
    imagePalette: { from: "#C9B89E", to: "#8B7048" },
    imageEmoji: "🧥",
    tagsJa: ["防寒", "軽量", "MIX犬◯"],
    tagsEn: ["winter", "lightweight", "mix-friendly"],
  },
  {
    id: "milkypaws-summer-dress",
    brand: "milkypaws",
    brandCountry: "JP",
    nameJa: "サマーリネンドレス",
    nameEn: "Summer Linen Dress",
    descJa:
      "リネン100%のさらりとしたドレス。お出かけ・撮影に。",
    descEn:
      "Pure linen, breezy and photogenic. For outings and photos.",
    category: "apparel",
    sizes: [
      {
        label: "XS",
        chestMin: 26,
        chestMax: 32,
        backMin: 20,
        backMax: 24,
        neckMin: 18,
        neckMax: 23,
      },
      {
        label: "S",
        chestMin: 32,
        chestMax: 40,
        backMin: 24,
        backMax: 30,
        neckMin: 22,
        neckMax: 28,
      },
      {
        label: "M",
        chestMin: 40,
        chestMax: 48,
        backMin: 30,
        backMax: 36,
        neckMin: 26,
        neckMax: 34,
      },
    ],
    concerns: ["cute-outing", "hot-summer", "small-breed"],
    fitsBreedSizes: ["tiny", "small"],
    buyOptions: [{ shop: "楽天", url: "#", priceJpy: 5400, region: "jp" }],
    popularity: 72,
    imagePalette: { from: "#F5DCE0", to: "#C28490" },
    imageEmoji: "👗",
    tagsJa: ["夏", "お出かけ", "リネン"],
    tagsEn: ["summer", "outing", "linen"],
  },
  {
    id: "fuzzyard-fleece",
    brand: "FuzzYard",
    brandCountry: "AU",
    nameJa: "フリースパーカ",
    nameEn: "Fleece Hoodie",
    descJa:
      "ダブルフリースの軽量パーカ。秋〜春の3シーズン使えるデイリーアウター。",
    descEn:
      "Double-fleece hoodie. A 3-season daily layer with quiet style.",
    category: "apparel",
    sizes: [
      {
        label: "XS",
        chestMin: 30,
        chestMax: 38,
        backMin: 22,
        backMax: 26,
        neckMin: 20,
        neckMax: 26,
      },
      {
        label: "S",
        chestMin: 38,
        chestMax: 48,
        backMin: 26,
        backMax: 32,
        neckMin: 24,
        neckMax: 32,
      },
      {
        label: "M",
        chestMin: 48,
        chestMax: 58,
        backMin: 32,
        backMax: 40,
        neckMin: 30,
        neckMax: 40,
      },
      {
        label: "L",
        chestMin: 58,
        chestMax: 70,
        backMin: 40,
        backMax: 50,
        neckMin: 36,
        neckMax: 48,
      },
    ],
    concerns: ["cold-winter", "cute-outing"],
    fitsBreedSizes: ["tiny", "small", "medium"],
    buyOptions: [
      { shop: "公式", url: "#", priceJpy: 6900, priceUsd: 45, region: "global" },
      { shop: "Amazon", url: "#", priceJpy: 7400, priceUsd: 49, region: "global" },
    ],
    popularity: 70,
    imagePalette: { from: "#A8C0BC", to: "#5A7570" },
    imageEmoji: "🧶",
    tagsJa: ["軽防寒", "デイリー", "3シーズン"],
    tagsEn: ["light-warm", "daily", "3-season"],
  },
  // ─── おもちゃ (toy) ────────────────────────────────────────
  {
    id: "kong-classic",
    brand: "Kong",
    brandCountry: "US",
    nameJa: "クラシック コング",
    nameEn: "Kong Classic",
    descJa:
      "中におやつを詰めて長時間集中。留守番・分離不安の定番アイテム。",
    descEn:
      "Stuff with treats for long focus. The classic anti-boredom toy.",
    category: "toy",
    sizes: [
      { label: "XS", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["lonely-when-alone", "destroys-toys"],
    fitsBreedSizes: ["tiny", "small", "medium", "large"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 1280, priceUsd: 9, region: "global" },
      { shop: "楽天", url: "#", priceJpy: 1380, region: "jp" },
    ],
    popularity: 95,
    imagePalette: { from: "#D44D3A", to: "#7A2A1E" },
    imageEmoji: "🦴",
    tagsJa: ["定番", "知育", "頑丈"],
    tagsEn: ["classic", "puzzle", "durable"],
  },
  {
    id: "snufflemat-doggone",
    brand: "DoggoneGood",
    brandCountry: "US",
    nameJa: "スナッフルマット",
    nameEn: "Snuffle Mat",
    descJa:
      "ドライフードを隠して鼻で探させる。脳と鼻を5倍疲れさせるマット。",
    descEn:
      "Hide kibble in the fabric folds. Sniffing tires brains 5× faster than running.",
    category: "toy",
    sizes: [
      { label: "Standard", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["lonely-when-alone", "noise-scared"],
    fitsBreedSizes: ["tiny", "small", "medium", "large"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 2980, priceUsd: 19, region: "global" },
    ],
    popularity: 78,
    imagePalette: { from: "#9CA86C", to: "#516030" },
    imageEmoji: "🌿",
    tagsJa: ["知育", "ノーズワーク", "落ち着き"],
    tagsEn: ["enrichment", "nose-work", "calming"],
  },
  {
    id: "westpaw-jive",
    brand: "West Paw",
    brandCountry: "US",
    nameJa: "ジャイブ ボール",
    nameEn: "Jive Ball",
    descJa:
      "天然ゴム製の不規則バウンドボール。ヘビーチュワーでも長持ち。",
    descEn:
      "Natural-rubber ball that bounces unpredictably. Heavy-chewer rated.",
    category: "toy",
    sizes: [
      { label: "S", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "L", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["destroys-toys", "active-sports", "dog-run"],
    fitsBreedSizes: ["small", "medium", "large", "giant"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 2480, priceUsd: 16, region: "global" },
    ],
    popularity: 73,
    imagePalette: { from: "#5C8DBA", to: "#2D4F73" },
    imageEmoji: "🎾",
    tagsJa: ["頑丈", "ボール", "ドッグラン"],
    tagsEn: ["tough", "ball", "dog-park"],
  },
  {
    id: "petstages-deerhorn",
    brand: "Petstages",
    brandCountry: "US",
    nameJa: "デンタルチュー(鹿角)",
    nameEn: "Deer Antler Chew",
    descJa:
      "天然鹿角の長持ちチュー。歯磨き効果と長時間の集中。",
    descEn:
      "Natural antler chew. Dental benefits with hours of focus.",
    category: "toy",
    sizes: [
      { label: "M", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["destroys-toys", "lonely-when-alone"],
    fitsBreedSizes: ["small", "medium", "large"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 2280, priceUsd: 15, region: "global" },
    ],
    popularity: 65,
    imagePalette: { from: "#C2A580", to: "#7A6240" },
    imageEmoji: "🦌",
    tagsJa: ["デンタル", "天然", "頑丈"],
    tagsEn: ["dental", "natural", "tough"],
  },
  {
    id: "petsafe-busy-buddy",
    brand: "PetSafe",
    brandCountry: "US",
    nameJa: "ビジーバディ パズル",
    nameEn: "Busy Buddy Puzzle",
    descJa:
      "回すとフードが落ちる仕組み。1人遊びを劇的に伸ばすトリーター。",
    descEn:
      "Rolls and dispenses food. A go-to for solo-play stamina.",
    category: "toy",
    sizes: [
      { label: "M", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["lonely-when-alone"],
    fitsBreedSizes: ["small", "medium", "large"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 1680, priceUsd: 11, region: "global" },
    ],
    popularity: 67,
    imagePalette: { from: "#C7896A", to: "#8B5535" },
    imageEmoji: "🥫",
    tagsJa: ["知育", "フード対応"],
    tagsEn: ["puzzle", "food-dispense"],
  },
  // ─── 環境対応 (env) ────────────────────────────────────────
  {
    id: "ruffwear-front-range",
    brand: "Ruffwear",
    brandCountry: "US",
    nameJa: "フロントレンジ ハーネス",
    nameEn: "Front Range Harness",
    descJa:
      "胸とハンドル両アタッチメント。引っ張り癖の犬に最適。",
    descEn:
      "Front and back leash attachments. The benchmark for no-pull control.",
    category: "env",
    sizes: [
      {
        label: "XXS",
        chestMin: 33,
        chestMax: 43,
        backMin: 0,
        backMax: 200,
        neckMin: 0,
        neckMax: 200,
      },
      {
        label: "XS",
        chestMin: 43,
        chestMax: 56,
        backMin: 0,
        backMax: 200,
        neckMin: 0,
        neckMax: 200,
      },
      {
        label: "S",
        chestMin: 56,
        chestMax: 69,
        backMin: 0,
        backMax: 200,
        neckMin: 0,
        neckMax: 200,
      },
      {
        label: "M",
        chestMin: 69,
        chestMax: 81,
        backMin: 0,
        backMax: 200,
        neckMin: 0,
        neckMax: 200,
      },
      {
        label: "L",
        chestMin: 81,
        chestMax: 107,
        backMin: 0,
        backMax: 200,
        neckMin: 0,
        neckMax: 200,
      },
    ],
    concerns: ["pulls-leash", "active-sports", "dog-run"],
    fitsBreedSizes: ["tiny", "small", "medium", "large", "giant"],
    buyOptions: [
      { shop: "公式", url: "#", priceJpy: 6800, priceUsd: 45, region: "global" },
      { shop: "Amazon", url: "#", priceJpy: 7200, priceUsd: 48, region: "global" },
    ],
    popularity: 93,
    imagePalette: { from: "#3D5A6C", to: "#1F2C36" },
    imageEmoji: "🦮",
    tagsJa: ["引っ張り防止", "定番", "アウトドア"],
    tagsEn: ["no-pull", "classic", "outdoor"],
  },
  {
    id: "muttluks-boots",
    brand: "Muttluks",
    brandCountry: "CA",
    nameJa: "オールウェザー ブーツ",
    nameEn: "All-Weather Boots",
    descJa:
      "凍結路面・融雪剤・熱いアスファルトから肉球を守る通年ブーツ。",
    descEn:
      "Year-round boots that protect from ice, salt, and hot asphalt.",
    category: "env",
    sizes: [
      { label: "Mini", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "S", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "M", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "L", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["cold-paws", "rainy-walk", "hot-summer"],
    fitsBreedSizes: ["tiny", "small", "medium", "large"],
    buyOptions: [
      { shop: "公式", url: "#", priceJpy: 7800, priceUsd: 52, region: "global" },
    ],
    popularity: 64,
    imagePalette: { from: "#8B7048", to: "#3F3120" },
    imageEmoji: "🥾",
    tagsJa: ["靴", "通年", "肉球保護"],
    tagsEn: ["boots", "all-season", "paw-protect"],
  },
  {
    id: "petsafe-easy-walk",
    brand: "PetSafe",
    brandCountry: "US",
    nameJa: "イージーウォーク ハーネス",
    nameEn: "Easy Walk Harness",
    descJa:
      "胸前リードで引っ張りを優しく抑制。トレーニング初心者に。",
    descEn:
      "Chest-clip design that softly redirects pulling. Trainer-friendly.",
    category: "env",
    sizes: [
      {
        label: "S",
        chestMin: 36,
        chestMax: 49,
        backMin: 0,
        backMax: 200,
        neckMin: 0,
        neckMax: 200,
      },
      {
        label: "M",
        chestMin: 49,
        chestMax: 64,
        backMin: 0,
        backMax: 200,
        neckMin: 0,
        neckMax: 200,
      },
      {
        label: "L",
        chestMin: 64,
        chestMax: 84,
        backMin: 0,
        backMax: 200,
        neckMin: 0,
        neckMax: 200,
      },
    ],
    concerns: ["pulls-leash"],
    fitsBreedSizes: ["small", "medium", "large"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 3800, priceUsd: 25, region: "global" },
    ],
    popularity: 71,
    imagePalette: { from: "#7A8A4C", to: "#404930" },
    imageEmoji: "🐕‍🦺",
    tagsJa: ["引っ張り防止", "初心者◯"],
    tagsEn: ["no-pull", "trainer-friendly"],
  },
  {
    id: "thundershirt",
    brand: "ThunderShirt",
    brandCountry: "US",
    nameJa: "サンダーシャツ",
    nameEn: "ThunderShirt",
    descJa:
      "圧迫で安心感を与えるベスト。雷・花火・留守番の不安に。",
    descEn:
      "Gentle pressure vest. Eases noise, travel, and separation anxiety.",
    category: "env",
    sizes: [
      {
        label: "XS",
        chestMin: 30,
        chestMax: 40,
        backMin: 22,
        backMax: 28,
        neckMin: 22,
        neckMax: 30,
      },
      {
        label: "S",
        chestMin: 40,
        chestMax: 52,
        backMin: 28,
        backMax: 36,
        neckMin: 28,
        neckMax: 40,
      },
      {
        label: "M",
        chestMin: 52,
        chestMax: 66,
        backMin: 36,
        backMax: 46,
        neckMin: 34,
        neckMax: 50,
      },
      {
        label: "L",
        chestMin: 66,
        chestMax: 82,
        backMin: 46,
        backMax: 56,
        neckMin: 42,
        neckMax: 60,
      },
    ],
    concerns: ["noise-scared", "lonely-when-alone"],
    fitsBreedSizes: ["tiny", "small", "medium", "large"],
    buyOptions: [
      { shop: "公式", url: "#", priceJpy: 5800, priceUsd: 39, region: "global" },
      { shop: "Amazon", url: "#", priceJpy: 6200, priceUsd: 42, region: "global" },
    ],
    popularity: 69,
    imagePalette: { from: "#9D7BA8", to: "#523C5C" },
    imageEmoji: "🤍",
    tagsJa: ["不安対策", "雷・花火", "圧迫安心"],
    tagsEn: ["anxiety", "thunder-fireworks", "calming"],
  },
  {
    id: "coolerdog-mat",
    brand: "Cooler Dog",
    brandCountry: "US",
    nameJa: "クールマット",
    nameEn: "Cooling Mat",
    descJa:
      "ジェル充填。電源不要で体温を逃がす夏のベッド。",
    descEn:
      "Gel-filled, no-power cooling pad. Releases body heat in summer.",
    category: "env",
    sizes: [
      { label: "S", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "M", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "L", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["hot-summer", "senior-dog"],
    fitsBreedSizes: ["tiny", "small", "medium", "large", "giant"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 4980, priceUsd: 33, region: "global" },
    ],
    popularity: 66,
    imagePalette: { from: "#90C5D8", to: "#4A7080" },
    imageEmoji: "🟦",
    tagsJa: ["夏", "ベッド", "電源不要"],
    tagsEn: ["summer", "bed", "no-power"],
  },
  {
    id: "iris-stairs",
    brand: "アイリスオーヤマ",
    brandCountry: "JP",
    nameJa: "犬用ステップ",
    nameEn: "Pet Stairs",
    descJa:
      "ソファ・ベッドへの段差をなくす。シニア犬や腰の弱い犬に。",
    descEn:
      "Soft stairs to sofa or bed. Gentle on senior backs and joints.",
    category: "env",
    sizes: [
      { label: "Standard", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["senior-dog"],
    fitsBreedSizes: ["tiny", "small", "medium"],
    buyOptions: [
      { shop: "楽天", url: "#", priceJpy: 4480, region: "jp" },
      { shop: "Amazon", url: "#", priceJpy: 4680, region: "jp" },
    ],
    popularity: 58,
    imagePalette: { from: "#D8C2A4", to: "#8B7048" },
    imageEmoji: "🪜",
    tagsJa: ["シニア", "段差対策", "国産"],
    tagsEn: ["senior", "step-support", "japanese"],
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getPopularProducts(limit = 6): Product[] {
  return [...products]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return products.filter((p) => p.category === category);
}

export function listBrands(): string[] {
  return Array.from(new Set(products.map((p) => p.brand))).sort();
}
