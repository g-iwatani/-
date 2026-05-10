import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryGrid } from "@/components/CategoryGrid";
import { GuideCard } from "@/components/GuideCard";
import { type FeedItem, ProductFeed } from "@/components/ProductFeed";
import { Rail, RailItem } from "@/components/Rail";
import { RecentRail } from "@/components/RecentRail";
import { guides } from "@/lib/guides";
import { topPopular } from "@/lib/popular-products";
import { listBrands, visibleProducts as products } from "@/lib/products";
import {
  StructuredData,
  organizationSchema,
  webSiteSchema,
} from "@/lib/structured-data";
import { getDictionary, hasLocale } from "./dictionaries";

// SSG cache file が約 1.7 MB に膨らむと OpenNext / Cloudflare Workers の
// 内部しきい値で配信されず 404 になる事象を /ja/popular と同じく回避するため、
// 動的レンダーに切替。今後の改善で rails のデータ量を絞ったら SSG に戻す。
export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const root = `/${locale}`;

  // RecentRail (client) に渡す id → Product lookup
  const recentLookup: Record<string, (typeof products)[number]> = {};
  for (const p of products) recentLookup[p.id] = p;

  // メルカリ風 reel の元データを構築。Amazon / 楽天 / 編集部 の商品をミックスして
  // popularity 順で 60 件まで切り出す。画像必須 (visual reel なので)。
  const feedItems = buildFeedItems(locale).slice(0, 60);

  return (
    <div className="pb-12">
      <StructuredData
        items={[organizationSchema(locale), webSiteSchema(locale)]}
      />

      {/* Hero (compact: コピー最小 + メイン CTA 1個。検索バーはヘッダーに集約) */}
      <section className="relative border-b border-border bg-gradient-to-b from-primary-soft/30 to-background">
        <div className="mx-auto max-w-5xl px-5 py-5 md:py-7">
          <div className="text-center">
            <p className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-fg md:text-[11px]">
              {dict.hero.eyebrow}
            </p>
            <h1 className="mt-2 text-xl font-extrabold leading-tight tracking-tight text-foreground md:text-3xl">
              {dict.hero.title}
            </h1>
            <div className="mt-4">
              <Link
                href={`${root}/search`}
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-fg shadow-md shadow-primary/20 transition-transform hover:-translate-y-0.5"
              >
                {dict.hero.cta_primary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category icon grid (Mercari/ZOZO 流の 1-tap カテゴリ動線) */}
      <CategoryGrid locale={locale} />

      {/* Recently viewed (localStorage、空なら非表示) */}
      <RecentRail locale={locale} lookup={recentLookup} />

      {/* メルカリ風 reel: Amazon + 楽天 + 編集部商品の縦無限 grid (mock 60件) */}
      <ProductFeed items={feedItems} locale={locale} />

      {/* Buying guides rail (1 つだけ残す。コンテンツ surface 露出) */}
      <Rail
        title={locale === "ja" ? "選び方ガイド" : "Buying guides"}
        subtitle={
          locale === "ja"
            ? "編集部が悩み別に書き下ろし"
            : "Editor-written, concern-first"
        }
        viewAllHref={`${root}/guides/${guides[0]?.slug ?? ""}`}
        viewAllLabel={
          locale === "ja" ? "全ガイドを見る" : "All guides"
        }
      >
        {guides.map((g) => (
          <RailItem key={g.slug}>
            <GuideCard guide={g} locale={locale} />
          </RailItem>
        ))}
      </Rail>

      {/* Brands list (フッター手前のサブ動線) */}
      <Rail
        title={locale === "ja" ? "ブランド一覧" : "Brands we cover"}
        subtitle={
          locale === "ja"
            ? "国内外のブランドを横断して比較"
            : "Compare across global brands"
        }
        viewAllHref={`${root}/results`}
      >
        {listBrands().map((brand) => (
          <RailItem key={`brand-${brand}`}>
            <Link
              href={`${root}/results?brand=${encodeURIComponent(brand)}`}
              className="flex h-20 w-[160px] items-center justify-center rounded-2xl border border-card-border bg-card px-4 text-sm font-bold text-foreground transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary md:h-24 md:w-[180px]"
            >
              {brand}
            </Link>
          </RailItem>
        ))}
      </Rail>

      {/* Bottom CTA (検索 question flow への secondary 動線) */}
      <section className="mx-auto mt-16 max-w-4xl px-5">
        <div className="rounded-3xl bg-primary p-8 text-primary-fg md:p-12">
          <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            {locale === "ja"
              ? "うちの子に何が合うか、まだ迷ってる?"
              : "Still wondering what fits your dog?"}
          </h2>
          <p className="mt-2 text-sm opacity-90 md:text-base">
            {locale === "ja"
              ? "犬種・採寸・困りごとを入れるだけで、複数ブランドを横断したレコメンドが出ます。"
              : "Plug in breed, measurements, and concerns. We surface matching items across many brands."}
          </p>
          <Link
            href={`${root}/search`}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-background px-6 py-3 text-sm font-bold text-foreground transition-transform hover:-translate-y-0.5"
          >
            {dict.hero.cta_primary} →
          </Link>
        </div>
      </section>
    </div>
  );
}

/**
 * メルカリ風 reel の元データ生成。
 * - Amazon-bestseller (id "amz-*"): popularity がそのまま 0-100 で乗ってる
 * - 楽天 popular: bestRank が低い (= 上位) ほど高 popularity
 * - 編集部 (curated, "amz-*" 以外): popularity 0-100
 *
 * 全部同じ FeedItem 形に揃え、popularity 降順でソート。画像なしは弾く。
 */
function buildFeedItems(locale: "ja" | "en"): FeedItem[] {
  const items: { item: FeedItem; pop: number }[] = [];

  for (const p of products) {
    if (!p.imageUrl) continue;
    const isAmazon = p.id.startsWith("amz-");
    const lowest = Math.min(...p.buyOptions.map((b) => b.priceJpy));
    items.push({
      item: {
        key: p.id,
        source: isAmazon ? "amazon" : "curated",
        href: `/${locale}/products/${p.id}`,
        isExternal: false,
        imageUrl: p.imageUrl,
        brand: p.brand,
        name: locale === "ja" ? p.nameJa : p.nameEn,
        priceJpy: lowest,
      },
      pop: p.popularity,
    });
  }

  for (const p of topPopular(40)) {
    if (!p.imageUrl) continue;
    items.push({
      item: {
        key: `rkt-${p.id}`,
        source: "rakuten",
        href: p.affiliateUrl,
        isExternal: true,
        imageUrl: p.imageUrl,
        brand: p.shopName,
        name: p.nameJa,
        priceJpy: p.priceJpy,
      },
      // bestRank: 1 (最良) ≈ 99、20位 ≈ 80。100 - bestRank で popularity 0-100 化
      pop: Math.max(0, 100 - p.bestRank),
    });
  }

  items.sort((a, b) => b.pop - a.pop);
  return items.map((x) => x.item);
}
