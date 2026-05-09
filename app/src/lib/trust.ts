import { ASIN_OVERRIDES_JP, type Product } from "./products";

/**
 * 商品ごとの「検証シグナル」。mybest 風の「検証ポイント」表示の元データ。
 *
 * 重要: ★評価やレビュー数は持っていない (Amazon PA-API 未承認、スクレイピング
 * は ToS で禁止)。なのでここで返す情報は **嘘がない事実だけ**:
 *   - どこから来た商品データか (Amazon ベストセラー / 編集部選定)
 *   - 商品リンク先 ASIN を編集部が確認したか
 *   - データ取得日 (site.lastUpdated)
 *
 * UI 側はこれを 「Amazon JP 売れ筋上位」「編集部選定」「ASIN 確認済み」 等の
 * 客観的バッジ + 検証ノート文に変換して、信頼を盛らずに示す。
 */

export type TrustSource = "amazon-bestseller" | "curated";

export type ProductTrust = {
  source: TrustSource;
  hasVerifiedAsin: boolean;
};

/**
 * id プレフィックスでデータ出処を判定。amazon-bestsellers.generated.ts が
 * 生成する全 ID は "amz-{cat}-{asin}" で始まるので識別できる。
 */
export function getProductTrust(p: Product): ProductTrust {
  const source: TrustSource = p.id.startsWith("amz-")
    ? "amazon-bestseller"
    : "curated";
  return {
    source,
    hasVerifiedAsin: Boolean(ASIN_OVERRIDES_JP[p.id]),
  };
}
