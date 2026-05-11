/**
 * メルカリ風 reel の元データ生成ロジック。TOP と /concerns/[id] が共有する。
 *
 * source 別 (Amazon / 楽天 / 編集部) に popularity 降順でソートし、
 * 「Amazon → 楽天 → 編集 → Amazon → ...」 のラウンドロビンで合流。
 * 各 source の popularity スケールが異なる (Amazon 50-80 / 楽天 80-99 /
 * curated 50-95) ため単純 sort だと楽天が上位を独占する問題を回避する。
 *
 * concernFilter 指定時は Product 側 concerns に含まれる物だけ通す。
 * 楽天 popular は元データに concern メタを持たないが、商品名キーワード
 * 推論で付与した concerns を使ってフィルタ可能 (悩み LP のカバー率を
 * 拡大するため)。推論ヒットが無い popular はフィルタ ON 時は除外される。
 */

import { popularByConcern, topPopular, displayShopName } from "./popular-products";
import { visibleProducts as products } from "./products";

export type FeedItem = {
  key: string;
  /** "amazon" / "楽天" / "編集" 表示の元データ。badge 色分けに使用。 */
  source: "amazon" | "rakuten" | "curated";
  /** クリック先 URL。external (楽天直リンク) は target=_blank + アフィリ rel */
  href: string;
  isExternal: boolean;
  imageUrl: string;
  brand: string;
  name: string;
  priceJpy: number;
  /**
   * 0-5 の評価値。データがあるソース (現在は楽天 popular のみ) で渡す。
   * Amazon は PA-API 未承認のため null、curated はそもそも元データ無し。
   */
  ratingAvg?: number | null;
  /** レビュー件数。0 や undefined の場合は非表示。 */
  ratingCount?: number;
};

export function buildFeedItems(
  locale: "ja" | "en",
  concernFilter?: string,
): FeedItem[] {
  const amazonGroup: { item: FeedItem; pop: number }[] = [];
  const curatedGroup: { item: FeedItem; pop: number }[] = [];
  const rakutenGroup: { item: FeedItem; pop: number }[] = [];

  for (const p of products) {
    if (!p.imageUrl) continue;
    if (concernFilter && !p.concerns.includes(concernFilter)) continue;
    const isAmazon = p.id.startsWith("amz-");
    const lowest = Math.min(...p.buyOptions.map((b) => b.priceJpy));
    const entry = {
      item: {
        key: p.id,
        source: isAmazon ? ("amazon" as const) : ("curated" as const),
        href: `/${locale}/products/${p.id}`,
        isExternal: false,
        imageUrl: p.imageUrl,
        brand: p.brand,
        name: locale === "ja" ? p.nameJa : p.nameEn,
        priceJpy: lowest,
      },
      pop: p.popularity,
    };
    (isAmazon ? amazonGroup : curatedGroup).push(entry);
  }

  const rakutenSource = concernFilter
    ? popularByConcern(concernFilter, 40)
    : topPopular(40);
  for (const p of rakutenSource) {
    if (!p.imageUrl) continue;
    rakutenGroup.push({
      item: {
        key: `rkt-${p.id}`,
        source: "rakuten",
        href: p.affiliateUrl,
        isExternal: true,
        imageUrl: p.imageUrl,
        brand: displayShopName(p.shopName),
        name: p.nameJa,
        priceJpy: p.priceJpy,
        // 楽天 Item Search API 由来の評価値・件数。アフィリ担当レビュー
        // 「ratingAvg/ratingCount を捨てている、★+件数 表示で CTR
        // +15-25% 取れる」 への対応で feed まで持ち越す。
        ratingAvg: p.ratingAvg,
        ratingCount: p.ratingCount,
      },
      // bestRank: 1 (最良) ≈ 99、20位 ≈ 80。100 - bestRank で popularity 0-100 化
      pop: Math.max(0, 100 - p.bestRank),
    });
  }

  amazonGroup.sort((a, b) => b.pop - a.pop);
  curatedGroup.sort((a, b) => b.pop - a.pop);
  rakutenGroup.sort((a, b) => b.pop - a.pop);

  // ラウンドロビン: Amazon → 楽天 → 編集 の順で 1 つずつ取る。空グループはスキップ。
  const out: FeedItem[] = [];
  const groups = [amazonGroup, rakutenGroup, curatedGroup];
  let i = 0;
  while (groups.some((g) => g[i])) {
    for (const g of groups) {
      if (g[i]) out.push(g[i].item);
    }
    i++;
  }
  return out;
}
