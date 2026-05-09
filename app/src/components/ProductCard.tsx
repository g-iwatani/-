import Link from "next/link";
import type { Dictionary, Locale } from "@/app/[locale]/dictionaries";
import { AFFILIATE_REL } from "@/lib/affiliate";
import { format, formatPrice } from "@/lib/format";
import type { ProductMatch } from "@/lib/matching";
import type { Product } from "@/lib/products";
import { ProductImage } from "./ProductImage";

type Props = {
  match: ProductMatch;
  locale: Locale;
  dict: Dictionary;
  href: string;
  /**
   * 一覧の最上位 (= 「迷ったらコレ」枠) かどうか。指定された場合、
   * カード画像の上に目立つ chip を出して決断疲れを軽減する。mybest 風。
   */
  isTopPick?: boolean;
};

export function ProductCard({
  match,
  locale,
  dict,
  href,
  isTopPick,
}: Props) {
  const { product } = match;
  const name = locale === "ja" ? product.nameJa : product.nameEn;
  const tags = locale === "ja" ? product.tagsJa : product.tagsEn;

  const lowest = Math.min(...product.buyOptions.map((b) => b.priceJpy));
  const highest = Math.max(...product.buyOptions.map((b) => b.priceJpy));
  const priceLabel =
    lowest === highest
      ? formatPrice(lowest, locale)
      : `${formatPrice(lowest, locale)}〜`;

  const fitScore = match.bestSize?.fitScore;
  const concernHits = match.concernHits.length;
  const totalConcerns = match.product.concerns.length;

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-3xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        isTopPick
          ? "border-primary shadow-md ring-1 ring-primary/30"
          : "border-card-border"
      }`}
    >
      <Link href={href} className="relative block">
        {isTopPick && (
          <span className="absolute left-3 top-3 z-10 inline-flex items-center rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-background shadow-md">
            ★ {dict.badge.top_pick}
          </span>
        )}
        <ProductImage
          palette={product.imagePalette}
          emoji={product.imageEmoji}
          imageUrl={product.imageUrl}
          alt={name}
          size="md"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-fg">
            {product.brand}
          </span>
          {fitScore != null && fitScore >= 70 && (
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[10px] font-bold text-accent">
              {format(dict.product_card.fit_score, { score: fitScore })}
            </span>
          )}
          {concernHits > 0 && (
            <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[10px] font-bold text-primary">
              {format(dict.product_card.concern_match, {
                count: concernHits,
                total: Math.max(totalConcerns, 1),
              })}
            </span>
          )}
        </div>

        <Link href={href} className="group">
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground group-hover:text-primary">
            {name}
          </h3>
        </Link>

        <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-fg">
          {tags.slice(0, 3).map((t) => (
            <span key={t} className="rounded-full bg-background px-2 py-0.5">
              #{t}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-fg">
              {locale === "ja" ? "最安値" : "From"}
            </p>
            <p className="text-lg font-bold text-foreground">{priceLabel}</p>
          </div>
          <Link
            href={href}
            className="inline-flex items-center rounded-full bg-foreground px-3.5 py-2 text-xs font-semibold text-background transition-opacity hover:opacity-90"
          >
            {dict.product_card.view_detail}
          </Link>
        </div>

        <BuyOptionsRow
          product={product}
          dict={dict}
          resolvedUrls={match.resolvedBuyUrls}
        />
      </div>
    </article>
  );
}

function BuyOptionsRow({
  product,
  dict,
  resolvedUrls,
}: {
  product: Product;
  dict: Dictionary;
  resolvedUrls: string[];
}) {
  return (
    <div className="flex flex-wrap gap-2 border-t border-border pt-3">
      {product.buyOptions.map((opt, i) => (
        <a
          key={`${opt.shop}-${i}`}
          href={resolvedUrls[i] ?? "#"}
          target="_blank"
          rel={AFFILIATE_REL}
          className="inline-flex flex-1 items-center justify-center rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-semibold text-muted-fg transition-colors hover:border-primary hover:text-primary"
        >
          <span aria-label="ad" className="mr-1 text-[9px] opacity-70">PR</span>
          {format(dict.product_card.buy_at, { shop: opt.shop })}
        </a>
      ))}
    </div>
  );
}
