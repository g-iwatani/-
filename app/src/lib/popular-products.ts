/**
 * 楽天市場ランキングから取得した人気商品データ。
 *
 * popular-products.generated.json は Claude in Chrome 経由で
 * 楽天の犬用品カテゴリ (https://ranking.rakuten.co.jp/daily/110725/110729/)
 * から取得して投入する。サーバ側 fetch は Akamai にブロックされるため、
 * 実ブラウザセッションが唯一の取得手段。
 *
 * 商品情報の充実度 (評価/レビュー数/カテゴリ) があるため、
 * サイト内で価格/評価/レビュー数/カテゴリでフィルタ&ソート可能。
 */

import generated from "./popular-products.generated.json";

export type PopularProductCategory =
  | "apparel"
  | "leash"
  | "bowl"
  | "house"
  | "toy"
  | "care"
  | "toilet"
  | "training"
  | "food"
  | "other";

export type PopularProduct = {
  /** shopCode/itemCode を結合した一意キー */
  id: string;
  nameJa: string;
  shopCode: string;
  itemCode: string;
  shopName: string;
  priceJpy: number;
  /** セール中の元値。表示があれば取り消し線で表示 */
  originalPriceJpy: number | null;
  imageUrl: string;
  /** 0-5 の小数。レビューが無いと null */
  ratingAvg: number | null;
  /** レビュー総数。無ければ 0 */
  ratingCount: number;
  /** 出現したカテゴリ名 (日本語) */
  categories: string[];
  /** カテゴリ別の最高順位。例: { "犬用品": 12, "犬服": 3 } */
  topRanks: Record<string, number>;
  /** ランキング横断での「最高順位」 */
  bestRank: number;
  /** 内部標準カテゴリ (フィルタ用) */
  internalCategory: PopularProductCategory;
};

type RawPopularProduct = Omit<PopularProduct, "id" | "bestRank" | "internalCategory">;

const CATEGORY_KEYWORD_MAP: Array<[RegExp, PopularProductCategory]> = [
  [/服|ウェア|ジャケット|コート|レインコート|タンク|シャツ|ベスト|ドレス|パーカー/, "apparel"],
  [/リード|ハーネス|首輪|胴輪|カラー/, "leash"],
  [/食器|フードボウル|給餌|スタンド/, "bowl"],
  [/ハウス|サークル|ケージ|ベッド|クッション|マット|ゲート|犬小屋|寝具/, "house"],
  [/おもちゃ|トイ|ボール|コング|ぬいぐるみ|ガム|デンタル(?!.*ケア)/, "toy"],
  [/ブラシ|爪切り|シャンプー|お手入れ|デシェディング|ケア(?!.*用品)|介護|耳/, "care"],
  [/トイレ|シーツ|シート|ペット.*シーツ|消臭/, "toilet"],
  [/しつけ|トレーニング|クリッカー|アジリティ/, "training"],
  [/フード|ごはん|おやつ|ジャーキー|ささみ|サプリ|栄養|缶詰|ドライ/, "food"],
];

function classify(p: RawPopularProduct): PopularProductCategory {
  const text = `${p.nameJa} ${p.categories.join(" ")}`.toLowerCase();
  for (const [re, cat] of CATEGORY_KEYWORD_MAP) {
    if (re.test(text)) return cat;
  }
  return "other";
}

function bestRankOf(topRanks: Record<string, number>): number {
  const values = Object.values(topRanks);
  return values.length === 0 ? 9999 : Math.min(...values);
}

const raw = generated as RawPopularProduct[];

export const popularProducts: PopularProduct[] = raw.map((p) => ({
  ...p,
  id: `${p.shopCode}/${p.itemCode}`,
  bestRank: bestRankOf(p.topRanks),
  internalCategory: classify(p),
}));

export type PopularSortKey =
  | "rank"
  | "rating"
  | "review_count"
  | "price_asc"
  | "price_desc"
  | "discount";

export function sortPopular(
  list: PopularProduct[],
  key: PopularSortKey,
): PopularProduct[] {
  const arr = [...list];
  switch (key) {
    case "rank":
      return arr.sort((a, b) => a.bestRank - b.bestRank);
    case "rating":
      return arr.sort(
        (a, b) => (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0) || b.ratingCount - a.ratingCount,
      );
    case "review_count":
      return arr.sort((a, b) => b.ratingCount - a.ratingCount);
    case "price_asc":
      return arr.sort((a, b) => a.priceJpy - b.priceJpy);
    case "price_desc":
      return arr.sort((a, b) => b.priceJpy - a.priceJpy);
    case "discount":
      return arr.sort((a, b) => discountRate(b) - discountRate(a));
  }
}

export function discountRate(p: PopularProduct): number {
  if (!p.originalPriceJpy || p.originalPriceJpy <= p.priceJpy) return 0;
  return (p.originalPriceJpy - p.priceJpy) / p.originalPriceJpy;
}

export type PopularFilters = {
  categories?: PopularProductCategory[];
  priceMin?: number;
  priceMax?: number;
  ratingMin?: number;
  reviewCountMin?: number;
  onSaleOnly?: boolean;
  excludeFood?: boolean;
};

export function filterPopular(
  list: PopularProduct[],
  f: PopularFilters,
): PopularProduct[] {
  return list.filter((p) => {
    if (f.excludeFood && p.internalCategory === "food") return false;
    if (f.categories && f.categories.length > 0 && !f.categories.includes(p.internalCategory))
      return false;
    if (f.priceMin !== undefined && p.priceJpy < f.priceMin) return false;
    if (f.priceMax !== undefined && p.priceJpy > f.priceMax) return false;
    if (f.ratingMin !== undefined && (p.ratingAvg ?? 0) < f.ratingMin) return false;
    if (f.reviewCountMin !== undefined && p.ratingCount < f.reviewCountMin)
      return false;
    if (f.onSaleOnly && discountRate(p) <= 0) return false;
    return true;
  });
}

/** ランキング上位を取得 (ランディング rail 用) */
export function topPopular(n: number): PopularProduct[] {
  return [...popularProducts]
    .sort((a, b) => a.bestRank - b.bestRank)
    .slice(0, n);
}
