import Link from "next/link";
import { notFound } from "next/navigation";
import { BreedChip } from "@/components/BreedChip";
import { ConcernChip } from "@/components/ConcernChip";
import { FeaturedProduct } from "@/components/FeaturedProduct";
import { GuideCard } from "@/components/GuideCard";
import { MiniProductCard } from "@/components/MiniProductCard";
import { PopularProductCard } from "@/components/PopularProductCard";
import { Rail, RailItem } from "@/components/Rail";
import { breeds, getPopularBreeds } from "@/lib/breeds";
import {
  concerns,
  getConcernsByCategory,
  getPopularConcerns,
} from "@/lib/concerns";
import { formatLastUpdated } from "@/lib/format";
import { guides } from "@/lib/guides";
import { topPopular } from "@/lib/popular-products";
import {
  getProduct,
  listBrands,
  visibleProducts as products,
} from "@/lib/products";
import { site } from "@/lib/site";
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
  const allBreeds = breeds.filter((b) => b.id !== "mix" && !b.id.startsWith("unknown-"));
  const popularConcerns = getPopularConcerns(8);
  const trendingPopular = topPopular(12);

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
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 pt-10 pb-10 md:pt-16 md:pb-14">
          <div className="grid gap-10 md:grid-cols-[3fr_2fr] md:items-center">
            <div className="space-y-5">
              <p className="inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                {dict.hero.eyebrow}
              </p>
              <h1 className="whitespace-pre-line text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl">
                {dict.hero.title}
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-muted-fg md:text-base">
                {dict.hero.subtitle}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
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

      {/* Editor's monthly featured product (hero card) */}
      <FeaturedHero locale={locale} dict={dict} />

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

      {/* Trending on Rakuten rail (only when data exists) */}
      {trendingPopular.length > 0 && (
        <Rail
          title={
            locale === "ja" ? "楽天で今売れている" : "Trending on Rakuten now"
          }
          subtitle={
            locale === "ja"
              ? "ランキング上位を価格・評価で絞り込み可能"
              : "Filter top-ranked items by price and rating"
          }
          viewAllHref={`${root}/popular`}
          viewAllLabel={
            locale === "ja" ? "全ての人気商品を見る" : "View all popular"
          }
        >
          {trendingPopular.map((p) => (
            <RailItem key={`pop-${p.id}`}>
              <PopularProductCard product={p} locale={locale} variant="rail" />
            </RailItem>
          ))}
        </Rail>
      )}

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

/**
 * 編集部の今月の 1 押しヒーローカード。site.featured で指定された商品 ID を
 * 解決して FeaturedProduct に渡す。指定 ID が無効な場合は何も描画しない (silent
 * no-op) — 商品が削除されてもページ全体が壊れないように。
 */
function FeaturedHero({
  locale,
  dict,
}: {
  locale: "ja" | "en";
  dict: Awaited<ReturnType<typeof getDictionary>>;
}) {
  const product = getProduct(site.featured.productId);
  if (!product) return null;
  const reason =
    locale === "ja" ? site.featured.reasonJa : site.featured.reasonEn;
  return (
    <FeaturedProduct
      product={product}
      reason={reason}
      monthLabel={formatLastUpdated(
        site.lastUpdated.year,
        site.lastUpdated.month,
        locale,
      )}
      locale={locale}
      dict={dict}
    />
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
        </g>
      </svg>
    </div>
  );
}
