import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductImage } from "@/components/ProductImage";
import { AFFILIATE_REL } from "@/lib/affiliate";
import { getBreed } from "@/lib/breeds";
import { getConcern } from "@/lib/concerns";
import { format, formatLastUpdated, formatPrice } from "@/lib/format";
import { findRelatedGuides } from "@/lib/guides";
import {
  type DogProfile,
  evaluateSizeMatch,
  measurementsFromBreeds,
  pickBestSize,
} from "@/lib/matching";
import { getProduct, products, resolveBuyUrl } from "@/lib/products";
import { absoluteUrl, localizedAlternates, site } from "@/lib/site";
import {
  StructuredData,
  breadcrumbSchema,
  productSchema,
} from "@/lib/structured-data";
import { getProductTrust } from "@/lib/trust";
import { defaultLocale, getDictionary, hasLocale, locales } from "../../dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const safeLocale = hasLocale(locale) ? locale : defaultLocale;
  const product = getProduct(id);
  if (!product) return {};
  const name = safeLocale === "ja" ? product.nameJa : product.nameEn;
  const desc = safeLocale === "ja" ? product.descJa : product.descEn;
  const path = `/${safeLocale}/products/${id}`;
  const titleSuffix =
    safeLocale === "ja"
      ? `${product.brand} | わんプロブレム`
      : `${product.brand} | WanProblem`;
  return {
    title: `${name} - ${titleSuffix}`,
    description: desc.slice(0, 160),
    alternates: {
      canonical: path,
      languages: localizedAlternates(`/products/${id}`),
    },
    openGraph: {
      type: "website",
      url: absoluteUrl(path),
      title: name,
      description: desc.slice(0, 200),
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
    },
    twitter: {
      card: product.imageUrl ? "summary_large_image" : "summary",
      title: name,
      description: desc.slice(0, 200),
      images: product.imageUrl ? [product.imageUrl] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const params: { locale: string; id: string }[] = [];
  for (const locale of locales) {
    for (const product of products) {
      params.push({ locale, id: product.id });
    }
  }
  return params;
}

function parseIds(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseNumber(value: string | string[] | undefined): number | undefined {
  if (!value) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : undefined;
}

export default async function ProductPage({
  params,
  searchParams,
}: PageProps<"/[locale]/products/[id]">) {
  const { locale, id } = await params;
  if (!hasLocale(locale)) notFound();
  const product = getProduct(id);
  if (!product) notFound();
  const dict = await getDictionary(locale);
  const sp = (await searchParams) ?? {};

  const name = locale === "ja" ? product.nameJa : product.nameEn;
  const desc = locale === "ja" ? product.descJa : product.descEn;
  const tags = locale === "ja" ? product.tagsJa : product.tagsEn;

  const breedIds = parseIds(sp.breeds);
  const concernIds = parseIds(sp.concerns);
  const chest = parseNumber(sp.chest);
  const back = parseNumber(sp.back);
  const neck = parseNumber(sp.neck);

  const resolvedBreeds = breedIds
    .map((b) => getBreed(b))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  const inferred = measurementsFromBreeds(resolvedBreeds);

  const profile: DogProfile = {
    breedIds,
    chest: chest ?? inferred?.chest,
    back: back ?? inferred?.back,
    neck: neck ?? inferred?.neck,
    concerns: concernIds,
  };

  const measurements = {
    chest: profile.chest,
    back: profile.back,
    neck: profile.neck,
  };

  const bestSize = measurements.chest != null
    ? pickBestSize(product, measurements)
    : undefined;

  const concernSet = new Set(profile.concerns);
  const concernHits = product.concerns.filter((c) => concernSet.has(c));

  const queryString = new URLSearchParams();
  if (breedIds.length > 0) queryString.set("breeds", breedIds.join(","));
  if (concernIds.length > 0) queryString.set("concerns", concernIds.join(","));
  if (chest != null) queryString.set("chest", String(chest));
  if (back != null) queryString.set("back", String(back));
  if (neck != null) queryString.set("neck", String(neck));

  const pageUrl = absoluteUrl(`/${locale}/products/${product.id}`);
  const resolvedBuyUrls = product.buyOptions.map((opt) => resolveBuyUrl(opt));
  const breadcrumbs = breadcrumbSchema([
    { name: locale === "ja" ? "ホーム" : "Home", url: absoluteUrl(`/${locale}`) },
    {
      name: locale === "ja" ? "検索結果" : "Results",
      url: absoluteUrl(`/${locale}/results`),
    },
    { name, url: pageUrl },
  ]);

  return (
    <div className="mx-auto max-w-5xl px-5 pt-8 pb-32 lg:pb-16">
      <StructuredData
        items={[productSchema(product, pageUrl, resolvedBuyUrls, locale), breadcrumbs]}
      />
      <div className="mb-6">
        <Link
          href={`/${locale}/results?${queryString.toString()}`}
          className="text-sm font-semibold text-muted-fg hover:text-primary"
        >
          ← {dict.product_detail.back_to_results}
        </Link>
      </div>

      <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-start">
        <div className="space-y-4">
          <ProductImage
            palette={product.imagePalette}
            emoji={product.imageEmoji}
            imageUrl={product.imageUrl}
            alt={name}
            size="lg"
          />
          <div className="flex flex-wrap gap-2 text-xs">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-muted px-3 py-1 font-semibold text-muted-fg"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-fg">
                {product.brand} · {product.brandCountry}
              </p>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-fg">
                {formatLastUpdated(
                  site.lastUpdated.year,
                  site.lastUpdated.month,
                  locale,
                )}
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              {name}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-fg md:text-base">
              {desc}
            </p>
          </div>

          {bestSize && bestSize.fitScore >= 60 && (
            <div className="rounded-3xl border border-accent/40 bg-accent-soft p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-accent">
                {dict.product_detail.size_recommended_for_dog}
              </p>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-accent">
                  {bestSize.size.label}
                </span>
                <span className="text-sm font-semibold text-accent">
                  {format(dict.product_card.fit_score, {
                    score: bestSize.fitScore,
                  })}
                </span>
              </div>
              <p className="mt-1 text-xs text-accent/80">{bestSize.reason}</p>
            </div>
          )}

          {concernHits.length > 0 && (
            <div className="rounded-3xl border border-card-border bg-card p-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-muted-fg">
                {dict.product_detail.addresses_concerns}
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {concernHits.map((cid) => {
                  const c = getConcern(cid);
                  if (!c) return null;
                  return (
                    <li
                      key={cid}
                      className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary"
                    >
                      {locale === "ja" ? c.labelJa : c.labelEn}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wide text-muted-fg">
              {dict.product_detail.buy_options}
            </h3>
            <div className="grid gap-2">
              {product.buyOptions.map((opt, i) => (
                <a
                  key={`${opt.shop}-${i}`}
                  href={resolveBuyUrl(opt)}
                  target="_blank"
                  rel={AFFILIATE_REL}
                  className="flex items-center justify-between rounded-2xl border border-card-border bg-card px-5 py-4 transition-all hover:border-primary hover:shadow-md"
                >
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      <span
                        aria-label="ad"
                        className="mr-1.5 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-fg"
                      >
                        PR
                      </span>
                      {format(dict.product_card.buy_at, { shop: opt.shop })}
                    </p>
                    <p className="mt-1 text-xs text-muted-fg">
                      {opt.region === "jp"
                        ? locale === "ja"
                          ? "日本国内発送"
                          : "Ships in Japan"
                        : locale === "ja"
                          ? "国際配送あり"
                          : "Ships internationally"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-extrabold text-primary">
                      {formatPrice(opt.priceJpy, locale)}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-fg">
                      {locale === "ja" ? "ショップへ移動" : "Open shop"} ↗
                    </p>
                  </div>
                </a>
              ))}
            </div>
            <p className="text-[11px] leading-relaxed text-muted-fg">
              {dict.product_detail.external_disclaimer}
            </p>
          </div>
        </div>
      </div>

      {/* Related buying guides — internal linking signal + traffic to high-CVR articles */}
      <RelatedGuides product={product} locale={locale} dict={dict} />

      {/* Editor's verification notes — what we actually did to vet this product */}
      <TrustNotes product={product} dict={dict} locale={locale} />

      {/* Size chart */}
      <section className="mt-12">
        <h2 className="text-xl font-extrabold tracking-tight text-foreground md:text-2xl">
          {dict.product_detail.size_chart}
        </h2>
        <div className="mt-4 overflow-x-auto rounded-3xl border border-card-border bg-card">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-fg">
              <tr>
                <th className="px-4 py-3 text-left">
                  {locale === "ja" ? "サイズ" : "Size"}
                </th>
                <th className="px-4 py-3 text-left">
                  {locale === "ja" ? "胸囲 (cm)" : "Chest (cm)"}
                </th>
                <th className="px-4 py-3 text-left">
                  {locale === "ja" ? "背丈 (cm)" : "Back (cm)"}
                </th>
                <th className="px-4 py-3 text-left">
                  {locale === "ja" ? "首回り (cm)" : "Neck (cm)"}
                </th>
                <th className="px-4 py-3 text-left">
                  {locale === "ja" ? "フィット度" : "Fit"}
                </th>
              </tr>
            </thead>
            <tbody>
              {product.sizes.map((s) => {
                const evaluation = measurements.chest != null
                  ? evaluateSizeMatch(s, measurements)
                  : null;
                const isRecommended =
                  bestSize && bestSize.size.label === s.label;
                return (
                  <tr
                    key={s.label}
                    className={`border-t border-border ${
                      isRecommended ? "bg-accent-soft" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-bold text-foreground">
                      {s.label}
                      {isRecommended && (
                        <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
                          {locale === "ja" ? "推奨" : "Best"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-fg">
                      {s.chestMax >= 200
                        ? "—"
                        : `${s.chestMin}–${s.chestMax}`}
                    </td>
                    <td className="px-4 py-3 text-muted-fg">
                      {s.backMax >= 200 ? "—" : `${s.backMin}–${s.backMax}`}
                    </td>
                    <td className="px-4 py-3 text-muted-fg">
                      {s.neckMax >= 200 ? "—" : `${s.neckMin}–${s.neckMax}`}
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {evaluation ? `${evaluation.score}%` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mobile sticky bottom CTA — JP コマースの定番、CVR への寄与が大きい。
          デスクトップでは購入ボタンが本文中で常に見えるので非表示。
          Amazon が買い物導線として最も収益高い前提で優先採用、無ければ最初の有効ボタン。 */}
      <StickyMobileCta product={product} dict={dict} locale={locale} />
    </div>
  );
}

function RelatedGuides({
  product,
  locale,
  dict,
}: {
  product: NonNullable<ReturnType<typeof getProduct>>;
  locale: "ja" | "en";
  dict: Awaited<ReturnType<typeof getDictionary>>;
}) {
  const related = findRelatedGuides(product, 3);
  if (related.length === 0) return null;
  return (
    <section className="mt-12">
      <header className="mb-4">
        <h2 className="text-xl font-extrabold tracking-tight text-foreground md:text-2xl">
          {dict.guide.related_for_product}
        </h2>
        <p className="mt-1 text-sm text-muted-fg">
          {dict.guide.related_subtitle}
        </p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {related.map(({ guide }) => (
          <li key={guide.slug}>
            <Link
              href={`/${locale}/guides/${guide.slug}`}
              className="block h-full rounded-2xl border border-card-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-primary">
                {locale === "ja" ? "選び方ガイド" : "Buying guide"}
              </p>
              <p className="mt-2 text-sm font-bold leading-snug text-foreground">
                {locale === "ja" ? guide.titleJa : guide.titleEn}
              </p>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-fg">
                {locale === "ja" ? guide.leadJa : guide.leadEn}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TrustNotes({
  product,
  dict,
  locale,
}: {
  product: NonNullable<ReturnType<typeof getProduct>>;
  dict: Awaited<ReturnType<typeof getDictionary>>;
  locale: "ja" | "en";
}) {
  const trust = getProductTrust(product);
  const dateStr = formatLastUpdated(
    site.lastUpdated.year,
    site.lastUpdated.month,
    locale,
  );
  const items: string[] = [];
  if (trust.source === "amazon-bestseller") {
    items.push(format(dict.trust.source_amazon_bestseller, { date: dateStr }));
  } else {
    items.push(dict.trust.source_curated);
  }
  if (trust.hasVerifiedAsin) items.push(dict.trust.verified_asin);
  return (
    <section className="mt-12">
      <h2 className="text-xl font-extrabold tracking-tight text-foreground md:text-2xl">
        {dict.trust.section_title}
      </h2>
      <ul className="mt-4 space-y-2 rounded-3xl border border-card-border bg-card p-5">
        {items.map((line, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <span aria-hidden className="mt-0.5 text-emerald-600">
              ✓
            </span>
            <span>{line}</span>
          </li>
        ))}
        <li className="mt-3 border-t border-border pt-3 text-[11px] leading-relaxed text-muted-fg">
          {dict.trust.no_ratings_disclaimer}
        </li>
      </ul>
    </section>
  );
}

function StickyMobileCta({
  product,
  dict,
  locale,
}: {
  product: ReturnType<typeof getProduct>;
  dict: Awaited<ReturnType<typeof getDictionary>>;
  locale: "ja" | "en";
}) {
  if (!product) return null;
  if (product.buyOptions.length === 0) return null;
  const amazonIdx = product.buyOptions.findIndex((b) =>
    b.target?.network.startsWith("amazon-"),
  );
  const ctaIdx = amazonIdx >= 0 ? amazonIdx : 0;
  const cta = product.buyOptions[ctaIdx];
  const ctaUrl = resolveBuyUrl(cta);
  if (ctaUrl === "#") return null;
  const name = locale === "ja" ? product.nameJa : product.nameEn;
  const lowest = Math.min(...product.buyOptions.map((b) => b.priceJpy));
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-4 pt-3 backdrop-blur-md shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
    >
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-[11px] font-bold uppercase tracking-wide text-muted-fg">
            {product.brand}
          </p>
          <p className="line-clamp-1 text-sm font-bold text-foreground">
            {name}
          </p>
          <p className="text-base font-extrabold text-primary">
            {formatPrice(lowest, locale)}
          </p>
        </div>
        <a
          href={ctaUrl}
          target="_blank"
          rel={AFFILIATE_REL}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-bold text-background transition-opacity hover:opacity-90"
        >
          <span aria-label="ad" className="mr-1 text-[10px] opacity-80">
            PR
          </span>
          {format(dict.product_card.buy_at, { shop: cta.shop })}
        </a>
      </div>
    </div>
  );
}
