import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompareToggle } from "@/components/CompareToggle";
import { ProductImage } from "@/components/ProductImage";
import { AFFILIATE_REL } from "@/lib/affiliate";
import { COMPARE_MAX } from "@/lib/compare";
import { getConcern } from "@/lib/concerns";
import { format, formatPrice } from "@/lib/format";
import { type Product, getProduct, resolveBuyUrl } from "@/lib/products";
import { absoluteUrl, localizedAlternates } from "@/lib/site";
import { getProductTrust } from "@/lib/trust";
import { defaultLocale, getDictionary, hasLocale } from "../dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safe = hasLocale(locale) ? locale : defaultLocale;
  return {
    title: safe === "ja" ? "商品比較" : "Compare products",
    alternates: {
      canonical: `/${safe}/compare`,
      languages: localizedAlternates("/compare"),
    },
    // 比較は ?ids= で内容が変わるため、SEO 対象としてインデックスさせない。
    robots: { index: false, follow: true },
  };
}

export default async function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const sp = (await searchParams) ?? {};
  const idsRaw = Array.isArray(sp.ids) ? sp.ids[0] : sp.ids;
  const ids = idsRaw
    ? idsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, COMPARE_MAX)
    : [];

  const products = ids
    .map((id) => getProduct(id))
    .filter((p): p is Product => Boolean(p));

  return (
    <div className="mx-auto max-w-7xl px-5 pt-8 pb-32 lg:pb-16">
      <div className="mb-6">
        <Link
          href={`/${locale}/results`}
          className="text-sm font-semibold text-muted-fg hover:text-primary"
        >
          {dict.compare_page.back}
        </Link>
      </div>

      <header className="mb-6 space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
          {dict.compare_page.title}
        </h1>
        <p className="text-sm text-muted-fg">
          {format(dict.compare_page.subtitle, {
            n: products.length,
            max: COMPARE_MAX,
          })}
        </p>
      </header>

      {products.length === 0 ? (
        <EmptyState locale={locale} dict={dict} />
      ) : (
        <CompareGrid products={products} locale={locale} dict={dict} />
      )}
    </div>
  );
}

function EmptyState({
  locale,
  dict,
}: {
  locale: "ja" | "en";
  dict: Awaited<ReturnType<typeof getDictionary>>;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
      <p className="text-base text-muted-fg">{dict.compare_page.empty}</p>
      <Link
        href={`/${locale}/results`}
        className="mt-5 inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-bold text-background hover:opacity-90"
      >
        {dict.compare_page.go_results}
      </Link>
    </div>
  );
}

function CompareGrid({
  products,
  locale,
  dict,
}: {
  products: Product[];
  locale: "ja" | "en";
  dict: Awaited<ReturnType<typeof getDictionary>>;
}) {
  return (
    <div className="-mx-5 overflow-x-auto px-5">
      <div
        className="grid grid-flow-col gap-4 pb-2"
        style={{
          gridAutoColumns: "minmax(15rem, 1fr)",
        }}
      >
        {products.map((p) => (
          <CompareColumn
            key={p.id}
            product={p}
            locale={locale}
            dict={dict}
          />
        ))}
      </div>
    </div>
  );
}

function CompareColumn({
  product,
  locale,
  dict,
}: {
  product: Product;
  locale: "ja" | "en";
  dict: Awaited<ReturnType<typeof getDictionary>>;
}) {
  const name = locale === "ja" ? product.nameJa : product.nameEn;
  const desc = locale === "ja" ? product.descJa : product.descEn;
  const tags = locale === "ja" ? product.tagsJa : product.tagsEn;
  const lowest = Math.min(...product.buyOptions.map((b) => b.priceJpy));
  const trust = getProductTrust(product);

  // 主要 CTA: Amazon 優先、無ければ最初の有効ボタン
  const amazonIdx = product.buyOptions.findIndex((b) =>
    b.target?.network.startsWith("amazon-"),
  );
  const ctaIdx = amazonIdx >= 0 ? amazonIdx : 0;
  const cta = product.buyOptions[ctaIdx];
  const ctaUrl = cta ? resolveBuyUrl(cta) : "#";

  const concernLabels = product.concerns
    .map((id) => getConcern(id))
    .filter((c) => Boolean(c))
    .slice(0, 4)
    .map((c) => (locale === "ja" ? c!.labelJa : c!.labelEn));

  const detailHref = `/${locale}/products/${product.id}`;

  return (
    <article className="relative flex flex-col rounded-2xl border border-card-border bg-card p-3">
      <CompareToggle productId={product.id} dict={dict} />
      <Link href={detailHref}>
        <ProductImage
          palette={product.imagePalette}
          emoji={product.imageEmoji}
          imageUrl={product.imageUrl}
          alt={name}
          size="md"
        />
      </Link>

      <SpecRow label={dict.compare_page.spec_brand}>
        <p className="text-xs font-bold uppercase tracking-wide text-muted-fg">
          {product.brand}
        </p>
        {trust.source === "amazon-bestseller" && (
          <p className="mt-1 text-[10px] text-amber-700">
            ★ {dict.trust.badge_bestseller}
          </p>
        )}
        {trust.source === "curated" && (
          <p className="mt-1 text-[10px] text-emerald-700">
            ★ {dict.trust.badge_curated}
          </p>
        )}
      </SpecRow>

      <SpecRow label={dict.compare_page.spec_name}>
        <Link href={detailHref}>
          <h3 className="text-sm font-bold leading-snug text-foreground hover:text-primary">
            {name}
          </h3>
        </Link>
      </SpecRow>

      <SpecRow label={dict.compare_page.spec_price}>
        <p className="text-xl font-extrabold text-primary">
          {formatPrice(lowest, locale)}
        </p>
      </SpecRow>

      <SpecRow label={dict.compare_page.spec_buy}>
        {cta && ctaUrl !== "#" ? (
          <a
            href={ctaUrl}
            target="_blank"
            rel={AFFILIATE_REL}
            className="inline-flex w-full items-center justify-center rounded-full bg-foreground px-3 py-2 text-xs font-bold text-background hover:opacity-90"
          >
            <span aria-label="ad" className="mr-1 text-[9px] opacity-70">
              PR
            </span>
            {format(dict.product_card.buy_at, { shop: cta.shop })}
          </a>
        ) : (
          <span className="text-xs text-muted-fg">—</span>
        )}
      </SpecRow>

      <SpecRow label={dict.compare_page.spec_concerns}>
        {concernLabels.length === 0 ? (
          <span className="text-xs text-muted-fg">—</span>
        ) : (
          <ul className="space-y-1 text-xs text-foreground">
            {concernLabels.map((label, i) => (
              <li key={i}>· {label}</li>
            ))}
          </ul>
        )}
      </SpecRow>

      <SpecRow label={dict.compare_page.spec_tags}>
        {tags.length === 0 ? (
          <span className="text-xs text-muted-fg">—</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-fg"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </SpecRow>

      <SpecRow label={dict.compare_page.spec_summary}>
        <p className="line-clamp-3 text-xs leading-relaxed text-muted-fg">
          {desc}
        </p>
      </SpecRow>

      <div className="mt-3">
        <Link
          href={detailHref}
          className="inline-flex w-full items-center justify-center rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-fg hover:border-primary hover:text-primary"
        >
          {dict.product_card.view_detail}
        </Link>
      </div>
    </article>
  );
}

function SpecRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-3 border-t border-border pt-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-fg">
        {label}
      </p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

// Reference for typing only — absoluteUrl unused in body but kept for symmetry
void absoluteUrl;
