/**
 * Schema.org JSON-LD ビルダー。Google の Rich Results に出るための構造化データを
 * server component で出力する用途。
 *
 * 重要な原則: **持っていないデータはそもそも出さない**。aggregateRating や
 * reviewCount は ★/レビュー数を取れないので絶対に含めない (フェイク = ペナルティ
 * 対象)。offers の availability も在庫を確認していないので省略する。
 *
 * 出力した JSON-LD は <script type="application/ld+json"> で埋め込み、
 * page.tsx の戻り値の中でレンダーすること。複数ブロック並列 OK (FAQ + Article 等)。
 */

import type { Guide, GuideSection } from "./guides";
import type { Product } from "./products";
import { absoluteUrl, site, siteUrl } from "./site";

type JsonLd = Record<string, unknown>;

/**
 * 商品ページ用 Product schema。offers は buyOptions 全部を array で出す。
 * 価格 + 通貨があれば Google の rich result 条件を満たす。
 */
export function productSchema(
  product: Product,
  pageUrl: string,
  resolvedBuyUrls: string[],
  locale: "ja" | "en",
): JsonLd {
  const name = locale === "ja" ? product.nameJa : product.nameEn;
  const desc = locale === "ja" ? product.descJa : product.descEn;
  const offers = product.buyOptions.map((opt, i) => ({
    "@type": "Offer",
    url: resolvedBuyUrls[i] ?? pageUrl,
    priceCurrency: "JPY",
    price: opt.priceJpy,
    seller: { "@type": "Organization", name: opt.shop },
  }));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: desc,
    brand: { "@type": "Brand", name: product.brand },
    image: product.imageUrl ? [product.imageUrl] : undefined,
    offers: offers.length > 1 ? offers : offers[0],
    url: pageUrl,
  };
}

/**
 * ガイドページ用 Article schema。Article schema は publisher + datePublished が
 * 必須要件 (Google ガイドライン)。
 */
export function articleSchema(
  guide: Guide,
  pageUrl: string,
  locale: "ja" | "en",
): JsonLd {
  const headline = locale === "ja" ? guide.titleJa : guide.titleEn;
  const desc = locale === "ja" ? guide.leadJa : guide.leadEn;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description: desc,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt ?? guide.publishedAt,
    author: {
      "@type": "Organization",
      name: locale === "ja" ? guide.authorJa : guide.authorEn,
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: locale === "ja" ? site.nameJa : site.nameEn,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/icon.png"),
      },
    },
    mainEntityOfPage: pageUrl,
    url: pageUrl,
  };
}

/**
 * FAQ アコーディオンを Google の SERP で展開表示してもらう FAQPage schema。
 * ガイドの faq セクションから引く。
 */
export function faqSchema(
  guide: Guide,
  locale: "ja" | "en",
): JsonLd | null {
  const faqSection = guide.sections.find(
    (s): s is Extract<GuideSection, { kind: "faq" }> => s.kind === "faq",
  );
  if (!faqSection) return null;
  const items = locale === "ja" ? faqSection.itemsJa : faqSection.itemsEn;
  if (items.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: it.a,
      },
    })),
  };
}

/**
 * 検索結果ページ用 ItemList schema。商品 ID 付きで上位を列挙すれば、
 * Google の SERP で「検索結果ページ」 として認識されるシグナルになる。
 */
export function itemListSchema(
  productIds: string[],
  locale: "ja" | "en",
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: productIds.slice(0, 20).map((id, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/${locale}/products/${id}`),
    })),
  };
}

/**
 * 全ページ共通 Organization schema。root layout に置く想定。
 */
export function organizationSchema(locale: "ja" | "en"): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: locale === "ja" ? site.nameJa : site.nameEn,
    url: siteUrl,
    logo: absoluteUrl("/icon.png"),
    sameAs: site.twitter
      ? [`https://twitter.com/${site.twitter.replace(/^@/, "")}`]
      : undefined,
  };
}

/**
 * Home page の WebSite schema。search box の potentialAction を入れて
 * SERP の sitelinks search box に出る可能性を上げる。
 */
export function webSiteSchema(locale: "ja" | "en"): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: locale === "ja" ? site.nameJa : site.nameEn,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/${locale}/results?concerns={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * BreadcrumbList schema。詳細ページや guide 等で「Home > Category > Item」
 * のパンくずを SERP に表示させる。
 */
export function breadcrumbSchema(
  trail: { name: string; url: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: t.url,
    })),
  };
}

/**
 * <script type="application/ld+json"> を返すヘルパ。複数渡すと連結される。
 */
export function StructuredData({ items }: { items: (JsonLd | null)[] }) {
  const blocks = items.filter((b): b is JsonLd => b != null);
  if (blocks.length === 0) return null;
  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          // 値は server で生成された JSON で、ユーザ入力は含まない (canon URL 等)。
          // それでも </script> 流入を避けるため最低限のエスケープ。
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(block).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
