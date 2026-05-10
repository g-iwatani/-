import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { ShareButtons } from "@/components/ShareButtons";
import { chipLabel, getConcern } from "@/lib/concerns";
import { format, formatLastUpdated } from "@/lib/format";
import { type Guide, getGuide, guides, pickProductsForGuide } from "@/lib/guides";
import { absoluteUrl, localizedAlternates, site } from "@/lib/site";
import {
  StructuredData,
  articleSchema,
  breadcrumbSchema,
  faqSchema,
} from "@/lib/structured-data";
import { defaultLocale, getDictionary, hasLocale, locales } from "../../dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const safeLocale = hasLocale(locale) ? locale : defaultLocale;
  const guide = getGuide(slug);
  if (!guide) return {};
  const title = safeLocale === "ja" ? guide.titleJa : guide.titleEn;
  const lead = safeLocale === "ja" ? guide.leadJa : guide.leadEn;
  const path = `/${safeLocale}/guides/${slug}`;
  return {
    title,
    description: lead.slice(0, 160),
    alternates: {
      canonical: path,
      languages: localizedAlternates(`/guides/${slug}`),
    },
    openGraph: {
      type: "article",
      url: absoluteUrl(path),
      title,
      description: lead.slice(0, 200),
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: lead.slice(0, 200),
      images: ["/opengraph-image"],
    },
  };
}

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const g of guides) {
      params.push({ locale, slug: g.slug });
    }
  }
  return params;
}

export default async function GuidePage({
  params,
}: {
  // PageProps generated from .next/types は dev/build を走らせるまで更新されない。
  // 既存ページの動的 dev フローを壊さないため最初は手動型で定義し、次回ビルド以降
  // PageProps<"/[locale]/guides/[slug]"> へ移行する想定。
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const guide = getGuide(slug);
  if (!guide) notFound();
  const matches = pickProductsForGuide(guide);

  const title = locale === "ja" ? guide.titleJa : guide.titleEn;
  const lead = locale === "ja" ? guide.leadJa : guide.leadEn;

  const pageUrl = absoluteUrl(`/${locale}/guides/${guide.slug}`);
  const breadcrumbs = breadcrumbSchema([
    { name: locale === "ja" ? "ホーム" : "Home", url: absoluteUrl(`/${locale}`) },
    { name: title, url: pageUrl },
  ]);

  return (
    <div className="mx-auto max-w-3xl px-5 pt-8 pb-32 lg:pb-16">
      <StructuredData
        items={[
          articleSchema(guide, pageUrl, locale),
          faqSchema(guide, locale),
          breadcrumbs,
        ]}
      />
      <div className="mb-6">
        <Link
          href={`/${locale}`}
          className="text-sm font-semibold text-muted-fg hover:text-primary"
        >
          {dict.guide.back_to_home}
        </Link>
      </div>

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
            {dict.guide.lead_label}
          </span>
          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-fg">
            {formatLastUpdated(
              site.lastUpdated.year,
              site.lastUpdated.month,
              locale,
            )}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>
        <p className="text-base leading-relaxed text-muted-fg">{lead}</p>
        <p className="text-xs text-muted-fg">
          <span className="font-semibold text-foreground">
            {locale === "ja" ? guide.authorJa : guide.authorEn}
          </span>
          <span className="mx-2">·</span>
          {locale === "ja" ? "公開: " : "Published: "}
          <time dateTime={guide.publishedAt}>{guide.publishedAt}</time>
          {guide.updatedAt && guide.updatedAt !== guide.publishedAt && (
            <>
              <span className="mx-2">·</span>
              {locale === "ja" ? "更新: " : "Updated: "}
              <time dateTime={guide.updatedAt}>{guide.updatedAt}</time>
            </>
          )}
        </p>
      </header>

      <div className="mt-6">
        <ShareButtons url={pageUrl} title={title} dict={dict} />
      </div>

      <hr className="my-10 border-border" />

      <TableOfContents guide={guide} locale={locale} dict={dict} />

      <div className="space-y-12">
        {guide.sections.map((section, idx) => (
          <SectionRenderer
            key={idx}
            section={section}
            locale={locale}
            dict={dict}
            matches={matches}
          />
        ))}
      </div>

      <hr className="my-10 border-border" />

      {/* 関連する悩み別 LP への送り。記事本文 → 該当悩みの専用 LP →
          そこから他の悩みへの横展開、という SEO 内部リンクを作る。
          /concerns/[id] が canonical SEO 着地点なので必ず含める。 */}
      <RelatedConcerns guide={guide} locale={locale} />

      <hr className="my-10 border-border" />

      {/* Other guides nav */}
      <section>
        <h2 className="mb-4 text-lg font-extrabold tracking-tight text-foreground">
          {dict.guide.more_guides}
        </h2>
        <ul className="space-y-2">
          {guides
            .filter((g) => g.slug !== guide.slug)
            .map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/${locale}/guides/${g.slug}`}
                  className="block rounded-2xl border border-card-border bg-card p-4 transition-all hover:border-primary"
                >
                  <p className="text-sm font-bold text-foreground">
                    {locale === "ja" ? g.titleJa : g.titleEn}
                  </p>
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}

/**
 * 記事冒頭の目次。<details> で折りたたみ式 (デフォルト展開)。
 * セクション ID は SectionRenderer 側の固定 id ("points" / "top-picks" / "faq")
 * とコロケーションさせて壊れにくくしている。
 */
function TableOfContents({
  guide,
  locale,
  dict,
}: {
  guide: Guide;
  locale: "ja" | "en";
  dict: Awaited<ReturnType<typeof getDictionary>>;
}) {
  const items: { id: string; title: string }[] = [];
  for (const s of guide.sections) {
    if (s.kind === "lead") continue; // hero でレンダー済みなので目次にも出さない
    const title = locale === "ja" ? s.titleJa : s.titleEn;
    if (s.kind === "points") items.push({ id: "points", title });
    else if (s.kind === "top_picks") items.push({ id: "top-picks", title });
    else if (s.kind === "faq") items.push({ id: "faq", title });
  }
  if (items.length < 2) return null;
  return (
    <details
      open
      className="mb-10 rounded-2xl border border-card-border bg-card p-5"
    >
      <summary className="cursor-pointer list-none text-sm font-extrabold uppercase tracking-wide text-muted-fg">
        {dict.guide.table_of_contents}
      </summary>
      <ol className="mt-3 space-y-2">
        {items.map((it, i) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className="flex items-baseline gap-3 text-sm text-foreground hover:text-primary"
            >
              <span className="text-xs font-bold text-muted-fg">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{it.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}

function SectionRenderer({
  section,
  locale,
  dict,
  matches,
}: {
  section: Guide["sections"][number];
  locale: "ja" | "en";
  dict: Awaited<ReturnType<typeof getDictionary>>;
  matches: ReturnType<typeof pickProductsForGuide>;
}) {
  if (section.kind === "lead") return null; // hero でレンダー済み
  if (section.kind === "points") {
    const items = locale === "ja" ? section.itemsJa : section.itemsEn;
    const title = locale === "ja" ? section.titleJa : section.titleEn;
    return (
      <section id="points" className="scroll-mt-20">
        <h2 className="mb-5 text-2xl font-extrabold tracking-tight text-foreground">
          {title}
        </h2>
        <ol className="space-y-5">
          {items.map((item, i) => (
            <li
              key={i}
              className="rounded-2xl border border-card-border bg-card p-5"
            >
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-base font-bold text-foreground md:text-lg">
                  {item.headline}
                </h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-fg md:text-base">
                {item.body}
              </p>
            </li>
          ))}
        </ol>
      </section>
    );
  }
  if (section.kind === "top_picks") {
    const title = locale === "ja" ? section.titleJa : section.titleEn;
    return (
      <section id="top-picks" className="scroll-mt-20">
        <h2 className="mb-5 text-2xl font-extrabold tracking-tight text-foreground">
          {title}
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {matches.map((m, i) => (
            <ProductCard
              key={m.product.id}
              match={m}
              locale={locale}
              dict={dict}
              href={`/${locale}/products/${m.product.id}`}
              isTopPick={i === 0}
            />
          ))}
        </div>
      </section>
    );
  }
  if (section.kind === "faq") {
    const items = locale === "ja" ? section.itemsJa : section.itemsEn;
    const title = locale === "ja" ? section.titleJa : section.titleEn;
    return (
      <section id="faq" className="scroll-mt-20">
        <h2 className="mb-5 text-2xl font-extrabold tracking-tight text-foreground">
          {title}
        </h2>
        <div className="space-y-4">
          {items.map((item, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-card-border bg-card p-5"
            >
              <summary className="cursor-pointer list-none text-sm font-bold text-foreground md:text-base">
                <span className="mr-2 text-primary">Q.</span>
                {item.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-fg md:text-base">
                <span className="mr-2 font-bold text-foreground">A.</span>
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    );
  }
  return null;
}

/**
 * 記事末尾の「関連する悩み別ページ」 chip 列。
 * guide.productQuery.concerns を /concerns/[id] LP へのリンクに変換する。
 * SEO 上、記事 → LP の横展開導線で内部リンクトポロジを密にする。
 */
function RelatedConcerns({
  guide,
  locale,
}: {
  guide: Guide;
  locale: "ja" | "en";
}) {
  const concerns = guide.productQuery.concerns
    .map((id) => getConcern(id))
    .filter((c): c is NonNullable<typeof c> => c !== undefined);
  if (concerns.length === 0) return null;
  return (
    <section>
      <h2 className="t-section mb-1">
        {locale === "ja" ? "関連する悩み別ページ" : "Related concern pages"}
      </h2>
      <p className="t-section-sub">
        {locale === "ja"
          ? "それぞれの悩みに合う商品をまとめた専用ページがあります"
          : "Each concern has a dedicated landing page with matching products"}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {concerns.map((c) => (
          <Link
            key={c.id}
            href={`/${locale}/concerns/${c.id}`}
            className="inline-flex shrink-0 items-center rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-muted-fg transition-colors hover:border-primary hover:text-primary md:text-sm"
          >
            {chipLabel(c, locale)}
          </Link>
        ))}
      </div>
    </section>
  );
}

// Reference for typing only
void format;
