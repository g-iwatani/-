import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductFeed } from "@/components/ProductFeed";
import { getBreedConcerns } from "@/lib/breed-concerns";
import { breedSizeLabel } from "@/lib/breed-display";
import { breeds, getBreed } from "@/lib/breeds";
import { chipLabel, getConcern } from "@/lib/concerns";
import { buildFeedItems } from "@/lib/feed";
import { absoluteUrl, localizedAlternates } from "@/lib/site";
import {
  StructuredData,
  breadcrumbSchema,
} from "@/lib/structured-data";
import { getDictionary, hasLocale, locales } from "../../dictionaries";

/**
 * 犬種別 LP `/ja/breeds/shiba` のような static 経路。
 *
 * - generateStaticParams で全犬種 × locale を SSG
 * - hero に犬種名 + サイズ + 体重レンジ + blurb
 * - その犬種の関連 concerns (breed-concerns.ts) を OR フィルタにかけて feed
 * - 関連悩み chip (concerns LP への動線)
 */

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    breeds
      // mix / unknown フォールバックは LP 不要 (一覧 chip としても出さない)
      .filter((b) => b.id !== "mix" && !b.id.startsWith("unknown-"))
      .map((b) => ({ locale, id: b.id })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/breeds/[id]">): Promise<Metadata> {
  const { locale, id } = await params;
  if (!hasLocale(locale)) return {};
  const breed = getBreed(id);
  if (!breed) return {};
  const name = locale === "ja" ? breed.nameJa : breed.nameEn;
  const titleSuffix = locale === "ja" ? "わんプロブレム" : "WanProblem";
  const titleJa = `${name}におすすめの犬用品 | ${titleSuffix}`;
  const titleEn = `Best products for ${name} | ${titleSuffix}`;
  const desc =
    locale === "ja"
      ? `${name}が抱えやすい悩みに合う厳選アイテム。サイズ${breedSizeLabel(breed.size, "ja")}・体重${breed.weightMin}〜${breed.weightMax}kg。`
      : `Hand-picked products matched to common ${name} concerns. ${breedSizeLabel(breed.size, "en")} size, ${breed.weightMin}-${breed.weightMax}kg.`;
  return {
    title: locale === "ja" ? titleJa : titleEn,
    description: desc,
    alternates: {
      canonical: `/${locale}/breeds/${id}`,
      languages: localizedAlternates(`/breeds/${id}`),
    },
    openGraph: {
      title: locale === "ja" ? titleJa : titleEn,
      description: desc,
      url: `/${locale}/breeds/${id}`,
      images: ["/opengraph-image"],
    },
  };
}

export default async function BreedPage({
  params,
}: PageProps<"/[locale]/breeds/[id]">) {
  const { locale, id } = await params;
  if (!hasLocale(locale)) notFound();
  const breed = getBreed(id);
  if (!breed) notFound();
  await getDictionary(locale);

  const root = `/${locale}`;
  const name = locale === "ja" ? breed.nameJa : breed.nameEn;
  const concernIds = getBreedConcerns(breed);

  // 該当犬種の関連 concerns を OR フィルタにかける
  const feedItems = buildFeedItems(locale, concernIds).slice(0, 120);

  // 関連 concern chip 表示用 (label を引いて表示)
  const relatedConcerns = concernIds
    .map((cid) => getConcern(cid))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

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
              name: locale === "ja" ? "犬種から探す" : "Browse by breed",
              url: absoluteUrl(`${root}/breeds`),
            },
            {
              name,
              url: absoluteUrl(`${root}/breeds/${id}`),
            },
          ]),
        ]}
      />

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
            <Link href={`${root}/breeds`} className="hover:text-primary">
              {locale === "ja" ? "犬種から探す" : "Browse by breed"}
            </Link>
          </nav>
          <p className="mt-3 inline-flex items-center rounded-full border border-primary/30 bg-primary-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary md:text-xs">
            {breedSizeLabel(breed.size, locale)}
            {" · "}
            {breed.weightMin}-{breed.weightMax}kg
          </p>
          <h1 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
            {name}
            {locale === "ja" && (
              <span className="ml-2 text-base font-normal text-muted-fg md:text-xl">
                におすすめのアイテム
              </span>
            )}
          </h1>

          {/* この犬種に紐づく悩み chip。タップで concern LP へ深掘り */}
          {relatedConcerns.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {relatedConcerns.map((c) => (
                <Link
                  key={c.id}
                  href={`${root}/concerns/${c.id}`}
                  className="inline-flex rounded-full border border-primary/30 bg-card px-3 py-1 text-xs font-bold text-primary transition-colors hover:bg-primary-soft/40"
                >
                  {chipLabel(c, locale)}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {feedItems.length > 0 ? (
        <ProductFeed
          items={feedItems}
          locale={locale}
          showHeader
          titleJa={`${name}に合うアイテム`}
          titleEn={`Picks for ${name}`}
        />
      ) : (
        <section className="mx-auto mt-8 max-w-3xl px-5 text-center">
          <p className="text-sm text-muted-fg md:text-base">
            {locale === "ja"
              ? "この犬種に合う商品はまだ準備中です。順次追加していきます。"
              : "Products for this breed are coming soon."}
          </p>
        </section>
      )}

      {/* フッタ動線: 犬種一覧へ戻す */}
      <section className="mx-auto mt-10 max-w-3xl px-5 text-center">
        <Link
          href={`${root}/breeds`}
          className="inline-flex rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-muted"
        >
          {locale === "ja" ? "← 他の犬種を見る" : "← See other breeds"}
        </Link>
      </section>
    </div>
  );
}
