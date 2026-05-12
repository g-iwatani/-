import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { breedSizeLabel } from "@/lib/breed-display";
import { breeds, getPopularBreeds } from "@/lib/breeds";
import { absoluteUrl, localizedAlternates } from "@/lib/site";
import {
  StructuredData,
  breadcrumbSchema,
} from "@/lib/structured-data";
import { getDictionary, hasLocale } from "../dictionaries";

/**
 * 犬種一覧 LP。SEO 着地点として `popular: true` の犬種を上位 grid、
 * 残りはサイズ別に折り畳んで表示。 200+ 犬種を素朴に list 表示すると
 * 「お客様用カタログ」 になってしまうので、TOP 8 + 「もっと見る」 構造で
 * 「うちの子だけ探したい」 流入を最優先する。
 */

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/breeds">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const titleJa = "犬種から探す — わんプロブレム";
  const titleEn = "Browse by breed — WanProblem";
  const desc =
    locale === "ja"
      ? "200犬種から選んで、その犬種が直面しやすい悩みに合うアイテムを表示します。"
      : "Pick from 200+ breeds and see products matched to that breed's common concerns.";
  return {
    title: locale === "ja" ? titleJa : titleEn,
    description: desc,
    alternates: {
      canonical: `/${locale}/breeds`,
      languages: localizedAlternates("/breeds"),
    },
    openGraph: {
      title: locale === "ja" ? titleJa : titleEn,
      description: desc,
      url: `/${locale}/breeds`,
      images: ["/opengraph-image"],
    },
  };
}

export default async function BreedsPage({
  params,
}: PageProps<"/[locale]/breeds">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  await getDictionary(locale);

  const root = `/${locale}`;
  const popular = getPopularBreeds();

  // サイズ別グループ。表示順は tiny → small → medium → large → giant。
  const sizeOrder = ["tiny", "small", "medium", "large", "giant"] as const;
  const grouped = sizeOrder.map((size) => ({
    size,
    items: breeds
      .filter((b) => b.size === size && b.id !== "mix" && !b.id.startsWith("unknown-"))
      .sort((a, b) => a.nameJa.localeCompare(b.nameJa, "ja")),
  }));

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
          </nav>
          <p className="mt-3 inline-flex items-center rounded-full border border-primary/30 bg-primary-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary md:text-xs">
            {locale === "ja" ? "犬種から探す" : "Browse by breed"}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
            {locale === "ja"
              ? "犬種ごとに、本当に合うアイテム"
              : "Products tailored to each breed"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-fg md:text-base">
            {locale === "ja"
              ? "200犬種以上を網羅。各犬種ページでは、その子が抱えやすい悩みに合う商品だけを厳選表示します。"
              : "200+ breeds covered. Each breed page surfaces products matched to its typical concerns."}
          </p>
        </div>
      </section>

      {/* 人気犬種 grid: ファーストビューで多数派の飼い主を捕まえる */}
      <section className="mx-auto mt-6 max-w-5xl px-5">
        <h2 className="text-base font-extrabold tracking-tight text-foreground md:text-lg">
          {locale === "ja" ? "人気の犬種" : "Popular breeds"}
        </h2>
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {popular.map((b) => (
            <li key={b.id}>
              <Link
                href={`${root}/breeds/${b.id}`}
                className="block rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/50 hover:bg-primary-soft/20"
              >
                <p className="text-sm font-bold text-foreground">
                  {locale === "ja" ? b.nameJa : b.nameEn}
                </p>
                <p className="mt-1 text-[11px] text-muted-fg">
                  {breedSizeLabel(b.size, locale)} · {b.weightMin}-{b.weightMax}
                  kg
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* サイズ別全犬種: ロングテール SEO 用 */}
      {grouped.map(({ size, items }) =>
        items.length === 0 ? null : (
          <section
            key={size}
            className="mx-auto mt-8 max-w-5xl px-5"
            aria-labelledby={`breeds-${size}`}
          >
            <h2
              id={`breeds-${size}`}
              className="text-base font-extrabold tracking-tight text-foreground md:text-lg"
            >
              {breedSizeLabel(size, locale)}
              <span className="ml-2 text-xs font-normal text-muted-fg">
                {items.length}
                {locale === "ja" ? "犬種" : " breeds"}
              </span>
            </h2>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {items.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`${root}/breeds/${b.id}`}
                    className="inline-flex rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground transition-colors hover:border-primary/50 hover:bg-primary-soft/20"
                  >
                    {locale === "ja" ? b.nameJa : b.nameEn}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ),
      )}
    </div>
  );
}
