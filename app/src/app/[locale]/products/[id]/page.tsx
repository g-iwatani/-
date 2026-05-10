import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyOptionsCompare } from "@/components/BuyOptionsCompare";
import { MiniProductCard } from "@/components/MiniProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import { Rail, RailItem } from "@/components/Rail";
import { RecentTracker } from "@/components/RecentTracker";
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
import {
  getProduct,
  getRelatedByBrand,
  getRelatedByConcerns,
  products,
  resolveBuyUrl,
} from "@/lib/products";
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
      images: product.imageUrl ? [{ url: product.imageUrl }] : ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description: desc.slice(0, 200),
      images: product.imageUrl ? [product.imageUrl] : ["/opengraph-image"],
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
      <RecentTracker productId={product.id} />
      <div className="mb-6">
        <Link
          href={`/${locale}/results?${queryString.toString()}`}
          className="text-sm font-semibold text-muted-fg hover:text-primary"
        >
          ← {dict.product_detail.back_to_results}
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-start md:gap-10">
        <div>
          <ProductGallery
            images={
              // 詳細ページのみ追加アングル (imageUrls) を見せる。OG / カード /
              // 一覧は imageUrl 単独 (hero) で統一して印象が散らかるのを防ぐ。
              product.imageUrls && product.imageUrls.length > 0
                ? product.imageUrls
                : product.imageUrl
                  ? [product.imageUrl]
                  : []
            }
            palette={product.imagePalette}
            emoji={product.imageEmoji}
            alt={name}
          />
        </div>

        <div className="space-y-5">
          {/* ヘッダー: brand kicker は brandCountry / 最終更新 pill を排除して
              純粋な ID 行に絞る。「Kong · US · 2026/05」 のような並びは混雑
              するうえ Amazon 取込商品で brandCountry="Unknown" がそのまま
              出る事故もあった。最終更新は trust note 側に移管。 */}
          <div>
            <p className="t-card-meta">{product.brand}</p>
            <h1 className="mt-1.5 text-2xl font-extrabold leading-tight tracking-tight text-foreground md:text-3xl">
              {name}
            </h1>
          </div>

          {/* 解決する悩み: 大箱 → ヘッダーレスの薄い chip 列に圧縮。
              旧実装は p-5 + h3 「addresses_concerns」 で hero 並みに重かった。 */}
          {concernHits.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {concernHits.map((cid) => {
                const c = getConcern(cid);
                if (!c) return null;
                return (
                  <li
                    key={cid}
                    className="rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-primary"
                  >
                    {locale === "ja" ? `✓ ${c.labelJa}` : `✓ ${c.labelEn}`}
                  </li>
                );
              })}
            </ul>
          )}

          {/* Recommended size: searchParams で犬プロファイルがある時のみ表示。
              Buy の上に置いて「合うサイズ → そのサイズで買う」 の連続性を作る。 */}
          {bestSize && bestSize.fitScore >= 60 && (
            <div className="rounded-2xl border border-accent/40 bg-accent-soft p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-accent">
                {dict.product_detail.size_recommended_for_dog}
              </p>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-accent">
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

          {/* Buy compare: ATF コンバージョン要素として右カラム上位に配置。
              元実装では desc/concern/size 箱の後ろに埋もれていた。 */}
          <BuyOptionsCompare
            options={product.buyOptions}
            locale={locale}
            buyAtTemplate={dict.product_card.buy_at}
          />

          {/* 説明文 + 外部リンク注意書き: Buy の下に押し下げ。読み物だが
              CTA より優先する内容ではない。 */}
          <div className="space-y-2">
            <p className="text-sm leading-relaxed text-foreground md:text-base">
              {desc}
            </p>
            <p className="text-[11px] leading-relaxed text-muted-fg">
              {dict.product_detail.external_disclaimer}
            </p>
          </div>
        </div>
      </div>

      {/* Related products: same brand + similar concerns (回遊率 + セッション CVR) */}
      <RelatedProducts product={product} locale={locale} dict={dict} />

      {/* Related buying guides — internal linking signal + traffic to high-CVR articles */}
      <RelatedGuides product={product} locale={locale} dict={dict} />

      {/* Editor's verification notes — what we actually did to vet this product */}
      <TrustNotes product={product} dict={dict} locale={locale} />

      {/* Size chart: 採寸が意味のある商品 (= 服・ハーネス類で sizes が 2 件以上、
          かつ chestMax が 200 未満 = レンジが定義されてる) でのみ出す。
          ブラシ・歯磨き粉・ベッドなどの単一汎用サイズ品では表示すると
          全行 "—" の空テーブルになり、UI ノイズになるため抑制。 */}
      {product.sizes.length >= 2 && product.sizes.some((s) => s.chestMax < 200) && (
      <section className="mt-12">
        <h2 className="t-section">{dict.product_detail.size_chart}</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-card-border bg-card">
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
      )}

      {/* Mobile sticky bottom CTA — JP コマースの定番、CVR への寄与が大きい。
          デスクトップでは購入ボタンが本文中で常に見えるので非表示。
          Amazon が買い物導線として最も収益高い前提で優先採用、無ければ最初の有効ボタン。 */}
      <StickyMobileCta product={product} dict={dict} locale={locale} />
    </div>
  );
}

function RelatedProducts({
  product,
  locale,
  dict,
}: {
  product: NonNullable<ReturnType<typeof getProduct>>;
  locale: "ja" | "en";
  dict: Awaited<ReturnType<typeof getDictionary>>;
}) {
  const brandRelated = getRelatedByBrand(product.id, 8);
  const concernRelated = getRelatedByConcerns(product.id, 8);

  return (
    <div className="mt-8">
      {brandRelated.length > 0 && (
        <Rail
          title={format(dict.related.same_brand_title, {
            brand: product.brand,
          })}
          subtitle={dict.related.same_brand_subtitle}
        >
          {brandRelated.map((p) => (
            <RailItem key={`b-${p.id}`}>
              <MiniProductCard
                product={p}
                locale={locale}
                href={`/${locale}/products/${p.id}`}
              />
            </RailItem>
          ))}
        </Rail>
      )}
      {concernRelated.length > 0 && (
        <Rail
          title={dict.related.same_concerns_title}
          subtitle={dict.related.same_concerns_subtitle}
        >
          {concernRelated.map((p) => (
            <RailItem key={`c-${p.id}`}>
              <MiniProductCard
                product={p}
                locale={locale}
                href={`/${locale}/products/${p.id}`}
              />
            </RailItem>
          ))}
        </Rail>
      )}
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

  // 旧実装は「編集部の確認したこと」 大見出し + bordered card で 1-2 行の
  // 内容に対して大袈裟だった。横並びの inline pill 列に圧縮し、ratings
  // disclaimer は同じ横列の最後に muted で添える。
  return (
    <section className="mt-10 rounded-2xl border border-card-border bg-card p-4 md:p-5">
      <p className="t-card-meta mb-2.5">{dict.trust.section_title}</p>
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {items.map((line, i) => (
          <li
            key={i}
            className="flex items-center gap-1.5 text-xs text-foreground md:text-sm"
          >
            <span aria-hidden className="text-emerald-600">
              ✓
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 border-t border-border pt-2 text-[11px] leading-relaxed text-muted-fg">
        {dict.trust.no_ratings_disclaimer}
      </p>
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

  // Sticky CTA は「確定価格 + 確定ASIN」 を持つ Amazon を最優先、その次に
  // 確定 buyOption (rakuten / direct 等)、最後の手段として検索 fallback。
  // 旧実装は amazon-search-jp も拾う先頭一致で、価格表示が search fallback
  // (= 楽天 fallback の参考価格混入) を含んだ Math.min になっており、
  // 実体のない安値を CTA に出していた (リリース監査で blocker 判定)。
  const isFallback = (
    n?: import("@/lib/affiliate").AffiliateTarget["network"],
  ) => n === "amazon-search-jp" || n === "rakuten-search-jp";
  const concreteAmazonIdx = product.buyOptions.findIndex(
    (b) => b.target?.network === "amazon-jp",
  );
  const concreteOtherIdx = product.buyOptions.findIndex(
    (b) =>
      b.target &&
      !isFallback(b.target.network) &&
      b.target.network !== "amazon-jp",
  );
  const fallbackIdx = product.buyOptions.findIndex((b) => b.target);
  const ctaIdx =
    concreteAmazonIdx >= 0
      ? concreteAmazonIdx
      : concreteOtherIdx >= 0
        ? concreteOtherIdx
        : fallbackIdx >= 0
          ? fallbackIdx
          : 0;
  const cta = product.buyOptions[ctaIdx];
  const ctaUrl = resolveBuyUrl(cta);
  if (ctaUrl === "#") return null;
  const name = locale === "ja" ? product.nameJa : product.nameEn;

  // 「最安値」 計算は search fallback を除外。fallback 同士しかない場合は
  // 全部参考値なので価格非表示、CTA だけ出す。
  const concretePrices = product.buyOptions
    .filter((b) => !isFallback(b.target?.network))
    .map((b) => b.priceJpy);
  const lowest =
    concretePrices.length > 0 ? Math.min(...concretePrices) : null;
  return (
    <div
      // bottom-16: MobileBottomNav の上に重ねる。lg:hidden は元から (デスクトップでは
      // 通常 CTA が本文中で常に見えるので不要)。
      className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-card/95 px-4 pt-3 backdrop-blur-md shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden"
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
          {lowest != null ? (
            <p className="text-base font-extrabold text-primary">
              {formatPrice(lowest, locale)}
            </p>
          ) : (
            // 確定価格を持つ shop が無い (= 検索 fallback だけ) の商品は
            // 価格非表示。誤った安値を CTA に並べないため。
            <p className="text-[11px] text-muted-fg">
              {locale === "ja" ? "価格は遷移先で確認" : "See price"}
            </p>
          )}
        </div>
        <a
          href={ctaUrl}
          target="_blank"
          rel={AFFILIATE_REL}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-bold text-background transition-opacity hover:opacity-90"
        >
          {/* 景表法ステマ規制対応。CTA 全体が dark なので白枠 pill で明示。
              opacity-80 だと「広告と判別できる」要件を満たさないリスクがあった。 */}
          <span
            aria-label="ad"
            className="mr-1.5 rounded bg-background/20 px-1.5 py-0.5 text-[10px] font-bold"
          >
            PR
          </span>
          {format(dict.product_card.buy_at, { shop: cta.shop })}
        </a>
      </div>
    </div>
  );
}
