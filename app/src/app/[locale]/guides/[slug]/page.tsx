import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: lead.slice(0, 200),
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

      <hr className="my-10 border-border" />

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
      <section>
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
      <section>
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
      <section>
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

// Reference for typing only
void format;
