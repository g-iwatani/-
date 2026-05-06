import Link from "next/link";
import { ConcernCard } from "@/components/ConcernCard";
import { ProductCard } from "@/components/ProductCard";
import { getPopularConcerns } from "@/lib/concerns";
import { getPopularProducts } from "@/lib/products";
import { getDictionary, hasLocale } from "./dictionaries";
import { notFound } from "next/navigation";

export default async function HomePage({
  params,
}: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const root = `/${locale}`;

  const popularConcerns = getPopularConcerns(6);
  const popularProducts = getPopularProducts(4);

  // 商品をProductMatch型に揃える(レコメンド色を入れずに人気順をそのまま表示)
  const popularMatches = popularProducts.map((product) => ({
    product,
    bestSize: undefined,
    concernHits: [],
    concernMatchRatio: 0,
    popularityScore: product.popularity,
    totalScore: product.popularity,
  }));

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-5 pt-12 pb-16 md:pt-20 md:pb-24">
          <div className="grid gap-10 md:grid-cols-[3fr_2fr] md:items-center">
            <div className="space-y-6">
              <p className="inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                {dict.hero.eyebrow}
              </p>
              <h1 className="whitespace-pre-line text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl">
                {dict.hero.title}
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-muted-fg md:text-lg">
                {dict.hero.subtitle}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href={`${root}/search`}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-fg shadow-md shadow-primary/20 transition-transform hover:-translate-y-0.5"
                >
                  {dict.hero.cta_primary}
                </Link>
                <Link
                  href="#popular-concerns"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {dict.hero.cta_secondary}
                </Link>
              </div>
            </div>

            <div className="relative">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-6xl px-5 pb-12">
        <h2 className="text-xl font-extrabold tracking-tight text-foreground md:text-2xl">
          {dict.value_props.title}
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {dict.value_props.items.map((item, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-card-border bg-card p-6"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent">
                <span className="text-lg font-extrabold">{idx + 1}</span>
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-fg">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular concerns */}
      <section
        id="popular-concerns"
        className="mx-auto max-w-6xl px-5 pt-12 pb-8"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-foreground md:text-2xl">
              {dict.popular_concerns.title}
            </h2>
            <p className="mt-1 text-sm text-muted-fg">
              {dict.popular_concerns.subtitle}
            </p>
          </div>
          <Link
            href={`${root}/search`}
            className="hidden text-sm font-semibold text-primary hover:underline md:inline"
          >
            {dict.popular_concerns.view_all} →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popularConcerns.map((concern) => (
            <ConcernCard
              key={concern.id}
              concern={concern}
              locale={locale}
              href={`${root}/results?concerns=${concern.id}`}
            />
          ))}
        </div>
      </section>

      {/* Popular products */}
      <section className="mx-auto max-w-6xl px-5 pt-12 pb-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-foreground md:text-2xl">
              {dict.popular_products.title}
            </h2>
            <p className="mt-1 text-sm text-muted-fg">
              {dict.popular_products.subtitle}
            </p>
          </div>
          <Link
            href={`${root}/results`}
            className="hidden text-sm font-semibold text-primary hover:underline md:inline"
          >
            {dict.popular_products.view_all} →
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {popularMatches.map((match) => (
            <ProductCard
              key={match.product.id}
              match={match}
              locale={locale}
              dict={dict}
              href={`${root}/products/${match.product.id}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function HeroIllustration() {
  return (
    <div className="relative mx-auto aspect-square max-w-md">
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-full"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 60%, #fce6d8 0%, transparent 70%)",
        }}
      />
      <svg
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
        className="relative h-full w-full"
      >
        {/* Background paw shapes */}
        <g opacity="0.18" fill="#d97a4e">
          <ellipse cx="60" cy="80" rx="14" ry="12" />
          <ellipse cx="80" cy="60" rx="6" ry="8" />
          <ellipse cx="50" cy="55" rx="6" ry="8" />
          <ellipse cx="38" cy="78" rx="6" ry="7" />
          <ellipse cx="78" cy="92" rx="6" ry="7" />
        </g>
        <g opacity="0.16" fill="#6b8e4e">
          <ellipse cx="340" cy="320" rx="14" ry="12" />
          <ellipse cx="358" cy="302" rx="6" ry="8" />
          <ellipse cx="328" cy="296" rx="6" ry="8" />
        </g>

        {/* Dog silhouette card */}
        <g transform="translate(80,90)">
          <rect
            x="0"
            y="0"
            width="240"
            height="220"
            rx="32"
            fill="#ffffff"
            stroke="#ead9c2"
            strokeWidth="2"
          />
          {/* Stylized dog face */}
          <g transform="translate(120,110)">
            <ellipse cx="0" cy="20" rx="62" ry="56" fill="#fce6d8" />
            <ellipse cx="-30" cy="-10" rx="20" ry="32" fill="#d97a4e" />
            <ellipse cx="30" cy="-10" rx="20" ry="32" fill="#d97a4e" />
            <circle cx="-20" cy="20" r="5" fill="#2d1f1a" />
            <circle cx="20" cy="20" r="5" fill="#2d1f1a" />
            <ellipse cx="0" cy="42" rx="8" ry="6" fill="#2d1f1a" />
            <path
              d="M-10 50 Q0 60 10 50"
              stroke="#2d1f1a"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </g>
          <g
            transform="translate(120,206)"
            fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
            fontSize="11"
            fill="#6b5848"
            textAnchor="middle"
            fontWeight="600"
          >
            <text>うちの子にぴったり</text>
          </g>
        </g>
      </svg>
    </div>
  );
}
