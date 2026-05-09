import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GuideCard } from "@/components/GuideCard";
import { MiniProductCard } from "@/components/MiniProductCard";
import { type Guide, guides } from "@/lib/guides";
import { type Product, visibleProducts } from "@/lib/products";
import { absoluteUrl, localizedAlternates } from "@/lib/site";
import { defaultLocale, getDictionary, hasLocale } from "../dictionaries";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safe = hasLocale(locale) ? locale : defaultLocale;
  const sp = (await searchParams) ?? {};
  const q = String(sp.q ?? "").trim();
  const titleBase = safe === "ja" ? "サイト内検索" : "Site search";
  return {
    title: q ? `${q} — ${titleBase}` : titleBase,
    alternates: {
      canonical: `/${safe}/find`,
      languages: localizedAlternates("/find"),
    },
    // クエリ駆動の URL は無限に生まれるため、検索結果ページは noindex 推奨。
    robots: { index: false, follow: true },
  };
}

export default async function FindPage({
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
  const q = String(sp.q ?? "").trim();

  const productHits = q ? searchProducts(q, locale) : [];
  const guideHits = q ? searchGuides(q, locale) : [];

  return (
    <div className="mx-auto max-w-5xl px-5 pt-8 pb-32 lg:pb-16">
      <header className="mb-6 space-y-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
          {dict.find.title}
        </h1>
        <SearchForm
          initialQuery={q}
          action={`/${locale}/find`}
          placeholder={dict.find.placeholder}
          submitLabel={dict.find.submit}
        />
      </header>

      {!q ? (
        <p className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-fg">
          {dict.find.empty_prompt}
        </p>
      ) : productHits.length === 0 && guideHits.length === 0 ? (
        <NoResults query={q} dict={dict} locale={locale} />
      ) : (
        <div className="space-y-10">
          {guideHits.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-fg">
                {dict.find.section_guides} ({guideHits.length})
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {guideHits.slice(0, 6).map((g) => (
                  <li key={g.slug}>
                    <GuideCard guide={g} locale={locale} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {productHits.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-fg">
                {dict.find.section_products} ({productHits.length})
              </h2>
              <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {productHits.slice(0, 24).map((p) => (
                  <li key={p.id}>
                    <MiniProductCard
                      product={p}
                      locale={locale}
                      href={`/${locale}/products/${p.id}`}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function SearchForm({
  initialQuery,
  action,
  placeholder,
  submitLabel,
}: {
  initialQuery: string;
  action: string;
  placeholder: string;
  submitLabel: string;
}) {
  return (
    <form
      method="GET"
      action={action}
      className="flex items-center gap-2 rounded-full border border-border bg-card p-1.5 pl-5 shadow-sm focus-within:border-primary"
    >
      <input
        type="search"
        name="q"
        defaultValue={initialQuery}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-fg focus:outline-none"
        autoComplete="off"
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-fg hover:opacity-90"
      >
        {submitLabel}
      </button>
    </form>
  );
}

function NoResults({
  query,
  dict,
  locale,
}: {
  query: string;
  dict: Awaited<ReturnType<typeof getDictionary>>;
  locale: "ja" | "en";
}) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
      <p className="text-sm text-muted-fg">
        「{query}」 — {dict.find.no_results}
      </p>
      <Link
        href={`/${locale}/results`}
        className="mt-5 inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-bold text-background hover:opacity-90"
      >
        {dict.find.browse_all}
      </Link>
    </div>
  );
}

/**
 * シンプルな部分一致検索。スペース区切りでクエリ語をトークン化し、
 * 各語が hay (検索対象テキスト) に含まれる回数を score として加算する。
 *
 * Pagefind 等の本格全文検索インデックスを入れる前提の暫定実装。
 * 商品 200 件規模なら毎リクエスト線形スキャンで十分速い (1ms 以下)。
 */
function searchProducts(query: string, locale: "ja" | "en"): Product[] {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);
  if (tokens.length === 0) return [];
  const scored: { p: Product; score: number }[] = [];
  for (const p of visibleProducts) {
    const name = locale === "ja" ? p.nameJa : p.nameEn;
    const desc = locale === "ja" ? p.descJa : p.descEn;
    const tags = locale === "ja" ? p.tagsJa : p.tagsEn;
    const hay = `${p.brand} ${name} ${desc} ${tags.join(" ")}`.toLowerCase();
    let score = 0;
    for (const t of tokens) {
      if (hay.includes(t)) score++;
    }
    if (score > 0) scored.push({ p, score });
  }
  scored.sort(
    (a, b) => b.score - a.score || b.p.popularity - a.p.popularity,
  );
  return scored.map((x) => x.p);
}

function searchGuides(query: string, locale: "ja" | "en"): Guide[] {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);
  if (tokens.length === 0) return [];
  const scored: { g: Guide; score: number }[] = [];
  for (const g of guides) {
    const title = locale === "ja" ? g.titleJa : g.titleEn;
    const lead = locale === "ja" ? g.leadJa : g.leadEn;
    const hay = `${title} ${lead}`.toLowerCase();
    let score = 0;
    for (const t of tokens) {
      if (hay.includes(t)) score++;
    }
    if (score > 0) scored.push({ g, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.map((x) => x.g);
}

// reference for typing only
void absoluteUrl;
