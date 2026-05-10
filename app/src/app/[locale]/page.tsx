import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryGrid } from "@/components/CategoryGrid";
import { GuideCard } from "@/components/GuideCard";
import { type FeedItem, ProductFeed } from "@/components/ProductFeed";
import { Rail, RailItem } from "@/components/Rail";
import { RecentRail } from "@/components/RecentRail";
import { type Concern, getConcern, getPopularConcerns } from "@/lib/concerns";
import { guides } from "@/lib/guides";
import { topPopular } from "@/lib/popular-products";
import { listBrands, visibleProducts as products } from "@/lib/products";
import {
  StructuredData,
  organizationSchema,
  webSiteSchema,
} from "@/lib/structured-data";
import { getDictionary, hasLocale } from "./dictionaries";

// SSG cache file が約 1.7 MB に膨らむと OpenNext / Cloudflare Workers の
// 内部しきい値で配信されず 404 になる事象を /ja/popular と同じく回避するため、
// 動的レンダーに切替。今後の改善で rails のデータ量を絞ったら SSG に戻す。
export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
  searchParams,
}: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const root = `/${locale}`;

  // RecentRail (client) に渡す id → Product lookup
  const recentLookup: Record<string, (typeof products)[number]> = {};
  for (const p of products) recentLookup[p.id] = p;

  // 悩み chip フィルタ: ?concern=cold-winter 等で reel を絞る。
  const sp = (await searchParams) ?? {};
  const concernIdRaw = String(sp.concern ?? "").trim();
  const activeConcern: Concern | undefined =
    concernIdRaw === "" ? undefined : getConcern(concernIdRaw);
  const activeConcernId = activeConcern?.id;

  // 悩み chip 列のソース。popularity 上位 8 個。
  const concernChips = getPopularConcerns(8);

  // メルカリ風 reel の元データを構築。Amazon / 楽天 / 編集部 の商品をミックスして
  // popularity 順で 60 件まで切り出す。画像必須 (visual reel なので)。
  // activeConcernId 指定時は、Product 側 concerns に含まれるものだけ採用 (楽天は概念が無いので除外)。
  const feedItems = buildFeedItems(locale, activeConcernId).slice(0, 60);

  return (
    <div className="pb-12">
      <StructuredData
        items={[organizationSchema(locale), webSiteSchema(locale)]}
      />

      {/* Hero: 圧縮 + 悩み chip フィルタ。chip タップで reel が絞り込まれる。
          メイン CTA はやめて chip 列を action surface にする (mybest/メルカリ流)。 */}
      <section className="relative border-b border-border bg-gradient-to-b from-primary-soft/30 to-background">
        <div className="mx-auto max-w-5xl px-5 py-5 md:py-7">
          <div className="text-center">
            <p className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-fg md:text-[11px]">
              {dict.hero.eyebrow}
            </p>
            <h1 className="mt-2 text-xl font-extrabold leading-tight tracking-tight text-foreground md:text-3xl">
              {dict.hero.title}
            </h1>
          </div>
          <div
            className="mt-4 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1"
            style={{ scrollbarWidth: "none" }}
            role="tablist"
            aria-label={
              locale === "ja" ? "人気の悩みフィルタ" : "Popular concern filters"
            }
          >
            <ConcernChipLink
              href={root}
              active={!activeConcernId}
              label={locale === "ja" ? "すべて" : "All"}
            />
            {concernChips.map((c) => (
              <ConcernChipLink
                key={c.id}
                href={
                  activeConcernId === c.id ? root : `${root}?concern=${c.id}`
                }
                active={activeConcernId === c.id}
                label={locale === "ja" ? c.labelJa : c.labelEn}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Mercari 風 interleaved reel:
          商品 → カテゴリ → 商品 → 履歴 → 商品 → ガイド → 商品 の縦シーケンス。
          最初の chunk から商品を出すことで「ファーストビューに商品」 を満たす。 */}

      {/* chunk 1: 上位 12 件 (= mobile で 6 行、ファーストビューに 2-3 行入る)。
          activeConcern に応じて見出しを動的に切替え。 */}
      <ProductFeed
        items={feedItems.slice(0, 12)}
        locale={locale}
        showHeader
        titleJa={
          activeConcern
            ? `${activeConcern.labelJa} のおすすめ`
            : "今みんなが買ってる"
        }
        titleEn={
          activeConcern
            ? `Picks for ${activeConcern.labelEn}`
            : "Trending now"
        }
      />

      {/* intermission 1: カテゴリアイコン (1 タップでフィルタへ) */}
      <CategoryGrid locale={locale} />

      {/* chunk 2: 次の 12 件 (見出しなし、reel 続行) */}
      <ProductFeed
        items={feedItems.slice(12, 24)}
        locale={locale}
        showHeader={false}
      />

      {/* intermission 2: 最近見た商品 (履歴ゼロなら自動で非表示) */}
      <RecentRail locale={locale} lookup={recentLookup} />

      {/* chunk 3: 24 件 (深め) */}
      <ProductFeed
        items={feedItems.slice(24, 48)}
        locale={locale}
        showHeader={false}
      />

      {/* intermission 3: 選び方ガイド (コンテンツ surface) */}
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

      {/* chunk 4: tail (残り) */}
      <ProductFeed
        items={feedItems.slice(48)}
        locale={locale}
        showHeader={false}
      />

      {/* Brands list (フッター手前のサブ動線) */}
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

      {/* Bottom CTA (検索 question flow への secondary 動線) */}
      <section className="mx-auto mt-16 max-w-4xl px-5">
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
    </div>
  );
}

/**
 * メルカリ風 reel の元データ生成。
 *
 * source 別 (Amazon / 楽天 / 編集部) に各々 popularity 降順でソートし、
 * 「Amazon 1 件 → 楽天 1 件 → 編集部 1 件 → Amazon 2 件 → ...」 の
 * ラウンドロビンで合流させる。各 source の popularity スケールが異なる
 * (Amazon 50-80 / 楽天 80-99 / curated 50-95) ため単純 sort だと楽天が
 * 上位を独占するのを回避。
 *
 * concernFilter 指定時は、Product 側 concerns に含まれる物だけ通す。
 * 楽天 popular は concern メタが無いのでこの場合は除外。
 */
function buildFeedItems(
  locale: "ja" | "en",
  concernFilter?: string,
): FeedItem[] {
  const amazonGroup: { item: FeedItem; pop: number }[] = [];
  const curatedGroup: { item: FeedItem; pop: number }[] = [];
  const rakutenGroup: { item: FeedItem; pop: number }[] = [];

  for (const p of products) {
    if (!p.imageUrl) continue;
    if (concernFilter && !p.concerns.includes(concernFilter)) continue;
    const isAmazon = p.id.startsWith("amz-");
    const lowest = Math.min(...p.buyOptions.map((b) => b.priceJpy));
    const entry = {
      item: {
        key: p.id,
        source: isAmazon ? ("amazon" as const) : ("curated" as const),
        href: `/${locale}/products/${p.id}`,
        isExternal: false,
        imageUrl: p.imageUrl,
        brand: p.brand,
        name: locale === "ja" ? p.nameJa : p.nameEn,
        priceJpy: lowest,
      },
      pop: p.popularity,
    };
    (isAmazon ? amazonGroup : curatedGroup).push(entry);
  }

  // 楽天 popular は concern メタを持たないので、フィルタ ON 時はスキップ
  if (!concernFilter) {
    for (const p of topPopular(40)) {
      if (!p.imageUrl) continue;
      rakutenGroup.push({
        item: {
          key: `rkt-${p.id}`,
          source: "rakuten",
          href: p.affiliateUrl,
          isExternal: true,
          imageUrl: p.imageUrl,
          brand: p.shopName,
          name: p.nameJa,
          priceJpy: p.priceJpy,
        },
        // bestRank: 1 (最良) ≈ 99、20位 ≈ 80。100 - bestRank で popularity 0-100 化
        pop: Math.max(0, 100 - p.bestRank),
      });
    }
  }

  amazonGroup.sort((a, b) => b.pop - a.pop);
  curatedGroup.sort((a, b) => b.pop - a.pop);
  rakutenGroup.sort((a, b) => b.pop - a.pop);

  // ラウンドロビン: Amazon → 楽天 → 編集 の順で 1 つずつ取る。空グループはスキップ。
  const out: FeedItem[] = [];
  const groups = [amazonGroup, rakutenGroup, curatedGroup];
  let i = 0;
  while (groups.some((g) => g[i])) {
    for (const g of groups) {
      if (g[i]) out.push(g[i].item);
    }
    i++;
  }
  return out;
}

/** Hero 内の悩みフィルタ chip。アクティブ時は primary 塗り、非アクティブは枠線。 */
function ConcernChipLink({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={active}
      className={`inline-flex shrink-0 items-center rounded-full px-4 py-2 text-xs font-bold transition-colors md:text-sm ${
        active
          ? "bg-primary text-primary-fg shadow-md"
          : "border border-border bg-card text-muted-fg hover:border-primary hover:text-primary"
      }`}
    >
      {label}
    </Link>
  );
}
