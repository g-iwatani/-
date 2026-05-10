/**
 * アフィリエイトリンク生成レイヤー。
 *
 * 各商品の BuyOption は target で「どのネットワークの何の商品」かを宣言し、
 * 実際のURLはこの buildAffiliateUrl() で環境変数の associate ID と組み合わせて生成する。
 *
 * 環境変数 (wrangler.jsonc / Cloudflare Workers の vars):
 *   AMAZON_ASSOC_TAG_JP   = wanproblem-22  (amazon.co.jp 用)
 *   RAKUTEN_AFFILIATE_ID  = xxxxxxxx.xxxxxxxx.xxxxxxxx.xxxxxxxx
 *
 * MVP は JP 限定ローンチ。amazon-us / valuecommerce / a8 / impact 等の
 * 海外・直接プログラム連携は実商品データで使用されていなかったため整理し、
 * 必要になった時点で再導入する。
 *
 * 環境変数が設定されていない場合は、associate tag なしのプレーンなURLを返す。
 * これによって申請待ち期間中もリンクが「壊れずに動く」状態を維持する。
 */

export type AffiliateTarget =
  | {
      network: "amazon-jp";
      asin: string; // 例: "B07XXX1234"
    }
  | {
      // ASIN 未取得の商品向けフォールバック。検索結果ページへ誘導する。
      // 検索ページ経由でも、ユーザーが当日中に Amazon で購入すれば 24h cookie で計上される。
      network: "amazon-search-jp";
      query: string;
    }
  | {
      network: "rakuten";
      shopCode: string;
      itemCode: string; // shopCode/itemCode 形式
    }
  | {
      // 楽天市場の特定商品 ID が無い場合のフォールバック。検索結果ページに
      // affiliate ID 付きで送る。ユーザーが楽天内で当該商品 (or 類似品) を
      // 買えば成果計上される (24時間 cookie)。商品詳細ページで「楽天でも探す」
      // という cross-source 比較を成立させるために導入。
      network: "rakuten-search-jp";
      query: string;
    }
  | {
      network: "direct"; // ブランド公式サイト等、アフィリ無しでも遷移させる
      url: string;
    };

const env = (key: string) => process.env[key] ?? "";

export function buildAffiliateUrl(target: AffiliateTarget): string {
  switch (target.network) {
    case "amazon-jp": {
      const tag = env("AMAZON_ASSOC_TAG_JP");
      const base = `https://www.amazon.co.jp/dp/${target.asin}`;
      return tag ? `${base}?tag=${encodeURIComponent(tag)}` : base;
    }
    case "amazon-search-jp": {
      const tag = env("AMAZON_ASSOC_TAG_JP");
      const base = `https://www.amazon.co.jp/s?k=${encodeURIComponent(target.query)}`;
      return tag ? `${base}&tag=${encodeURIComponent(tag)}` : base;
    }
    case "rakuten": {
      const id = env("RAKUTEN_AFFILIATE_ID");
      const itemUrl = `https://item.rakuten.co.jp/${target.shopCode}/${target.itemCode}/`;
      if (!id) return itemUrl;
      // hb.afl.rakuten.co.jp/ichiba/{id}/ で楽天市場商品にトラッキング付与
      const encoded = encodeURIComponent(itemUrl);
      return `https://hb.afl.rakuten.co.jp/ichiba/${id}/?pc=${encoded}&m=${encoded}`;
    }
    case "rakuten-search-jp": {
      const id = env("RAKUTEN_AFFILIATE_ID");
      const searchUrl = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(target.query)}/`;
      if (!id) return searchUrl;
      const encoded = encodeURIComponent(searchUrl);
      return `https://hb.afl.rakuten.co.jp/ichiba/${id}/?pc=${encoded}&m=${encoded}`;
    }
    case "direct":
      return target.url;
  }
}

/** rel 属性を一元管理。FTC / 景表法 / Google 推奨に従う。
 *
 * - nofollow: リンクジュース漏らし防止 (Google 推奨)
 * - noopener: target=_blank の window.opener 攻撃防止
 * - sponsored: アフィリエイト関係性の機械可読表示 (Google 推奨)
 * - noreferrer: 自分の URL を遷移先に渡さないプライバシー配慮
 *   Amazon/楽天 はクエリ tag/scid で計上するので referrer 依存せず安全。
 */
export const AFFILIATE_REL = "nofollow noopener noreferrer sponsored";
