import Link from "next/link";
import type { Dictionary, Locale } from "@/app/[locale]/dictionaries";
import { AFFILIATE_REL } from "@/lib/affiliate";
import { format, formatPrice } from "@/lib/format";
import type { ProductMatch } from "@/lib/matching";
import { ProductImage } from "./ProductImage";

type Props = {
  matches: ProductMatch[];
  locale: Locale;
  dict: Dictionary;
};

/**
 * mybest 風の上位商品比較テーブル。検索結果ページの最上部に置いて、
 * 「決め切れないユーザに横並びでサッと比べさせる」ことで CVR を上げる狙い。
 *
 * モバイルは横スクロール (snap)、デスクトップは画面幅にフィットして並ぶ。
 * 各列の縦の並びを揃えてあるので、行 = スペックとして横方向に視線が走る。
 */
export function ComparisonTable({ matches, locale, dict }: Props) {
  if (matches.length < 3) return null;
  const top = matches.slice(0, 5);

  return (
    <section className="mt-2 rounded-3xl border border-card-border bg-card p-4 sm:p-6">
      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground sm:text-xl">
            {dict.comparison.title}
          </h2>
          <p className="mt-0.5 text-xs text-muted-fg">
            {format(dict.comparison.subtitle, { count: top.length })}
          </p>
        </div>
      </header>

      <div className="-mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
        <div
          className="grid auto-cols-[14rem] grid-flow-col gap-3 pb-2 sm:auto-cols-fr sm:gap-4"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {top.map((match, i) => (
            <ComparisonColumn
              key={match.product.id}
              match={match}
              rank={i + 1}
              locale={locale}
              dict={dict}
              href={`/${locale}/products/${match.product.id}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ComparisonColumn({
  match,
  rank,
  locale,
  dict,
  href,
}: {
  match: ProductMatch;
  rank: number;
  locale: Locale;
  dict: Dictionary;
  href: string;
}) {
  const { product, resolvedBuyUrls } = match;
  const name = locale === "ja" ? product.nameJa : product.nameEn;
  const tags = locale === "ja" ? product.tagsJa : product.tagsEn;
  const lowest = Math.min(...product.buyOptions.map((b) => b.priceJpy));
  const fitScore = match.bestSize?.fitScore;
  const concernHits = match.concernHits.length;

  // CTA は最も収益性の高い Amazon があれば優先、無ければ最初の有効ボタン
  const amazonIdx = product.buyOptions.findIndex(
    (b) => b.target?.network.startsWith("amazon-"),
  );
  const ctaIdx = amazonIdx >= 0 ? amazonIdx : 0;
  const cta = product.buyOptions[ctaIdx];
  const ctaUrl = resolvedBuyUrls[ctaIdx];

  return (
    <article
      className={`flex flex-col rounded-2xl border bg-background p-3 ${
        rank === 1
          ? "border-primary shadow-sm ring-1 ring-primary/30"
          : "border-border"
      }`}
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="relative">
        <span
          className={`absolute left-0 top-0 z-10 inline-flex items-center justify-center rounded-br-xl rounded-tl-xl px-2.5 py-1 text-[11px] font-bold ${
            rank === 1
              ? "bg-primary text-background"
              : rank === 2
                ? "bg-foreground text-background"
                : "bg-muted text-foreground"
          }`}
        >
          {format(dict.comparison.rank, { n: rank })}
        </span>
        {rank === 1 && (
          <span className="absolute right-0 top-0 z-10 inline-flex items-center rounded-bl-xl rounded-tr-xl bg-primary/90 px-2 py-0.5 text-[10px] font-bold text-background">
            ★ {dict.badge.top_pick}
          </span>
        )}
        <Link href={href}>
          <ProductImage
            palette={product.imagePalette}
            emoji={product.imageEmoji}
            imageUrl={product.imageUrl}
            alt={name}
            size="sm"
          />
        </Link>
      </div>

      <div className="mt-3 space-y-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-fg">
            {product.brand}
          </p>
          <Link href={href} className="block">
            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground hover:text-primary">
              {name}
            </h3>
          </Link>
        </div>

        <SpecRow
          label={dict.comparison.spec_price}
          value={
            <span className="text-base font-bold text-foreground">
              {formatPrice(lowest, locale)}
            </span>
          }
        />

        {fitScore != null && (
          <SpecRow
            label={dict.comparison.spec_fit}
            value={
              <span
                className={`text-sm font-bold ${
                  fitScore >= 70 ? "text-accent" : "text-muted-fg"
                }`}
              >
                {fitScore}%
              </span>
            }
          />
        )}

        {concernHits > 0 && (
          <SpecRow
            label={dict.comparison.spec_concerns}
            value={
              <span className="text-sm font-bold text-primary">
                {format(dict.comparison.concern_value, { count: concernHits })}
              </span>
            }
          />
        )}

        {tags.length > 0 && (
          <SpecRow
            label={dict.comparison.spec_tags}
            value={
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 2).map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-fg"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            }
          />
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Link
          href={href}
          className="inline-flex items-center justify-center rounded-full bg-foreground px-3 py-2 text-xs font-semibold text-background transition-opacity hover:opacity-90"
        >
          {dict.product_card.view_detail}
        </Link>
        {cta && ctaUrl && ctaUrl !== "#" && (
          <a
            href={ctaUrl}
            target="_blank"
            rel={AFFILIATE_REL}
            className="inline-flex items-center justify-center rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-fg transition-colors hover:border-primary hover:text-primary"
          >
            <span
              aria-label="ad"
              className="mr-1.5 rounded bg-foreground/85 px-1 py-px text-[9px] font-bold text-background"
            >
              PR
            </span>
            {format(dict.product_card.buy_at, { shop: cta.shop })}
          </a>
        )}
      </div>
    </article>
  );
}

function SpecRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="border-t border-border pt-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-fg">
        {label}
      </p>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}
