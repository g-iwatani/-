import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryGrid } from "@/components/CategoryGrid";
import { GuideCard } from "@/components/GuideCard";
import { PopularRankingRail } from "@/components/PopularRankingRail";
import { ProductFeed } from "@/components/ProductFeed";
import { Rail, RailItem } from "@/components/Rail";
import { RecentRail } from "@/components/RecentRail";
import { chipLabel, getPopularConcerns } from "@/lib/concerns";
import { buildFeedItems } from "@/lib/feed";
import { guides } from "@/lib/guides";
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
}: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const root = `/${locale}`;

  // RecentRail (client) に渡す id → Product lookup
  const recentLookup: Record<string, (typeof products)[number]> = {};
  for (const p of products) recentLookup[p.id] = p;

  // 悩み chip 列のソース。popularity 上位 8 個。
  // chip タップで `/concerns/[id]` 静的 LP に遷移する。以前は ?concern= で
  // 同一ページの reel を絞り込む UX だったが、Google が param URL を
  // canonical 集約しないため SEO 的に不利だった。専用 LP に navigate する
  // 形に統一して各悩みを個別の SEO 着地点に育てる。
  const concernChips = getPopularConcerns(8);

  // メルカリ風 reel の元データを構築。Amazon / 楽天 / 編集部 の商品をミックス
  // して popularity 順で 120 件まで切り出す。TOP は常に「全悩み混合」 の
  // 概観なので concern filter は適用しない。各悩みの絞り込みは
  // /concerns/[id] 側で実施。
  // 120 件は SSR HTML +30KB 程度。LCP 影響は <Image priority> されてる
  // hero 領域のみで、reel の下層は loading="lazy" なので問題なし。
  const feedItems = buildFeedItems(locale).slice(0, 120);

  return (
    <div className="pb-12">
      <StructuredData
        items={[organizationSchema(locale), webSiteSchema(locale)]}
      />

      {/* Hero: 圧縮 + 悩み chip フィルタ。chip タップで reel が絞り込まれる。
          メイン CTA はやめて chip 列を action surface にする (mybest/メルカリ流)。 */}
      {/* Hero: 左寄せエディトリアル風。kicker line + 巨大 JA + 圧縮 chip 列。 */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-5 py-10 md:py-16">
          <span className="t-eyebrow-line">{dict.hero.eyebrow}</span>
          <h1 className="mt-5 max-w-3xl whitespace-pre-line text-balance text-3xl font-extrabold leading-[1.15] tracking-[-0.025em] text-foreground md:text-5xl">
            {dict.hero.title}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-fg md:text-base">
            {dict.hero.tagline}
          </p>
          {/* chip 列。TOP は active 状態を持たない (絞り込み無し)。各 chip は
              /concerns/[id] 静的 LP に navigate する。SEO 上の理由は
              concernChips 算出箇所のコメントを参照。 */}
          <div
            className="mt-7 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1"
            style={{ scrollbarWidth: "none" }}
            role="group"
            aria-label={
              locale === "ja" ? "人気の悩みから探す" : "Browse by popular concerns"
            }
          >
            {concernChips.map((c) => (
              <ConcernChipLink
                key={c.id}
                href={`${root}/concerns/${c.id}`}
                label={chipLabel(c, locale)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 売れ筋ランキング rail — chunk 1 (商品 reel) より先に「今売れているもの」を提示。 */}
      <PopularRankingRail locale={locale} />

      {/* Mercari 風 interleaved reel:
          商品 → カテゴリ → 商品 → 履歴 → 商品 → ガイド → 商品 の縦シーケンス。
          最初の chunk から商品を出すことで「ファーストビューに商品」 を満たす。 */}

      {/* chunk 1: 上位 12 件 (= mobile で 6 行、ファーストビューに 2-3 行入る)。
          activeConcern に応じて見出しを動的に切替え。 */}
      <ProductFeed
        items={feedItems.slice(0, 12)}
        locale={locale}
        showHeader
        titleJa="今みんなが買ってる"
        titleEn="Trending now"
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
        kicker="EDITORIAL · GUIDES"
        title={locale === "ja" ? "選び方ガイド" : "Buying guides"}
        titleEn={locale === "ja" ? "Editor-written buying guides" : undefined}
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
        kicker={locale === "ja" ? "BRANDS · 横断比較" : "BRANDS · CROSS-COMPARE"}
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
            href={`${root}/my-dog`}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-background px-6 py-3 text-sm font-bold text-foreground transition-transform hover:-translate-y-0.5"
          >
            {dict.hero.cta_primary} →
          </Link>
        </div>
      </section>
    </div>
  );
}

/** Hero 内の悩み chip。各 chip は /concerns/[id] の static LP に navigate する。 */
function ConcernChipLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-muted-fg transition-colors hover:border-primary hover:text-primary md:text-sm"
    >
      {label}
    </Link>
  );
}
