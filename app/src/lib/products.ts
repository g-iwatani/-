import type { AffiliateTarget } from "./affiliate";
import manualImagesData from "./manual-images.json";
import generatedImages from "./rakuten-images.generated.json";
import { amazonBestsellers } from "./amazon-bestsellers.generated";

/**
 * 楽天 Webservice API でビルド時に取得した商品画像URL。
 * scripts/fetch-rakuten-images.mjs が生成する。未設定なら空オブジェクト。
 */
const rakutenImages: Record<string, string> = generatedImages;

/**
 * 公式ブランドサイト + 楽天ショップの手動採取画像。
 * scripts/fetch-rakuten-images.mjs (rakuten-images.generated.json を再生成する) で
 * 上書きされないよう別ファイルで管理している。
 *
 * 注意: 楽天ショップ検索からのフォールバック画像は厳密にブランド純正品の保証が
 * ない。以下 8 件は browser Claude の探索で「ブランド名検索の上位ショップ画像」
 * として取得されたもので、純正品との一致を後で目視で確認すること:
 *   - free-stitch-bigtee
 *   - snufflemat-doggone (DoggoneGood)
 *   - petrepublique-grinder
 *   - aquapaw-licker
 *   - pet-glove-brush (DELOMO)
 *   - pooch-outfitters-long-body
 *   - frenchbull-wide-vest
 *   - bivvy-emergency-kit
 */
const manualImages: Record<string, string> = manualImagesData;

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
  /**
   * URL 生成用のターゲット。env で associate ID が設定されていれば
   * affiliate タグ付きURL、未設定なら素のURLを生成する。
   */
  target?: AffiliateTarget;
  /**
   * target が未指定 / 未対応 net の場合のフォールバック URL。MVPはここに `#` を入れている。
   * target を実装し終えたらこのフィールドは段階的に削除可能。
   */
  url?: string;
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
  /** 商品画像URL(楽天/Amazon/ブランド公式の物)。未設定なら imagePalette+emoji のフォールバック表示 */
  imageUrl?: string;
  imagePalette: { from: string; to: string };
  imageEmoji: string;
  tagsJa: string[];
  tagsEn: string[];
};

/**
 * 商品データ。Amazon の `url: "#"` プレースホルダーは、エクスポート時に
 * ブランド名+商品名で検索する amazon-search-jp ターゲットに自動置換される
 * (下部 enrichAmazonSearchTargets を参照)。ASIN を取得した商品は
 * このリテラル内で `target: { network: "amazon-jp", asin: "..." }` に
 * 置き換えれば、自動置換はスキップされる。
 */
const rawProducts: Product[] = [
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
      {
        shop: "楽天",
        target: { network: "rakuten", shopCode: "1stdogcafe", itemCode: "10000682" },
        priceJpy: 18500,
        region: "jp",
      },
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
      {
        shop: "楽天",
        target: { network: "rakuten", shopCode: "chocoshop", itemCode: "1313" },
        priceJpy: 5980,
        region: "jp",
      },
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
    buyOptions: [
      {
        shop: "楽天",
        target: { network: "rakuten", shopCode: "freak", itemCode: "alphaicon3l" },
        priceJpy: 8800,
        region: "jp",
      },
    ],
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
    buyOptions: [
      {
        shop: "楽天",
        target: { network: "rakuten", shopCode: "jungle-pet", itemCode: "can-1103" },
        priceJpy: 5400,
        region: "jp",
      },
    ],
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
      {
        shop: "楽天",
        target: { network: "rakuten", shopCode: "idog", itemCode: "li0015" },
        priceJpy: 4480,
        region: "jp",
      },
      { shop: "Amazon", url: "#", priceJpy: 4680, region: "jp" },
    ],
    popularity: 58,
    imagePalette: { from: "#D8C2A4", to: "#8B7048" },
    imageEmoji: "🪜",
    tagsJa: ["シニア", "段差対策", "国産"],
    tagsEn: ["senior", "step-support", "japanese"],
  },
  // ─── 食器・給仕(医療効能は謳わない) ───────────────────────
  {
    id: "outward-hound-slow-bowl",
    brand: "Outward Hound",
    brandCountry: "US",
    nameJa: "ファンフィーダー(スローフィーダーボウル)",
    nameEn: "Fun Feeder Slow Bowl",
    descJa:
      "迷路状の凹凸で食事ペースを自然に落とす。早食い・退屈に。",
    descEn:
      "Maze-pattern bowl that naturally slows fast eaters and busts boredom.",
    category: "env",
    sizes: [
      { label: "Mini", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "Standard", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["fast-eater", "picky-eater", "lonely-when-alone"],
    fitsBreedSizes: ["tiny", "small", "medium", "large"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 1980, priceUsd: 13, region: "global" },
      {
        shop: "楽天",
        target: {
          network: "rakuten",
          shopCode: "deardogs",
          itemCode: "owh-ffslobowl-tiny",
        },
        priceJpy: 2180,
        region: "jp",
      },
    ],
    popularity: 76,
    imagePalette: { from: "#A8C77A", to: "#4F6A2C" },
    imageEmoji: "🍽️",
    tagsJa: ["スローフィーダー", "食事の工夫"],
    tagsEn: ["slow-feeder", "feeding"],
  },
  {
    id: "richell-bowl-stand",
    brand: "Richell",
    brandCountry: "JP",
    nameJa: "高さ調整できる食器スタンド",
    nameEn: "Height-Adjustable Bowl Stand",
    descJa:
      "首と背中の負担を減らす高さ調整スタンド。シニア犬・大型犬・うつむき食いの子に。",
    descEn:
      "Adjustable stand that reduces neck and back strain at meals.",
    category: "env",
    sizes: [
      { label: "S", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "M", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "L", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["picky-eater", "senior-dog"],
    fitsBreedSizes: ["small", "medium", "large", "giant"],
    buyOptions: [
      {
        shop: "楽天",
        target: { network: "rakuten", shopCode: "richell", itemCode: "156121" },
        priceJpy: 3800,
        region: "jp",
      },
    ],
    popularity: 60,
    imagePalette: { from: "#D8C0A4", to: "#7A5938" },
    imageEmoji: "🍱",
    tagsJa: ["食器スタンド", "シニア"],
    tagsEn: ["feeding stand", "senior"],
  },
  // ─── 子犬向け ───────────────────────
  {
    id: "puppia-soft-harness",
    brand: "Puppia",
    brandCountry: "KR",
    nameJa: "ソフトハーネス",
    nameEn: "Soft Harness",
    descJa:
      "首に圧をかけない胴ベルト式のソフトハーネス。子犬や小型犬の散歩デビューに。",
    descEn:
      "Padded vest-style harness — gentle on the neck for small dogs and puppies.",
    category: "env",
    sizes: [
      { label: "XS", chestMin: 26, chestMax: 36, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "S", chestMin: 36, chestMax: 46, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "M", chestMin: 46, chestMax: 58, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "L", chestMin: 58, chestMax: 70, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["puppy", "small-breed", "slips-off"],
    fitsBreedSizes: ["tiny", "small", "medium"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 2380, priceUsd: 16, region: "global" },
    ],
    popularity: 80,
    imagePalette: { from: "#F4C7CB", to: "#9C5A66" },
    imageEmoji: "🎀",
    tagsJa: ["子犬", "ソフト", "首に優しい"],
    tagsEn: ["puppy", "soft", "neck-friendly"],
  },
  {
    id: "ruffwear-stash-bag",
    brand: "Ruffwear",
    brandCountry: "US",
    nameJa: "スタッシュバッグ(ウンチ袋ホルダー)",
    nameEn: "Stash Bag",
    descJa:
      "リードに付ける処理袋ホルダー。長時間散歩・ドッグラン派の必需品。",
    descEn:
      "Leash-mounted poop-bag holder for long walks and the dog park.",
    category: "env",
    sizes: [
      { label: "One Size", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["long-walker", "active-sports"],
    fitsBreedSizes: ["tiny", "small", "medium", "large", "giant"],
    buyOptions: [
      { shop: "公式", url: "#", priceJpy: 1980, priceUsd: 14, region: "global" },
    ],
    popularity: 55,
    imagePalette: { from: "#5C7548", to: "#2E3D24" },
    imageEmoji: "👜",
    tagsJa: ["長時間散歩", "アウトドア"],
    tagsEn: ["long-walks", "outdoor"],
  },
  {
    id: "ruffwear-quencher-bowl",
    brand: "Ruffwear",
    brandCountry: "US",
    nameJa: "クエンチャー 折りたたみボウル",
    nameEn: "Quencher Travel Bowl",
    descJa:
      "コンパクトに折りたためる携帯ボウル。アウトドア・長時間散歩・夏場の水分補給に。",
    descEn:
      "Packable bowl for hydration on long walks, hikes, and hot days.",
    category: "env",
    sizes: [
      { label: "Small", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "Medium", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["long-walker", "active-sports", "hot-summer"],
    fitsBreedSizes: ["tiny", "small", "medium", "large"],
    buyOptions: [
      { shop: "公式", url: "#", priceJpy: 2480, priceUsd: 17, region: "global" },
      { shop: "Amazon", url: "#", priceJpy: 2680, priceUsd: 18, region: "global" },
    ],
    popularity: 62,
    imagePalette: { from: "#5C8DBA", to: "#2D4F73" },
    imageEmoji: "🥣",
    tagsJa: ["携帯ボウル", "アウトドア"],
    tagsEn: ["travel-bowl", "outdoor"],
  },

  // ─── ケア / グルーミング ─────────────────────────────────
  {
    id: "furminator-deshed",
    brand: "FURminator",
    brandCountry: "US",
    nameJa: "アンダーコートデシェディングツール",
    nameEn: "deShedding Tool",
    descJa:
      "短毛・長毛それぞれに最適化された刃で、アンダーコートを効率的に取り除く定番ブラシ。",
    descEn:
      "The benchmark de-shedding tool. Reaches the undercoat without damaging the topcoat.",
    category: "env",
    sizes: [
      { label: "Toy", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "Small", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "Medium", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "Large", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["heavy-shedding", "long-coat-grooming"],
    fitsBreedSizes: ["tiny", "small", "medium", "large", "giant"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 4980, priceUsd: 35, region: "global" },
      {
        shop: "楽天",
        target: { network: "rakuten", shopCode: "kurosu", itemCode: "10022677" },
        priceJpy: 5380,
        region: "jp",
      },
    ],
    popularity: 92,
    imagePalette: { from: "#5A7080", to: "#2A3540" },
    imageEmoji: "🪮",
    tagsJa: ["抜け毛対策", "定番"],
    tagsEn: ["deshed", "classic"],
  },
  {
    id: "hertzko-slicker",
    brand: "Hertzko",
    brandCountry: "US",
    nameJa: "セルフクリーニングスリッカーブラシ",
    nameEn: "Self-Cleaning Slicker Brush",
    descJa:
      "ボタンひとつで毛玉を排出。長毛・カーリーコート犬の毎日のもつれ防止に。",
    descEn:
      "One-button bristle retraction. Daily detangling for long or curly coats.",
    category: "env",
    sizes: [
      { label: "One Size", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["long-coat-grooming", "heavy-shedding", "brushing-hates"],
    fitsBreedSizes: ["tiny", "small", "medium", "large"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 1980, priceUsd: 13, region: "global" },
    ],
    popularity: 78,
    imagePalette: { from: "#EAA4A4", to: "#8A4444" },
    imageEmoji: "🪮",
    tagsJa: ["スリッカー", "もつれ防止"],
    tagsEn: ["slicker", "detangle"],
  },
  {
    id: "earthbath-ear-wipes",
    brand: "Earthbath",
    brandCountry: "US",
    nameJa: "イヤーワイプ(耳掃除シート)",
    nameEn: "Ear Wipes",
    descJa:
      "天然素材ベースの優しい耳掃除シート。日常ケアで耳の汚れを軽減。",
    descEn:
      "Plant-based gentle ear wipes for everyday cleaning.",
    category: "env",
    sizes: [
      { label: "25枚入", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["dirty-ears"],
    fitsBreedSizes: ["tiny", "small", "medium", "large", "giant"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 1380, priceUsd: 9, region: "global" },
    ],
    popularity: 64,
    imagePalette: { from: "#A8C77A", to: "#4F6A2C" },
    imageEmoji: "👂",
    tagsJa: ["ケア", "シート"],
    tagsEn: ["wipes", "care"],
  },
  {
    id: "petio-eye-wipes",
    brand: "Petio",
    brandCountry: "JP",
    nameJa: "目元クリーンシート",
    nameEn: "Eye Care Wipes",
    descJa:
      "毎日の目元のお手入れに。涙やけが気になる飼い主が選んでいる定番ケア用品。",
    descEn:
      "Daily eye-area wipes — popular with owners who watch for tear staining.",
    category: "env",
    sizes: [
      { label: "60枚入", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["tear-stains-care"],
    fitsBreedSizes: ["tiny", "small", "medium", "large"],
    buyOptions: [
      { shop: "楽天", url: "#", priceJpy: 980, region: "jp" },
      { shop: "Amazon", url: "#", priceJpy: 1080, region: "jp" },
    ],
    popularity: 70,
    imagePalette: { from: "#F2DCD0", to: "#9A6E55" },
    imageEmoji: "👁️",
    tagsJa: ["涙やけケア", "国産"],
    tagsEn: ["tear-stain care", "japanese"],
  },
  {
    id: "wahl-bravura-trimmer",
    brand: "Wahl",
    brandCountry: "US",
    nameJa: "ブラブラ コードレストリマー",
    nameEn: "Bravura Cordless Trimmer",
    descJa:
      "音が静かなコードレストリマー。爪切りや顔まわりの毛のお手入れに使える兼用機。",
    descEn:
      "Quiet cordless trimmer for nails and face touch-ups.",
    category: "env",
    sizes: [
      { label: "One Size", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["nail-care-hates", "long-coat-grooming"],
    fitsBreedSizes: ["tiny", "small", "medium", "large"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 14800, priceUsd: 99, region: "global" },
    ],
    popularity: 60,
    imagePalette: { from: "#7A88B0", to: "#3F4A6C" },
    imageEmoji: "💈",
    tagsJa: ["静音", "コードレス", "プレミアム"],
    tagsEn: ["quiet", "cordless", "premium"],
  },
  {
    id: "petrepublique-grinder",
    brand: "Pet Republique",
    brandCountry: "US",
    nameJa: "電動ネイルグラインダー",
    nameEn: "Electric Nail Grinder",
    descJa:
      "切らずに削る電動爪ヤスリ。爪切りが苦手な子に音が静かなモデルがおすすめ。",
    descEn:
      "Grind, don't clip. Quieter and gentler — ideal for nail-averse dogs.",
    category: "env",
    sizes: [
      { label: "One Size", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["nail-care-hates", "senior-dog"],
    fitsBreedSizes: ["tiny", "small", "medium", "large"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 3280, priceUsd: 22, region: "global" },
    ],
    popularity: 72,
    imagePalette: { from: "#C9A48C", to: "#7A5538" },
    imageEmoji: "🪚",
    tagsJa: ["電動", "爪ケア"],
    tagsEn: ["electric", "nail-care"],
  },
  {
    id: "aquapaw-licker",
    brand: "Aquapaw",
    brandCountry: "US",
    nameJa: "ペットスローフィーダー(吸盤付き)",
    nameEn: "Slow Treater Lick Mat",
    descJa:
      "壁に吸盤で貼り付けるリックマット。お風呂やドライヤー時の気を逸らすのに最適。",
    descEn:
      "Suctions to wall or tub. Distracts during bath and grooming.",
    category: "env",
    sizes: [
      { label: "One Size", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["bath-hates", "brushing-hates", "fast-eater", "lonely-when-alone"],
    fitsBreedSizes: ["tiny", "small", "medium", "large"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 1680, priceUsd: 11, region: "global" },
    ],
    popularity: 76,
    imagePalette: { from: "#7BB6CC", to: "#3A6E84" },
    imageEmoji: "🌊",
    tagsJa: ["バス対策", "知育"],
    tagsEn: ["bath-aid", "enrichment"],
  },
  {
    id: "burts-bees-shampoo",
    brand: "Burt's Bees",
    brandCountry: "US",
    nameJa: "ナチュラル ドッグシャンプー",
    nameEn: "Natural Dog Shampoo",
    descJa:
      "天然由来成分配合のマイルドなシャンプー。バスタイムを優しく。",
    descEn:
      "Plant-based, gentle formulation. Soft on coat and skin.",
    category: "env",
    sizes: [
      { label: "473ml", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["bath-hates"],
    fitsBreedSizes: ["tiny", "small", "medium", "large", "giant"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 1480, priceUsd: 10, region: "global" },
    ],
    popularity: 58,
    imagePalette: { from: "#F4E0A0", to: "#A88030" },
    imageEmoji: "🧴",
    tagsJa: ["シャンプー", "ナチュラル"],
    tagsEn: ["shampoo", "natural"],
  },
  {
    id: "pet-glove-brush",
    brand: "DELOMO",
    brandCountry: "US",
    nameJa: "グルーミンググローブ",
    nameEn: "Pet Grooming Gloves",
    descJa:
      "撫でながらブラッシング。ブラシ嫌いな子にも触る延長として馴染みやすい。",
    descEn:
      "Pet your dog while you brush. Great for brush-averse pups.",
    category: "env",
    sizes: [
      { label: "Pair", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["brushing-hates", "heavy-shedding"],
    fitsBreedSizes: ["tiny", "small", "medium", "large"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 2280, priceUsd: 15, region: "global" },
    ],
    popularity: 68,
    imagePalette: { from: "#B8C68C", to: "#5C6F2E" },
    imageEmoji: "🧤",
    tagsJa: ["グローブ", "ブラッシング"],
    tagsEn: ["gloves", "brushing"],
  },
  {
    id: "virbac-toothpaste",
    brand: "Virbac",
    brandCountry: "FR",
    nameJa: "C.E.T 歯磨きペースト",
    nameEn: "C.E.T. Toothpaste",
    descJa:
      "獣医師が推奨することの多いデンタルペースト。フレーバー付きで犬が嫌がりにくい。",
    descEn:
      "Veterinarian-recommended toothpaste. Flavored to make daily brushing easier.",
    category: "env",
    sizes: [
      { label: "70g", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["dental-care"],
    fitsBreedSizes: ["tiny", "small", "medium", "large", "giant"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 1980, priceUsd: 13, region: "global" },
      { shop: "楽天", url: "#", priceJpy: 2080, region: "jp" },
    ],
    popularity: 70,
    imagePalette: { from: "#A4C8E0", to: "#3F6680" },
    imageEmoji: "🪥",
    tagsJa: ["歯磨き", "デンタル"],
    tagsEn: ["dental", "toothpaste"],
  },
  {
    id: "nylabone-dura-chew",
    brand: "Nylabone",
    brandCountry: "US",
    nameJa: "デュラチュー パワーチュー",
    nameEn: "DuraChew Power Chew",
    descJa:
      "ヘビーチュワー対応のデンタルチュー。歯垢を物理的に減らしながら長時間遊べる。",
    descEn:
      "Power-chewer rated dental chew. Cleans teeth while keeping them busy.",
    category: "toy",
    sizes: [
      { label: "Wolf", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "Souper", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["dental-care", "destroys-toys", "biting-habit"],
    fitsBreedSizes: ["small", "medium", "large", "giant"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 1480, priceUsd: 10, region: "global" },
    ],
    popularity: 80,
    imagePalette: { from: "#D89A6A", to: "#7A4A20" },
    imageEmoji: "🦴",
    tagsJa: ["デンタル", "頑丈"],
    tagsEn: ["dental", "tough"],
  },
  {
    id: "greenies-dental-treats",
    brand: "Greenies",
    brandCountry: "US",
    nameJa: "グリニーズ オリジナル",
    nameEn: "Greenies Original Dental Treats",
    descJa:
      "毎日のデンタル習慣に。サイズ別パッケージで噛みごたえも適切。",
    descEn:
      "Daily dental treat with the right chew time per size.",
    category: "env",
    sizes: [
      { label: "Teenie", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "Petite", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "Regular", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "Large", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["dental-care"],
    fitsBreedSizes: ["tiny", "small", "medium", "large", "giant"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 2480, priceUsd: 17, region: "global" },
      {
        shop: "楽天",
        target: {
          network: "rakuten",
          shopCode: "petforest",
          itemCode: "pf-4562358787904",
        },
        priceJpy: 2680,
        region: "jp",
      },
    ],
    popularity: 84,
    imagePalette: { from: "#88C078", to: "#3F6E2C" },
    imageEmoji: "🦷",
    tagsJa: ["デンタル", "おやつ"],
    tagsEn: ["dental", "treat"],
  },

  // ─── 行動 / しつけ系 ────────────────────────────────────
  {
    id: "petsafe-treat-pouch",
    brand: "PetSafe",
    brandCountry: "US",
    nameJa: "トリートポーチ",
    nameEn: "Treat Pouch",
    descJa:
      "ご褒美をすぐ渡せるトレーニング必携アイテム。マグネット式の口で片手アクセス。",
    descEn:
      "Magnetic-mouth treat pouch — fast one-hand access for training.",
    category: "env",
    sizes: [
      { label: "One Size", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["pulls-leash", "wont-come", "barking", "scavenging", "jumps-on-people"],
    fitsBreedSizes: ["tiny", "small", "medium", "large", "giant"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 1880, priceUsd: 13, region: "global" },
    ],
    popularity: 78,
    imagePalette: { from: "#7A8A4C", to: "#404930" },
    imageEmoji: "👜",
    tagsJa: ["トレーニング", "必携"],
    tagsEn: ["training", "essential"],
  },
  {
    id: "gentle-leader-headcollar",
    brand: "PetSafe",
    brandCountry: "US",
    nameJa: "ジェントルリーダー ヘッドカラー",
    nameEn: "Gentle Leader Headcollar",
    descJa:
      "頭部装着型のしつけ補助具。引っ張り癖の改善に高い実績がある定番。",
    descEn:
      "Head-collar style training aid. The classic no-pull solution for strong pullers.",
    category: "env",
    sizes: [
      { label: "Petite", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "Small", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "Medium", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "Large", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["pulls-leash", "reactive-bicycle", "barking-other-dogs"],
    fitsBreedSizes: ["small", "medium", "large", "giant"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 3480, priceUsd: 23, region: "global" },
    ],
    popularity: 75,
    imagePalette: { from: "#7A4A30", to: "#3A2418" },
    imageEmoji: "🐎",
    tagsJa: ["引っ張り防止", "ヘッドカラー"],
    tagsEn: ["no-pull", "head-collar"],
  },
  {
    id: "mighty-paw-long-leash",
    brand: "Mighty Paw",
    brandCountry: "US",
    nameJa: "ロングリード(9m)",
    nameEn: "Long Leash 30ft",
    descJa:
      "呼び戻しトレーニングに使う長いリード。広い場所で安全に練習できる。",
    descEn:
      "Long line for safe recall training in open spaces.",
    category: "env",
    sizes: [
      { label: "9m", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "15m", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["wont-come", "active-sports", "outdoor-camping"],
    fitsBreedSizes: ["small", "medium", "large", "giant"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 2880, priceUsd: 19, region: "global" },
    ],
    popularity: 64,
    imagePalette: { from: "#5C7548", to: "#2E3D24" },
    imageEmoji: "🪢",
    tagsJa: ["呼び戻し", "ロングリード"],
    tagsEn: ["recall", "long-line"],
  },
  {
    id: "adaptil-spray",
    brand: "Adaptil",
    brandCountry: "FR",
    nameJa: "犬用フェロモンスプレー",
    nameEn: "Calming Pheromone Spray",
    descJa:
      "母犬のフェロモンを再現したスプレー。クレートやキャリーに吹きかけて安心感を補助。",
    descEn:
      "Synthetic dog-appeasing pheromone spray. Sprayed on crates and bedding.",
    category: "env",
    sizes: [
      { label: "60ml", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["anxiety-general", "noise-scared", "moving-home", "boarding", "carsick"],
    fitsBreedSizes: ["tiny", "small", "medium", "large", "giant"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 2680, priceUsd: 18, region: "global" },
    ],
    popularity: 70,
    imagePalette: { from: "#9D7BA8", to: "#523C5C" },
    imageEmoji: "🌸",
    tagsJa: ["フェロモン", "落ち着き"],
    tagsEn: ["pheromone", "calming"],
  },
  {
    id: "baskerville-muzzle",
    brand: "Baskerville",
    brandCountry: "GB",
    nameJa: "ウルトラマズル(口輪)",
    nameEn: "Ultra Muzzle",
    descJa:
      "通気性の高いバスケット型マズル。拾い食い防止や来客対応の補助に。",
    descEn:
      "Vented basket muzzle. Helps with scavenging or guest interactions.",
    category: "env",
    sizes: [
      { label: "Size 1", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "Size 3", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "Size 5", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["scavenging", "biting-habit", "barking-guests"],
    fitsBreedSizes: ["small", "medium", "large", "giant"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 3680, priceUsd: 25, region: "global" },
    ],
    popularity: 56,
    imagePalette: { from: "#5C5040", to: "#2A201A" },
    imageEmoji: "🎭",
    tagsJa: ["拾い食い対策", "マズル"],
    tagsEn: ["anti-scavenge", "muzzle"],
  },
  {
    id: "outward-hound-puzzle",
    brand: "Outward Hound",
    brandCountry: "US",
    nameJa: "ニーナオットソン パズル",
    nameEn: "Nina Ottosson Puzzle Toy",
    descJa:
      "難易度別の知育パズル。隠したフードを犬が探して開ける、留守番にも最適。",
    descEn:
      "Treat-hiding puzzle, multiple difficulty levels. Great solo-time enrichment.",
    category: "toy",
    sizes: [
      { label: "Lvl 1", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "Lvl 2", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "Lvl 3", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["destructive-when-alone", "lonely-when-alone", "fast-eater"],
    fitsBreedSizes: ["tiny", "small", "medium", "large"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 3280, priceUsd: 22, region: "global" },
    ],
    popularity: 86,
    imagePalette: { from: "#E0A848", to: "#8C6420" },
    imageEmoji: "🧩",
    tagsJa: ["知育", "留守番"],
    tagsEn: ["puzzle", "alone-time"],
  },
  {
    id: "kong-wobbler",
    brand: "Kong",
    brandCountry: "US",
    nameJa: "コング ウォブラー",
    nameEn: "Kong Wobbler",
    descJa:
      "倒すとフードが少しずつ出る。早食い対策にもなる動的フード給仕。",
    descEn:
      "Wobbles and dispenses food. Slow-feeder + enrichment in one.",
    category: "toy",
    sizes: [
      { label: "Small", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "Large", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["lonely-when-alone", "fast-eater", "weight-management"],
    fitsBreedSizes: ["small", "medium", "large", "giant"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 2280, priceUsd: 15, region: "global" },
    ],
    popularity: 78,
    imagePalette: { from: "#D44D3A", to: "#7A2A1E" },
    imageEmoji: "🥚",
    tagsJa: ["知育", "スローフィーダー"],
    tagsEn: ["enrichment", "slow-feed"],
  },
  {
    id: "ifetch-launcher",
    brand: "iFetch",
    brandCountry: "US",
    nameJa: "自動ボールランチャー",
    nameEn: "Automatic Ball Launcher",
    descJa:
      "ボールを入れると自動で投げてくれる。室内・庭での運動量を確保。",
    descEn:
      "Drops a ball in, throws it out. Keeps energy levels manageable on rainy days.",
    category: "toy",
    sizes: [
      { label: "Mini", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "Original", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["destructive-when-alone", "weight-management", "active-sports"],
    fitsBreedSizes: ["small", "medium", "large"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 11800, priceUsd: 79, region: "global" },
    ],
    popularity: 60,
    imagePalette: { from: "#7BB8C4", to: "#365A66" },
    imageEmoji: "🤖",
    tagsJa: ["自動", "運動", "雨の日"],
    tagsEn: ["automatic", "exercise"],
  },
  {
    id: "snuggle-puppy",
    brand: "Snuggle Puppy",
    brandCountry: "US",
    nameJa: "心音つきぬいぐるみ",
    nameEn: "Heartbeat Snuggle Puppy",
    descJa:
      "リアルな心音と温かさで安心感を作る。子犬・引っ越し直後・分離不安に。",
    descEn:
      "Real heartbeat + warmth. For puppies, post-move, and separation anxiety.",
    category: "toy",
    sizes: [
      { label: "One Size", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["puppy", "moving-home", "anxiety-general", "lonely-when-alone", "noise-scared"],
    fitsBreedSizes: ["tiny", "small", "medium"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 4580, priceUsd: 31, region: "global" },
    ],
    popularity: 74,
    imagePalette: { from: "#F5DCE0", to: "#C28490" },
    imageEmoji: "💗",
    tagsJa: ["子犬", "分離不安"],
    tagsEn: ["puppy", "separation"],
  },

  // ─── トイレ・ペットゲート ───────────────────────────────────
  {
    id: "carlson-pet-gate",
    brand: "Carlson",
    brandCountry: "US",
    nameJa: "ペット用ゲート(自立式)",
    nameEn: "Free-Standing Pet Gate",
    descJa:
      "工具不要で設置できる自立型ゲート。トイレトレーニングや子供との境界線づくりに。",
    descEn:
      "Tool-free, free-standing gate. Helps potty training and kid/dog boundaries.",
    category: "env",
    sizes: [
      { label: "Standard", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["potty-training", "with-kids", "begging-for-food", "multi-dog"],
    fitsBreedSizes: ["tiny", "small", "medium", "large"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 8980, priceUsd: 60, region: "global" },
      {
        shop: "楽天",
        target: {
          network: "rakuten",
          shopCode: "auc-roadster",
          itemCode: "10004893",
        },
        priceJpy: 9480,
        region: "jp",
      },
    ],
    popularity: 72,
    imagePalette: { from: "#C9B49A", to: "#7A6240" },
    imageEmoji: "🚪",
    tagsJa: ["ゲート", "境界線"],
    tagsEn: ["gate", "boundary"],
  },
  {
    id: "wagworld-pads",
    brand: "WagWorld",
    brandCountry: "JP",
    nameJa: "薄型ペットシーツ(レギュラー)",
    nameEn: "Thin Pet Pads (Regular)",
    descJa:
      "コスパ重視の毎日使いシーツ。トイレトレーニング期にまとめ買い向き。",
    descEn:
      "Daily-use pads. Ideal bulk pick during potty training.",
    category: "env",
    sizes: [
      { label: "Regular 100枚", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "Wide 50枚", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["potty-training", "puppy"],
    fitsBreedSizes: ["tiny", "small", "medium", "large"],
    buyOptions: [
      {
        shop: "楽天",
        target: { network: "rakuten", shopCode: "kingbridge", itemCode: "pdt004" },
        priceJpy: 1680,
        region: "jp",
      },
      { shop: "Amazon", url: "#", priceJpy: 1780, region: "jp" },
    ],
    popularity: 80,
    imagePalette: { from: "#E0EBEA", to: "#5A7570" },
    imageEmoji: "📄",
    tagsJa: ["シーツ", "トイレ"],
    tagsEn: ["pads", "potty"],
  },

  // ─── トラベル / 移動 ─────────────────────────────────────
  {
    id: "sleepypod-clickit",
    brand: "Sleepypod",
    brandCountry: "US",
    nameJa: "クリックイット スポーツ(車用ハーネス)",
    nameEn: "Clickit Sport Crash-Tested Harness",
    descJa:
      "クラッシュテスト済みの車載シートベルトハーネス。安全性で選ぶならこれ。",
    descEn:
      "Crash-tested seatbelt harness for car travel.",
    category: "env",
    sizes: [
      { label: "S", chestMin: 39, chestMax: 56, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "M", chestMin: 56, chestMax: 71, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "L", chestMin: 71, chestMax: 91, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["travel-car", "carsick", "active-sports"],
    fitsBreedSizes: ["small", "medium", "large", "giant"],
    buyOptions: [
      { shop: "公式", url: "#", priceJpy: 12800, priceUsd: 85, region: "global" },
    ],
    popularity: 68,
    imagePalette: { from: "#3F5266", to: "#1F2730" },
    imageEmoji: "🚗",
    tagsJa: ["車", "安全", "クラッシュテスト済"],
    tagsEn: ["car", "safety", "crash-tested"],
  },
  {
    id: "sherpa-carrier",
    brand: "Sherpa",
    brandCountry: "US",
    nameJa: "オリジナル デラックス キャリア",
    nameEn: "Original Deluxe Carrier",
    descJa:
      "JAL/ANA等の機内持ち込みサイズに対応。電車・カフェ移動にも便利。",
    descEn:
      "Airline-approved soft carrier. Works for train and café trips too.",
    category: "env",
    sizes: [
      { label: "Small", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "Medium", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["public-transport", "cafe-friendly", "travel-car", "boarding"],
    fitsBreedSizes: ["tiny", "small"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 9800, priceUsd: 65, region: "global" },
    ],
    popularity: 70,
    imagePalette: { from: "#6E7280", to: "#33363F" },
    imageEmoji: "🎒",
    tagsJa: ["キャリア", "機内持込"],
    tagsEn: ["carrier", "airline-approved"],
  },
  {
    id: "midwest-foldable-pen",
    brand: "MidWest",
    brandCountry: "US",
    nameJa: "折りたたみケージ",
    nameEn: "Foldable Wire Pen",
    descJa:
      "折りたたみ可能なメタルペン。多頭飼育・キャンプ・災害時の備えに。",
    descEn:
      "Folds flat. Multi-dog feeding, camping, or disaster prep.",
    category: "env",
    sizes: [
      { label: "8-panel", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["multi-dog", "outdoor-camping", "disaster-prep", "potty-training"],
    fitsBreedSizes: ["small", "medium", "large"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 7800, priceUsd: 52, region: "global" },
    ],
    popularity: 62,
    imagePalette: { from: "#9AAAB0", to: "#4A565C" },
    imageEmoji: "🧱",
    tagsJa: ["ケージ", "多頭", "災害"],
    tagsEn: ["pen", "multi-dog", "disaster"],
  },
  {
    id: "kurgo-dog-backpack",
    brand: "Kurgo",
    brandCountry: "US",
    nameJa: "ドッグバックパック(犬用)",
    nameEn: "Big Baxter Dog Backpack",
    descJa:
      "犬自身が背負うアウトドア用バックパック。長時間散歩・ハイキングに。",
    descEn:
      "Backpack the dog wears for hikes and long-walk lifestyles.",
    category: "env",
    sizes: [
      { label: "Medium", chestMin: 60, chestMax: 80, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "Large", chestMin: 80, chestMax: 105, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["outdoor-camping", "active-sports", "long-walker"],
    fitsBreedSizes: ["medium", "large", "giant"],
    buyOptions: [
      { shop: "公式", url: "#", priceJpy: 7800, priceUsd: 52, region: "global" },
    ],
    popularity: 56,
    imagePalette: { from: "#7A8A4C", to: "#404930" },
    imageEmoji: "🎒",
    tagsJa: ["アウトドア", "ハイキング"],
    tagsEn: ["outdoor", "hiking"],
  },
  {
    id: "mighty-paw-led-collar",
    brand: "Mighty Paw",
    brandCountry: "US",
    nameJa: "LED ライトアップカラー",
    nameEn: "LED Light-Up Collar",
    descJa:
      "夜の散歩・キャンプ・災害時の視認性確保。USB充電対応。",
    descEn:
      "USB-rechargeable LED collar for visibility at night, on hikes, and in emergencies.",
    category: "env",
    sizes: [
      { label: "S", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 25, neckMax: 35 },
      { label: "M", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 35, neckMax: 50 },
      { label: "L", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 50, neckMax: 65 },
    ],
    concerns: ["outdoor-camping", "disaster-prep", "long-walker"],
    fitsBreedSizes: ["small", "medium", "large", "giant"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 2280, priceUsd: 15, region: "global" },
    ],
    popularity: 60,
    imagePalette: { from: "#3F5C70", to: "#1A2630" },
    imageEmoji: "💡",
    tagsJa: ["夜散歩", "視認性", "USB充電"],
    tagsEn: ["night-walk", "visibility", "usb"],
  },
  {
    id: "kurgo-loft-bed",
    brand: "Kurgo",
    brandCountry: "US",
    nameJa: "ロフトワンダーベッド(携帯ベッド)",
    nameEn: "Loft Wander Travel Bed",
    descJa:
      "丸めて持ち運べる旅行用ベッド。ペットホテル・キャンプ・引越し直後の安心アイテムに。",
    descEn:
      "Roll-up travel bed. Familiar smell that calms in hotels, campsites, or after moves.",
    category: "env",
    sizes: [
      { label: "Medium", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "Large", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["boarding", "moving-home", "outdoor-camping"],
    fitsBreedSizes: ["small", "medium", "large"],
    buyOptions: [
      { shop: "公式", url: "#", priceJpy: 6800, priceUsd: 45, region: "global" },
    ],
    popularity: 56,
    imagePalette: { from: "#A8967C", to: "#5C4A2E" },
    imageEmoji: "🛏️",
    tagsJa: ["ベッド", "旅行", "携帯"],
    tagsEn: ["bed", "travel", "portable"],
  },

  // ─── 体型別フィット系 ───────────────────────────────────
  {
    id: "pooch-outfitters-long-body",
    brand: "Pooch Outfitters",
    brandCountry: "US",
    nameJa: "ロングボディフード(胴長犬向け)",
    nameEn: "Long-Body Hoodie (Dachshund/Corgi cut)",
    descJa:
      "ダックスフンドやコーギーの胴長体型に合わせたパターンで作られたフード。",
    descEn:
      "Hoodie cut specifically for long-back breeds like Dachshunds and Corgis.",
    category: "apparel",
    sizes: [
      { label: "XS-Long", chestMin: 30, chestMax: 38, backMin: 28, backMax: 35, neckMin: 22, neckMax: 28 },
      { label: "S-Long", chestMin: 38, chestMax: 46, backMin: 33, backMax: 42, neckMin: 26, neckMax: 32 },
      { label: "M-Long", chestMin: 46, chestMax: 56, backMin: 40, backMax: 50, neckMin: 30, neckMax: 38 },
    ],
    concerns: ["long-back", "small-breed", "mix-fit"],
    fitsBreedSizes: ["small", "medium"],
    buyOptions: [
      { shop: "公式", url: "#", priceJpy: 4980, priceUsd: 33, region: "global" },
    ],
    popularity: 64,
    imagePalette: { from: "#D8B388", to: "#7A4F28" },
    imageEmoji: "🌭",
    tagsJa: ["胴長", "ダックス◯", "コーギー◯"],
    tagsEn: ["long-back", "dachshund", "corgi"],
  },
  {
    id: "frenchbull-wide-vest",
    brand: "Frenchic",
    brandCountry: "JP",
    nameJa: "ワイドチェストベスト(短頭種向け)",
    nameEn: "Wide-Chest Vest (brachy fit)",
    descJa:
      "フレンチブル・パグ等の太い胸囲に合わせた特殊パターン。アジャスタ付き。",
    descEn:
      "Cut for wide-chested brachy breeds. Adjustable straps.",
    category: "apparel",
    sizes: [
      { label: "1", chestMin: 38, chestMax: 48, backMin: 22, backMax: 28, neckMin: 28, neckMax: 36 },
      { label: "2", chestMin: 48, chestMax: 58, backMin: 28, backMax: 34, neckMin: 32, neckMax: 42 },
      { label: "3", chestMin: 58, chestMax: 68, backMin: 32, backMax: 38, neckMin: 36, neckMax: 48 },
    ],
    concerns: ["wide-chest", "mix-fit", "slips-off"],
    fitsBreedSizes: ["small", "medium"],
    buyOptions: [
      {
        shop: "楽天",
        target: { network: "rakuten", shopCode: "inuya", itemCode: "idwt-ch138" },
        priceJpy: 5800,
        region: "jp",
      },
    ],
    popularity: 60,
    imagePalette: { from: "#E0C0A0", to: "#7A5028" },
    imageEmoji: "🦴",
    tagsJa: ["フレブル◯", "パグ◯", "ワイドチェスト"],
    tagsEn: ["frenchie", "pug", "wide-chest"],
  },

  // ─── 災害対策・その他 ──────────────────────────────────
  {
    id: "bivvy-emergency-kit",
    brand: "Bivvy",
    brandCountry: "US",
    nameJa: "ペット防災キット",
    nameEn: "Pet Emergency Kit",
    descJa:
      "ペット用の非常持ち出しキット。フード・水・首輪・ライト等を一式パッケージ化。",
    descEn:
      "Pet go-bag bundle with food, water, ID, and light essentials.",
    category: "env",
    sizes: [
      { label: "Standard", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["disaster-prep"],
    fitsBreedSizes: ["tiny", "small", "medium", "large"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 5980, priceUsd: 40, region: "global" },
    ],
    popularity: 50,
    imagePalette: { from: "#C44A3A", to: "#5A2014" },
    imageEmoji: "🆘",
    tagsJa: ["防災", "非常用"],
    tagsEn: ["disaster", "emergency"],
  },
  {
    id: "petsafe-paw-balm",
    brand: "Musher's Secret",
    brandCountry: "CA",
    nameJa: "肉球ワックス(マッシャーズシークレット)",
    nameEn: "Paw Wax",
    descJa:
      "肉球に塗ると保護膜を作る天然ワックス。熱いアスファルト・凍結路面・乾燥対策に。",
    descEn:
      "Natural beeswax-based barrier for hot pavement, ice, and dry pads.",
    category: "env",
    sizes: [
      { label: "60g", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
      { label: "200g", chestMin: 0, chestMax: 200, backMin: 0, backMax: 200, neckMin: 0, neckMax: 200 },
    ],
    concerns: ["asphalt-hot", "cold-paws", "long-walker"],
    fitsBreedSizes: ["tiny", "small", "medium", "large", "giant"],
    buyOptions: [
      { shop: "Amazon", url: "#", priceJpy: 2480, priceUsd: 17, region: "global" },
    ],
    popularity: 72,
    imagePalette: { from: "#E0BC78", to: "#7A5A28" },
    imageEmoji: "🍯",
    tagsJa: ["肉球ケア", "万能"],
    tagsEn: ["paw-care", "all-season"],
  },
];

// generated.json + manual-images.json で取得済みの画像URLを各商品にマージ。
// rakuten 自動取得の方を優先 (より「正規品」確度が高い)、無ければ manual を採用。
for (const p of rawProducts) {
  if (p.imageUrl) continue;
  if (rakutenImages[p.id]) p.imageUrl = rakutenImages[p.id];
  else if (manualImages[p.id]) p.imageUrl = manualImages[p.id];
}

import { buildAffiliateUrl } from "./affiliate";

/**
 * BuyOption を実際にユーザーが踏む URL に解決する。
 * target が設定されていればアフィリエイトリンク、なければ url を返す。
 * どちらも無い場合は "#"。
 */
export function resolveBuyUrl(opt: BuyOption): string {
  if (opt.target) return buildAffiliateUrl(opt.target);
  if (opt.url) return opt.url;
  return "#";
}

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

/**
 * Amazon JP の検証済み ASIN。WebSearch で実商品ページを確認して人気上位から拾った物のみ。
 * ここにある商品は ASIN 直リンク、無い物は検索 URL にフォールバック。
 * 追加するときは: 該当商品ページを開いて URL の /dp/XXXXX を貼る → サイズ違いがあっても
 * Amazon の variant selector で他サイズに切り替えできるので、代表 1 つで OK。
 */
export const ASIN_OVERRIDES_JP: Record<string, string> = {
  // 第1バッチ (popularity ≥ 80)
  "kong-classic": "B00ZZB2OEE",
  "ruffwear-front-range": "B07B4T2DF5",
  "furminator-deshed": "B07NSNDHH1",
  "outward-hound-puzzle": "B0711Y9XTF",
  "puppia-soft-harness": "B00IHBY3SE",
  "nylabone-dura-chew": "B0002ASNAM",
  // 第2バッチ (popularity 64-78)
  "hertzko-slicker": "B077JVB51X",
  "petsafe-treat-pouch": "B000JCWAWA",
  "kong-wobbler": "B00FMYXFHY",
  "outward-hound-slow-bowl": "B093K7D53V",
  "gentle-leader-headcollar": "B0009X0QUC",
  "snuggle-puppy": "B000C9YHFS",
  "westpaw-jive": "B0070S62U2",
  "carlson-pet-gate": "B01DVTUM3G",
  "petsafe-paw-balm": "B0002IJQDC",
  "petsafe-easy-walk": "B0009ZD3QY",
  "virbac-toothpaste": "B0095AJOL2",
  "adaptil-spray": "B0B3VX2YP4",
  "sherpa-carrier": "B000FLETX8",
  "thundershirt": "B0029PY7SK",
  "petsafe-busy-buddy": "B000A61GNO",
  "wahl-bravura-trimmer": "B09YHJ1CJJ",
  "ifetch-launcher": "B00LZSYVFG",
  "burts-bees-shampoo": "B00CEY5NE8",
  "baskerville-muzzle": "B0051H45GC",
};

/**
 * Amazon 行で target が未設定 (url: "#") のものを ASIN または検索URLターゲットに置換する。
 * ASIN_OVERRIDES_JP に id があれば直リンク、なければ brand+nameJa で検索 URL を生成する。
 *
 * 同時に、target も無く url も "#" のままの buyOption (= 楽天/公式の未実装プレースホルダ)
 * をドロップする。死リンクボタンを表示してユーザの信頼を損なうのを防ぐため。
 *
 * 過去に ASIN ベースで Amazon 画像 CDN の推測 URL を埋めるロジックがあったが、
 * legacy "P/" path のヒット率が低く SNS シェアや一覧で「壊れた画像」 が出るケース多発のため
 * 廃止。imageUrl が無い商品はそのまま空のまま → visibleProducts フィルタで非表示にする。
 * PA-API 承認後に正規 URL を持てば自動的に復活する設計は維持。
 */
function enrichAmazonSearchTargets(list: Product[]): Product[] {
  return list.map((p) => {
    const buyOptions = p.buyOptions
      .map((b): BuyOption => {
        if (b.shop !== "Amazon" || b.target) return b;
        const asin = ASIN_OVERRIDES_JP[p.id];
        if (asin) {
          return { ...b, target: { network: "amazon-jp", asin } };
        }
        return {
          ...b,
          target: {
            network: "amazon-search-jp",
            query: `${p.brand} ${p.nameJa}`,
          },
        };
      })
      .filter((b) => b.target || (b.url && b.url !== "#"));
    return { ...p, buyOptions };
  });
}

export const products: Product[] = enrichAmazonSearchTargets([
  ...rawProducts,
  ...amazonBestsellers,
]);

/**
 * 一覧/検索/ブランドリストはこちらを使う。imageUrl 未設定の商品は表示せず、
 * カードを置いてもプレースホルダばかりになって UX が崩れるのを防ぐ。
 *
 * 詳細ページ (/products/[id]) は products + getProduct(id) のフルリストを
 * 使い続ける: ブックマーク済みリンクや SNS シェア URL を 404 にしないため。
 * sitemap も visibleProducts のみ載せ、imageUrl 取得後に自動で公開対象に戻す。
 */
export const visibleProducts: Product[] = products.filter((p) =>
  Boolean(p.imageUrl),
);

export function getPopularProducts(limit = 6): Product[] {
  return [...products]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return visibleProducts.filter((p) => p.category === category);
}

export function listBrands(): string[] {
  return Array.from(new Set(visibleProducts.map((p) => p.brand))).sort();
}

/**
 * Amazon-bestseller 由来の商品の TOP N を popularity 降順で返す。
 * id プレフィックス "amz-" で識別 (build-amazon-bestsellers.mjs 規約)。
 * 画像必須なので visibleProducts ベース。
 */
export function getAmazonTopN(n: number): Product[] {
  return visibleProducts
    .filter((p) => p.id.startsWith("amz-"))
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, n);
}

/**
 * 詳細ページの「同じブランドの他商品」 rail 用。同一ブランド名で別 ID の商品を
 * popularity 順に切り出す。MIX 起源 (amz-* + curated 同一ブランド) も問題なく
 * 拾える。
 */
export function getRelatedByBrand(
  productId: string,
  limit = 8,
): Product[] {
  const me = getProduct(productId);
  if (!me) return [];
  return visibleProducts
    .filter((p) => p.id !== productId && p.brand === me.brand)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

/**
 * 詳細ページの「似た悩みの他商品」 rail 用。concern オーバーラップ件数で
 * スコアし、同点は popularity で降順。同じ category 縛り (apparel-only 等) は
 * かけない: 「散歩で引っ張る」 という悩みでハーネスとリードと服が並んで OK。
 */
export function getRelatedByConcerns(
  productId: string,
  limit = 8,
): Product[] {
  const me = getProduct(productId);
  if (!me || me.concerns.length === 0) return [];
  const myConcerns = new Set(me.concerns);
  const scored = visibleProducts
    .filter((p) => p.id !== productId)
    .map((p) => {
      const overlap = p.concerns.filter((c) => myConcerns.has(c)).length;
      return { p, overlap };
    })
    .filter((x) => x.overlap > 0);
  scored.sort(
    (a, b) =>
      b.overlap - a.overlap || b.p.popularity - a.p.popularity,
  );
  return scored.slice(0, limit).map((x) => x.p);
}
