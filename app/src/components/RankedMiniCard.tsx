import Link from "next/link";
import type { Locale } from "@/app/[locale]/dictionaries";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/products";
import { ProductImage } from "./ProductImage";

type Props = {
  product: Product;
  rank: number;
  locale: Locale;
  href: string;
};

/**
 * ランキング rail 用のミニカード。MiniProductCard の派生で、左上に大きい順位
 * バッジを乗せる。1-3 位はゴールド/シルバー/ブロンズ調、4 位以下はダーク。
 *
 * Snidan/メルカリ流の「リアルな売れ筋順」 を一目で示すため、順位の視覚優先度を
 * 高めに置いている。
 */
export function RankedMiniCard({ product, rank, locale, href }: Props) {
  const name = locale === "ja" ? product.nameJa : product.nameEn;
  const lowest = Math.min(...product.buyOptions.map((b) => b.priceJpy));
  const priceLabel = formatPrice(lowest, locale);

  const rankClass =
    rank === 1
      ? "bg-amber-400 text-amber-950"
      : rank === 2
        ? "bg-zinc-300 text-zinc-900"
        : rank === 3
          ? "bg-orange-400 text-orange-950"
          : "bg-foreground text-background";

  return (
    <Link
      href={href}
      className="group relative block w-[180px] overflow-hidden rounded-2xl border border-card-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md md:w-[220px]"
    >
      <div className="relative">
        <span
          className={`absolute left-2 top-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full text-base font-black shadow-md ${rankClass}`}
          aria-label={`${rank}位`}
        >
          {rank}
        </span>
        <ProductImage
          palette={product.imagePalette}
          emoji={product.imageEmoji}
          imageUrl={product.imageUrl}
          alt={name}
          size="sm"
        />
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-fg">
          {product.brand}
        </p>
        <p className="mt-0.5 line-clamp-2 text-sm font-bold leading-snug text-foreground group-hover:text-primary">
          {name}
        </p>
        <p className="mt-2 text-base font-extrabold text-primary">
          {priceLabel}〜
        </p>
      </div>
    </Link>
  );
}
