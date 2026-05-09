import Link from "next/link";
import type { Dictionary, Locale } from "@/app/[locale]/dictionaries";
import { AFFILIATE_REL } from "@/lib/affiliate";
import { format, formatPrice } from "@/lib/format";
import { type Product, resolveBuyUrl } from "@/lib/products";
import { ProductImage } from "./ProductImage";

type Props = {
  product: Product;
  reason: string;
  monthLabel: string;
  locale: Locale;
  dict: Dictionary;
};

/**
 * トップページ Hero 直下の「今月の編集部 1 押し」 ヒーローカード。
 * 通常の ProductCard より大きく、横長レイアウト (デスクトップは画像/テキスト
 * 2 カラム、モバイルは縦積み)。情報密度より 「これがイチ押し」 と一目で
 * 分かるインパクトを優先。
 */
export function FeaturedProduct({
  product,
  reason,
  monthLabel,
  locale,
  dict,
}: Props) {
  const name = locale === "ja" ? product.nameJa : product.nameEn;
  const lowest = Math.min(...product.buyOptions.map((b) => b.priceJpy));

  // 主要 CTA: Amazon 優先。無ければ最初の有効 buyOption。
  const amazonIdx = product.buyOptions.findIndex((b) =>
    b.target?.network.startsWith("amazon-"),
  );
  const ctaIdx = amazonIdx >= 0 ? amazonIdx : 0;
  const cta = product.buyOptions[ctaIdx];
  const ctaUrl = cta ? resolveBuyUrl(cta) : "#";
  const detailHref = `/${locale}/products/${product.id}`;

  return (
    <section className="mt-10 md:mt-14">
      <div className="mx-auto max-w-7xl px-5">
        <div className="overflow-hidden rounded-3xl border-2 border-primary bg-card shadow-lg shadow-primary/10">
          <div className="grid gap-0 md:grid-cols-[1.2fr_1fr]">
            <Link href={detailHref} className="block">
              <ProductImage
                palette={product.imagePalette}
                emoji={product.imageEmoji}
                imageUrl={product.imageUrl}
                alt={name}
                size="lg"
                className="rounded-none"
              />
            </Link>
            <div className="flex flex-col gap-4 p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-background">
                  ★ {dict.featured.eyebrow}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-fg">
                  {monthLabel}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-fg">
                  {product.brand}
                </p>
                <Link href={detailHref}>
                  <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground hover:text-primary md:text-3xl">
                    {name}
                  </h2>
                </Link>
              </div>
              <p className="text-sm leading-relaxed text-foreground md:text-base">
                {reason}
              </p>
              <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-fg">
                    {dict.featured.lowest_price_label}
                  </p>
                  <p className="text-2xl font-extrabold text-primary">
                    {formatPrice(lowest, locale)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={detailHref}
                    className="inline-flex items-center justify-center rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:border-primary hover:text-primary"
                  >
                    {dict.product_card.view_detail}
                  </Link>
                  {cta && ctaUrl !== "#" && (
                    <a
                      href={ctaUrl}
                      target="_blank"
                      rel={AFFILIATE_REL}
                      className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-bold text-background hover:opacity-90"
                    >
                      <span aria-label="ad" className="mr-1 text-[10px] opacity-80">
                        PR
                      </span>
                      {format(dict.product_card.buy_at, { shop: cta.shop })}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
