import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryGrid } from "@/components/CategoryGrid";
import { GuideCard } from "@/components/GuideCard";
import { ProductFeed } from "@/components/ProductFeed";
import { Rail, RailItem } from "@/components/Rail";
import {
  type Concern,
  chipLabel,
  concerns,
  getConcern,
  getConcernsByCategory,
  getPopularConcerns,
} from "@/lib/concerns";
import { buildFeedItems } from "@/lib/feed";
import { findGuidesForConcern, guides } from "@/lib/guides";
import { absoluteUrl, localizedAlternates } from "@/lib/site";
import {
  StructuredData,
  breadcrumbSchema,
} from "@/lib/structured-data";
import { getDictionary, hasLocale, locales } from "../../dictionaries";

/**
 * 悩み別ランディングページ。`/ja/concerns/cold-winter` のような static 経路。
 *
 * - URL クエリパラメータ ?concern= の filter 版とは別物。あちらは TOP の中の
 *   feed 絞り込み chip、こちらは SEO 用の専用 LP。
 * - generateStaticParams で 55 concerns × 2 locales = 110 ページを SSG。
 * - canonical は ?concerns= の results ページではなくこの URL に集約する。
 *   sitemap も /concerns/[id] を主、 /results?concerns= は副 (低 priority)。
 *
 * 構成: hero (悩み label + 説明) → 該当商品 reel → 関連悩み chip → guide rail
 */

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    concerns.map((c) => ({ locale, id: c.id })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/concerns/[id]">): Promise<Metadata> {
  const { locale, id } = await params;
  if (!hasLocale(locale)) return {};
  const concern = getConcern(id);
  if (!concern) return {};
  const label = locale === "ja" ? concern.labelJa : concern.labelEn;
  const desc = locale === "ja" ? concern.descJa : concern.descEn;
  const titleSuffix = locale === "ja" ? "わんプロブレム" : "WanProblem";
  const titleJa = `${label} — おすすめ犬用品 | ${titleSuffix}`;
  const titleEn = `${label} — Recommended dog products | ${titleSuffix}`;
  return {
    title: locale === "ja" ? titleJa : titleEn,
    description: desc,
    alternates: {
      canonical: `/${locale}/concerns/${id}`,
      languages: localizedAlternates(`/concerns/${id}`),
    },
    openGraph: {
      title: locale === "ja" ? titleJa : titleEn,
      description: desc,
      url: `/${locale}/concerns/${id}`,
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: locale === "ja" ? titleJa : titleEn,
      description: desc,
      images: ["/opengraph-image"],
    },
  };
}

export default async function ConcernPage({
  params,
}: PageProps<"/[locale]/concerns/[id]">) {
  const { locale, id } = await params;
  if (!hasLocale(locale)) notFound();
  const concern = getConcern(id);
  if (!concern) notFound();
  await getDictionary(locale);

  const root = `/${locale}`;
  const label = locale === "ja" ? concern.labelJa : concern.labelEn;
  const desc = locale === "ja" ? concern.descJa : concern.descEn;

  // この悩みに該当する商品 (Amazon + curated, 楽天は concern メタ無いので除外)
  const feedItems = buildFeedItems(locale, id);

  // 関連悩み: 同じカテゴリ内の他悩み (popularity 順、最大 6)
  const related = getConcernsByCategory(concern.category)
    .filter((c) => c.id !== id)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 6);

  // この悩みを直接扱うガイド。1 件以上ヒットすれば優先表示し、ゼロなら
  // 全ガイド rail にフォールバックする (LP のコンテンツ厚みを保つため)。
  const relatedGuides = findGuidesForConcern(id);
  const guidesToShow = relatedGuides.length > 0 ? relatedGuides : guides;
  const guidesAreFiltered = relatedGuides.length > 0;

  // 人気悩み (フッタ動線): TOP 8
  const popular = getPopularConcerns(8);

  return (
    <div className="pb-12">
      <StructuredData
        items={[
          breadcrumbSchema([
            {
              name: locale === "ja" ? "ホーム" : "Home",
              url: absoluteUrl(root),
            },
            {
              name: label,
              url: absoluteUrl(`${root}/concerns/${id}`),
            },
          ]),
        ]}
      />

      {/* Hero: H1 + 悩み説明文。SEO 上 H1 と冒頭テキストは同一悩みの語彙で揃える。 */}
      <section className="border-b border-border bg-gradient-to-b from-primary-soft/30 to-background">
        <div className="mx-auto max-w-3xl px-5 py-7 md:py-10">
          <nav
            aria-label="breadcrumb"
            className="text-[11px] text-muted-fg md:text-xs"
          >
            <Link href={root} className="hover:text-primary">
              {locale === "ja" ? "ホーム" : "Home"}
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-foreground">
              {locale === "ja" ? "悩み別" : "Concerns"}
            </span>
          </nav>
          <p className="mt-3 inline-flex items-center rounded-full border border-primary/30 bg-primary-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary md:text-xs">
            {locale === "ja" ? "悩み別おすすめ" : "Concern-first picks"}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
            {label}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-fg md:text-base">
            {desc}
          </p>
        </div>
      </section>

      {feedItems.length > 0 ? (
        <ProductFeed
          items={feedItems.slice(0, 60)}
          locale={locale}
          showHeader
          titleJa="この悩みに合うアイテム"
          titleEn="Picks that fit this concern"
        />
      ) : (
        <section className="mx-auto mt-8 max-w-3xl px-5 text-center">
          <p className="text-sm text-muted-fg md:text-base">
            {locale === "ja"
              ? "この悩みに該当する商品はまだ登録されていません。順次追加していきます。"
              : "We have not curated products for this concern yet. Coming soon."}
          </p>
        </section>
      )}

      {/* 関連悩み (同カテゴリ): 商品見終わったら横展開させる */}
      {related.length > 0 && (
        <Rail
          title={locale === "ja" ? "近い悩みも見る" : "Related concerns"}
          subtitle={
            locale === "ja"
              ? "同じカテゴリの他の悩みでも商品を探せます"
              : "Browse other concerns in the same category"
          }
        >
          {related.map((c) => (
            <RailItem key={c.id}>
              <ConcernCard locale={locale} concern={c} />
            </RailItem>
          ))}
        </Rail>
      )}

      {/* カテゴリ surface (TOP と同じ) */}
      <CategoryGrid locale={locale} />

      {/* 選び方ガイド: SEO 内部リンクの主動線。relatedGuides がヒットすれば
          「この悩みに関連するガイド」 として narrow に出し、ゼロなら全ガイド
          rail にフォールバック。 */}
      <Rail
        title={
          locale === "ja"
            ? guidesAreFiltered
              ? `「${label}」 に関連するガイド`
              : "選び方ガイド"
            : guidesAreFiltered
              ? `Guides related to ${label}`
              : "Buying guides"
        }
        subtitle={
          locale === "ja"
            ? guidesAreFiltered
              ? "この悩みを扱った編集部のロングフォーム記事"
              : "編集部が悩み別に書き下ろし"
            : guidesAreFiltered
              ? "Editorial long-form covering this concern"
              : "Editor-written, concern-first"
        }
        viewAllHref={`${root}/guides/${guidesToShow[0]?.slug ?? ""}`}
        viewAllLabel={locale === "ja" ? "全ガイドを見る" : "All guides"}
      >
        {guidesToShow.map((g) => (
          <RailItem key={g.slug}>
            <GuideCard guide={g} locale={locale} />
          </RailItem>
        ))}
      </Rail>

      {/* 人気の悩み一覧: フッタ手前で全悩みへの内部リンクを供給 */}
      <section className="mx-auto mt-12 max-w-5xl px-5">
        <h2 className="text-lg font-extrabold tracking-tight text-foreground md:text-2xl">
          {locale === "ja" ? "人気の悩みから探す" : "Popular concerns"}
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {popular.map((c) => (
            <Link
              key={c.id}
              href={`${root}/concerns/${c.id}`}
              className={`inline-flex shrink-0 items-center rounded-full px-4 py-2 text-xs font-bold transition-colors md:text-sm ${
                c.id === id
                  ? "bg-primary text-primary-fg shadow-sm"
                  : "border border-border bg-card text-muted-fg hover:border-primary hover:text-primary"
              }`}
            >
              {chipLabel(c, locale)}
            </Link>
          ))}
        </div>
      </section>

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
            {locale === "ja" ? "採寸でフィット診断 →" : "Try sizing →"}
          </Link>
        </div>
      </section>
    </div>
  );
}

function ConcernCard({
  locale,
  concern,
}: {
  locale: "ja" | "en";
  concern: Concern;
}) {
  const label = locale === "ja" ? concern.labelJa : concern.labelEn;
  const desc = locale === "ja" ? concern.descJa : concern.descEn;
  return (
    <Link
      href={`/${locale}/concerns/${concern.id}`}
      className="flex h-full w-[260px] flex-col rounded-2xl border border-card-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md md:w-[280px]"
    >
      <p className="line-clamp-2 text-sm font-extrabold leading-snug text-foreground md:text-base">
        {label}
      </p>
      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-fg md:text-[13px]">
        {desc}
      </p>
      <span className="mt-auto pt-3 text-xs font-bold text-primary">
        {locale === "ja" ? "見てみる →" : "View →"}
      </span>
    </Link>
  );
}
