import Link from "next/link";
import { notFound } from "next/navigation";
import { HomeBreedRail } from "@/components/HomeBreedRail";
import { HomeConcernGrid } from "@/components/HomeConcernGrid";
import { HomeGuideFeature } from "@/components/HomeGuideFeature";
import { PopularRankingRail } from "@/components/PopularRankingRail";
import { ProductFeed } from "@/components/ProductFeed";
import { SeasonalBanner } from "@/components/SeasonalBanner";
import { chipLabel, getPopularConcerns } from "@/lib/concerns";
import { buildFeedItems } from "@/lib/feed";
import {
  StructuredData,
  organizationSchema,
  webSiteSchema,
} from "@/lib/structured-data";
import { getDictionary, hasLocale } from "./dictionaries";

/**
 * TOP ページ — エディトリアル構造 (mockup top-app.jsx と整合)。
 *
 *   Hero → 00 Ranking → 01 Breeds rail → 02 Concerns grid → 03 Guides feature
 *        → 04 Curated feed → 05 Seasonal banner → 06 Bottom CTA
 *
 * Phase 7 で旧 Mercari reel × 4 を 1 chunk に圧縮し、BreedRail / ConcernGrid
 * を新設してデザイナーの TOP 構成を満たす。
 */

export const dynamic = "force-dynamic";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const root = `/${locale}`;

  const concernChips = getPopularConcerns(8);
  const feedItems = buildFeedItems(locale).slice(0, 24);

  return (
    <div className="pb-12">
      <StructuredData
        items={[organizationSchema(locale), webSiteSchema(locale)]}
      />

      {/* Hero: 左寄せエディトリアル (Phase 4) */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-5 py-10 md:py-16">
          <span className="t-eyebrow-line">{dict.hero.eyebrow}</span>
          <h1 className="mt-5 max-w-3xl whitespace-pre-line text-balance text-3xl font-extrabold leading-[1.15] tracking-[-0.025em] text-foreground md:text-5xl">
            {dict.hero.title}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-fg md:text-base">
            {dict.hero.tagline}
          </p>
          <div
            className="mt-7 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1"
            style={{ scrollbarWidth: "none" }}
            role="group"
            aria-label={
              locale === "ja"
                ? "人気の悩みから探す"
                : "Browse by popular concerns"
            }
          >
            {concernChips.map((c) => (
              <Link
                key={c.id}
                href={`${root}/concerns/${c.id}`}
                className="inline-flex shrink-0 items-center rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-muted-fg transition-colors hover:border-primary hover:text-primary md:text-sm"
              >
                {chipLabel(c, locale)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 00. 今週よく売れている */}
      <PopularRankingRail locale={locale} />

      {/* 01. うちの子から探す (犬種シルエット rail) */}
      <HomeBreedRail locale={locale} />

      {/* 02. 悩みから探す (15 grid、パーチメント地) */}
      <HomeConcernGrid locale={locale} />

      {/* 03. 選び方ガイド (編集メディア 3 件) */}
      <HomeGuideFeature locale={locale} />

      {/* 04. 編集部 curated 商品 (旧 reel × 4 chunks を 1 chunk に圧縮) */}
      <ProductFeed
        items={feedItems}
        locale={locale}
        showHeader
        titleJa="編集部が選ぶ、今月の curation"
        titleEn="This month's editor picks"
      />

      {/* 05. 季節バナー */}
      <SeasonalBanner locale={locale} />

      {/* 06. Bottom CTA (うちの子 ウィザード) */}
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
            href={`${root}/my-dog`}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-background px-6 py-3 text-sm font-bold text-foreground transition-transform hover:-translate-y-0.5"
          >
            {dict.hero.cta_primary} →
          </Link>
        </div>
      </section>
    </div>
  );
}
