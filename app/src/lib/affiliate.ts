/**
 * アフィリエイトリンク生成レイヤー。
 *
 * 各商品の BuyOption は target で「どのネットワークの何の商品」かを宣言し、
 * 実際のURLはこの buildAffiliateUrl() で環境変数の associate ID と組み合わせて生成する。
 *
 * 環境変数(Netlify で設定):
 *   AMAZON_ASSOC_TAG_JP   = xxxxxxx-22  (amazon.co.jp 用)
 *   AMAZON_ASSOC_TAG_US   = xxxxxxx-20  (amazon.com 用)
 *   RAKUTEN_AFFILIATE_ID  = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *   VALUECOMMERCE_SID     = xxxxxxx
 *   VALUECOMMERCE_PID     = xxxxxxx
 *   A8_PROGRAM_TRACKING   = a8mat=xxxxxxxxxxxx (個別案件ごとに発行される)
 *   IMPACT_PARTNER_ID     = xxxxxx
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
      network: "amazon-us";
      asin: string;
    }
  | {
      // ASIN 未取得の商品向けフォールバック。検索結果ページへ誘導する。
      // 検索ページ経由でも、ユーザーが当日中に Amazon で購入すれば 24h cookie で計上される。
      network: "amazon-search-jp";
      query: string;
    }
  | {
      network: "amazon-search-us";
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
      network: "valuecommerce";
      directUrl: string; // VC で広告主のリンクを発行した先(deep link)
    }
  | {
      network: "a8";
      programTracking: string; // a8mat=xxxx などの個別案件パラメータ
      directUrl: string; // 遷移先URL
    }
  | {
      network: "impact";
      brandSubdomain: string; // 例: "ruffwear"
      productPath: string;
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
    case "amazon-us": {
      const tag = env("AMAZON_ASSOC_TAG_US");
      const base = `https://www.amazon.com/dp/${target.asin}`;
      return tag ? `${base}?tag=${encodeURIComponent(tag)}` : base;
    }
    case "amazon-search-jp": {
      const tag = env("AMAZON_ASSOC_TAG_JP");
      const base = `https://www.amazon.co.jp/s?k=${encodeURIComponent(target.query)}`;
      return tag ? `${base}&tag=${encodeURIComponent(tag)}` : base;
    }
    case "amazon-search-us": {
      const tag = env("AMAZON_ASSOC_TAG_US");
      const base = `https://www.amazon.com/s?k=${encodeURIComponent(target.query)}`;
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
    case "valuecommerce": {
      const sid = env("VALUECOMMERCE_SID");
      const pid = env("VALUECOMMERCE_PID");
      if (!sid || !pid) return target.directUrl;
      const encoded = encodeURIComponent(target.directUrl);
      return `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=${sid}&pid=${pid}&vc_url=${encoded}`;
    }
    case "a8": {
      // A8.net はリンク発行時に専用URL(`https://px.a8.net/svt/ejp?a8mat=...&a8ejpredirect=...`)を取得する。
      // 個別案件のトラッキングパラメータを programTracking に保持し、
      // 遷移先URLを a8ejpredirect として組み立てる。
      const encoded = encodeURIComponent(target.directUrl);
      return `https://px.a8.net/svt/ejp?${target.programTracking}&a8ejpredirect=${encoded}`;
    }
    case "impact": {
      const partnerId = env("IMPACT_PARTNER_ID");
      const url = `https://${target.brandSubdomain}.com${target.productPath}`;
      if (!partnerId) return url;
      // Impact は通常 brand 個別の deeplink を発行するため、partnerId を queryに付ける程度
      return `${url}?irgwc=1&clickid=${partnerId}`;
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
