import Link from "next/link";
import { notFound } from "next/navigation";
import { BreedChip } from "@/components/BreedChip";
import { CategoryGrid } from "@/components/CategoryGrid";
import { ConcernChip } from "@/components/ConcernChip";
import { GuideCard } from "@/components/GuideCard";
import { RecentRail } from "@/components/RecentRail";
import { SeasonalBanner } from "@/components/SeasonalBanner";
import { MiniProductCard } from "@/components/MiniProductCard";
import { PopularProductCard } from "@/components/PopularProductCard";
import { Rail, RailItem } from "@/components/Rail";
import { RankedMiniCard } from "@/components/RankedMiniCard";
import { breeds, getPopularBreeds } from "@/lib/breeds";
import {
  concerns,
  getConcernsByCategory,
  getPopularConcerns,
} from "@/lib/concerns";
import { guides } from "@/lib/guides";
import { topPopular } from "@/lib/popular-products";
import {
  getAmazonTopN,
  listBrands,
  visibleProducts as products,
} from "@/lib/products";
import {
  StructuredData,
  organizationSchema,
  webSiteSchema,
} from "@/lib/structured-data";
import { getDictionary, hasLocale } from "./dictionaries";

function productsByConcern(concernId: string) {
  return products
    .filter((p) => p.concerns.includes(concernId))
    .sort((a, b) => b.popularity - a.popularity);
}

function productsByCategory(category: "apparel" | "toy" | "env") {
  return products
    .filter((p) => p.category === category)
    .sort((a, b) => b.popularity - a.popularity);
}

// SSG cache file が約 1.7 MB に膨らむと OpenNext / Cloudflare Workers の
// 内部しきい値で配信されず 404 になる事象を /ja/popular と同じく回避するため、
// 動的レンダーに切替。今後の改善で rails のデータ量を絞ったら SSG に戻す。
export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const root = `/${locale}`;

  const popularBreeds = getPopularBreeds();
  // RecentRail (client) に渡す id → Product lookup。visibleProducts 全件を
  // 投影するので 50KB ほど HTML に乗るが、homepage の 1 度きりなので OK。
  const recentLookup: Record<string, (typeof products)[number]> = {};
  for (const p of products) recentLookup[p.id] = p;
  const allBreeds = breeds.filter((b) => b.id !== "mix" && !b.id.startsWith("unknown-"));
  const popularConcerns = getPopularConcerns(8);
  const trendingPopular = topPopular(12);
  const amazonTop10 = getAmazonTopN(10);

  const rails: Array<{
    title: string;
    subtitle?: string;
    concernId?: string;
    category?: "apparel" | "toy" | "env";
    custom?: { products: typeof products };
  }> = [
    {
      title: locale === "ja" ? "服(全般)" : "Apparel",
      subtitle:
        locale === "ja"
          ? "シーズン・体型に合わせて選べる定番"
          : "Year-round and seasonal apparel staples",
      category: "apparel",
    },
    {
      title:
        locale === "ja"
          ? "MIX犬・小型犬向けの服"
          : "Apparel for small and mixed breeds",
      concernId: "small-breed",
    },
    {
      title:
        locale === "ja"
          ? "頑丈で長持ちするおもちゃ"
          : "Tough, long-lasting toys",
      concernId: "destroys-toys",
    },
    {
      title: locale === "ja" ? "暑がりさんの夏支度" : "Beat the summer heat",
      concernId: "hot-summer",
    },
    {
      title: locale === "ja" ? "冬の防寒コート" : "Winter warmth",
      concernId: "cold-winter",
    },
    {
      title:
        locale === "ja"
          ? "雨の日の散歩を快適に"
          : "Make rainy walks easy",
      concernId: "rainy-walk",
    },
    {
      title: locale === "ja" ? "留守番が苦手な子に" : "For dogs who hate alone time",
      concernId: "lonely-when-alone",
    },
    {
      title:
        locale === "ja"
          ? "引っ張り癖を直したい"
          : "For pullers on the leash",
      concernId: "pulls-leash",
    },
    {
      title: locale === "ja" ? "シニア犬向けケア" : "Senior-dog support",
      concernId: "senior-dog",
    },
    {
      title:
        locale === "ja"
          ? "ご飯のお悩みに(食器・給仕)"
          : "Mealtime helpers (bowls and feeders)",
      subtitle:
        locale === "ja"
          ? "早食い・偏食・うつむき食いなどの工夫"
          : "Slow feeders, height-adjustable stands and more",
      concernId: "picky-eater",
    },
    {
      title: locale === "ja" ? "子犬を迎えたばかりの方へ" : "New-puppy starters",
      concernId: "puppy",
    },
    {
      title:
        locale === "ja"
          ? "長時間散歩派の装備"
          : "Gear for long-walk lifestyles",
      concernId: "long-walker",
    },
    {
      title: locale === "ja" ? "おもちゃ全般" : "All toys",
      category: "toy",
    },
    {
      title:
        locale === "ja"
          ? "ハーネス・装備一覧"
          : "Harnesses & gear",
      category: "env",
    },
  ];

  const visibleRails = rails.filter((r) => {
    if (r.concernId) return productsByConcern(r.concernId).length > 0;
    if (r.category) return productsByCategory(r.category).length > 0;
    return true;
  });

  return (
    <div className="pb-12">
      <StructuredData
        items={[organizationSchema(locale), webSiteSchema(locale)]}
      />
      {/* Hero (search-first, commerce reflex) */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary-soft/40 to-background">
        <div className="mx-auto max-w-5xl px-5 pt-8 pb-8 md:pt-12 md:pb-10">
          <div className="text-center">
            <p className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-fg">
              {dict.hero.eyebrow}
            </p>
            <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
              {dict.hero.title}
            </h1>
          </div>

          {/* Big search input — the primary surface action */}
          <form
            method="GET"
            action={`${root}/find`}
            role="search"
            className="mx-auto mt-6 flex max-w-2xl items-center gap-2 rounded-full border-2 border-primary bg-card px-2 py-2 shadow-lg shadow-primary/10 focus-within:border-primary md:px-3"
          >
            <span aria-hidden className="ml-2 text-xl">
              🔍
            </span>
            <input
              type="search"
              name="q"
              placeholder={dict.find.placeholder}
              className="min-w-0 flex-1 bg-transparent px-1 py-2 text-base text-foreground placeholder:text-muted-fg focus:outline-none md:text-lg"
              autoComplete="off"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-fg hover:opacity-90"
            >
              {dict.find.submit}
            </button>
          </form>

          {/* Quick concern chips — top 5 popular */}
          <div className="mx-auto mt-4 flex max-w-3xl flex-wrap items-center justify-center gap-2 px-3 text-xs">
            <span className="text-muted-fg">{dict.hero.quick_label}</span>
            {popularConcerns.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                href={`${root}/results?concerns=${c.id}`}
                className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-fg transition-colors hover:border-primary hover:text-primary"
              >
                {locale === "ja" ? c.labelJa : c.labelEn}
              </Link>
            ))}
          </div>

          {/* Secondary CTAs (the question-flow + popular landing) */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Link
              href={`${root}/search`}
              className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-bold text-background hover:opacity-90"
            >
              {dict.hero.cta_primary}
            </Link>
            <Link
              href={`${root}/popular`}
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:border-primary hover:text-primary"
            >
              {dict.hero.cta_popular ?? dict.nav.popular}
            </Link>
          </div>
        </div>
      </section>

      {/* Category icon grid (Mercari/ZOZO-style commerce reflex) */}
      <CategoryGrid locale={locale} />

      {/* Seasonal campaign banner (current month → matching guide) */}
      <SeasonalBanner locale={locale} />

      {/* Recently viewed (localStorage, hidden when empty) */}
      <RecentRail locale={locale} lookup={recentLookup} />

      {/* Amazon best-sellers TOP 10 — popularity-driven social proof */}
      {amazonTop10.length > 0 && (
        <Rail
          title={
            locale === "ja" ? "Amazon 売れ筋 TOP 10" : "Amazon top 10"
          }
          subtitle={
            locale === "ja"
              ? "Amazon JP 売れ筋ランキング上位 (月次更新)"
              : "Amazon JP best-seller ranking (refreshed monthly)"
          }
        >
          {amazonTop10.map((p, i) => (
            <RailItem key={`amz-${p.id}`}>
              <RankedMiniCard
                product={p}
                rank={i + 1}
                locale={locale}
                href={`${root}/products/${p.id}`}
              />
            </RailItem>
          ))}
        </Rail>
      )}

      {/* Rakuten 売れ筋 TOP 10 (kept here, original rail below removed) */}
      {trendingPopular.length > 0 && (
        <Rail
          title={
            locale === "ja" ? "楽天 売れ筋 TOP 10" : "Rakuten top 10"
          }
          subtitle={
            locale === "ja"
              ? "楽天市場のランキング上位 (リアルタイム連動)"
              : "Rakuten Ichiba ranking (live)"
          }
          viewAllHref={`${root}/popular`}
          viewAllLabel={
            locale === "ja" ? "全ての人気商品を見る" : "View all popular"
          }
        >
          {trendingPopular.slice(0, 10).map((p, i) => (
            <RailItem key={`rkt-${p.id}`}>
              <PopularProductCard product={p} locale={locale} variant="rail" rank={i + 1} />
            </RailItem>
          ))}
        </Rail>
      )}

      {/* Buying guides rail */}
      <Rail
        title={locale === "ja" ? "選び方ガイド" : "Buying guides"}
        subtitle={
          locale === "ja"
            ? "編集部が悩み別に書き下ろし"
            : "Editor-written, concern-first"
        }
        viewAllHref={`${root}/guides/${guides[0]?.slug ?? ""}`}
        viewAllLabel={
          locale === "ja" ? "全ガイドを見る" : "All guides"
        }
      >
        {guides.map((g) => (
          <RailItem key={g.slug}>
            <GuideCard guide={g} locale={locale} />
          </RailItem>
        ))}
      </Rail>

      {/* Popular breeds rail */}
      <Rail
        title={locale === "ja" ? "人気の犬種から探す" : "Popular breeds"}
        subtitle={
          locale === "ja"
            ? "うちの子の犬種をタップ"
            : "Tap your dog's breed"
        }
        viewAllHref={`${root}/search`}
        viewAllLabel={locale === "ja" ? "全犬種を見る" : "All breeds"}
      >
        {[...popularBreeds, ...allBreeds.slice(0, 24)].map((breed) => (
          <RailItem key={`pop-${breed.id}`}>
            <BreedChip breed={breed} locale={locale} />
          </RailItem>
        ))}
      </Rail>

      {/* Popular concerns rail */}
      <Rail
        title={
          locale === "ja"
            ? "今みんなが悩んでいること"
            : "What dog parents are working on"
        }
        subtitle={
          locale === "ja"
            ? "悩みをタップして関連商品をチェック"
            : "Tap a problem to see relevant items"
        }
        viewAllHref={`${root}/search`}
      >
        {popularConcerns.map((concern) => (
          <RailItem key={`con-${concern.id}`}>
            <ConcernChip
              concern={concern}
              locale={locale}
              href={`${root}/results?concerns=${concern.id}`}
            />
          </RailItem>
        ))}
      </Rail>

      {/* Product rails */}
      {visibleRails.map((rail, idx) => {
        let items: typeof products = [];
        if (rail.concernId) items = productsByConcern(rail.concernId);
        else if (rail.category) items = productsByCategory(rail.category);
        if (items.length === 0) return null;
        const href = rail.concernId
          ? `${root}/results?concerns=${rail.concernId}`
          : `${root}/results`;
        return (
          <Rail
            key={`rail-${idx}`}
            title={rail.title}
            subtitle={rail.subtitle}
            viewAllHref={href}
          >
            {items.map((p) => (
              <RailItem key={`${idx}-${p.id}`}>
                <MiniProductCard
                  product={p}
                  locale={locale}
                  href={`${root}/products/${p.id}`}
                />
              </RailItem>
            ))}
          </Rail>
        );
      })}

      {/* Concern category rails */}
      {(["behavior", "care", "season", "size", "purpose"] as const).map((cat) => {
        const items = getConcernsByCategory(cat);
        if (items.length === 0) return null;
        const titles: Record<typeof cat, { ja: string; en: string }> = {
          behavior: { ja: "行動・しつけのお悩み", en: "Behavior & training" },
          care: { ja: "ケア・手入れのお悩み", en: "Care & grooming" },
          season: { ja: "季節・天気のお悩み", en: "Seasonal concerns" },
          size: { ja: "サイズ・体型のお悩み", en: "Size & fit concerns" },
          purpose: { ja: "用途・場面別", en: "By purpose" },
        };
        return (
          <Rail
            key={`con-cat-${cat}`}
            title={locale === "ja" ? titles[cat].ja : titles[cat].en}
          >
            {items.map((concern) => (
              <RailItem key={`cat-${cat}-${concern.id}`}>
                <ConcernChip
                  concern={concern}
                  locale={locale}
                  href={`${root}/results?concerns=${concern.id}`}
                />
              </RailItem>
            ))}
          </Rail>
        );
      })}

      {/* Brands rail */}
      <Rail
        title={locale === "ja" ? "ブランド一覧" : "Brands we cover"}
        subtitle={
          locale === "ja"
            ? "国内外のブランドを横断して比較"
            : "Compare across global brands"
        }
        viewAllHref={`${root}/results`}
      >
        {listBrands().map((brand) => (
          <RailItem key={`brand-${brand}`}>
            <Link
              href={`${root}/results?brand=${encodeURIComponent(brand)}`}
              className="flex h-20 w-[160px] items-center justify-center rounded-2xl border border-card-border bg-card px-4 text-sm font-bold text-foreground transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary md:h-24 md:w-[180px]"
            >
              {brand}
            </Link>
          </RailItem>
        ))}
      </Rail>

      {/* Bottom CTA */}
      <section className="mx-auto mt-20 max-w-4xl px-5">
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
            {dict.hero.cta_primary} →
          </Link>
        </div>
      </section>

      {/* hidden anchor for #popular-concerns scroll target */}
      <span id="popular-concerns" className="block h-0" aria-hidden="true" />
    </div>
  );
}

// concerns referenced for typing only
void concerns;

// FeaturedHero (編集部の月次 1 押し) は信号弱いため廃止。代わりに Amazon TOP10 +
// 楽天 TOP10 のランキングベース rail を hero 直下に配置 (Snidan/Mercari/ZOZO 流)。

