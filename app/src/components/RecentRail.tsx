"use client";

import { useSyncExternalStore } from "react";
import type { Locale } from "@/app/[locale]/dictionaries";
import type { Product } from "@/lib/products";
import {
  getRecentSnapshot,
  getServerRecentSnapshot,
  subscribeRecent,
} from "@/lib/recently-viewed";
import { MiniProductCard } from "./MiniProductCard";
import { Rail, RailItem } from "./Rail";

type Props = {
  locale: Locale;
  /**
   * id → Product の lookup。homepage server component で
   * visibleProducts から組み立てて渡す。空配列の id は無視されるので
   * カタログから消えた商品履歴は自動的にスキップされる。
   */
  lookup: Record<string, Product>;
  titleJa?: string;
  titleEn?: string;
};

/**
 * 「最近見た商品」 rail。localStorage の履歴を useSyncExternalStore で読み、
 * lookup から Product を引いて MiniProductCard でレンダー。
 *
 * 履歴ゼロ件 (新規ユーザ / clear 直後) では何も描画しない (silent no-op)。
 */
export function RecentRail({ locale, lookup, titleJa, titleEn }: Props) {
  const ids = useSyncExternalStore(
    subscribeRecent,
    getRecentSnapshot,
    getServerRecentSnapshot,
  );
  const products = ids
    .map((id) => lookup[id])
    .filter((p): p is Product => Boolean(p));
  if (products.length === 0) return null;

  return (
    <Rail
      title={locale === "ja" ? (titleJa ?? "最近見た商品") : (titleEn ?? "Recently viewed")}
      subtitle={
        locale === "ja"
          ? "あなたが最近開いた商品ページ"
          : "Pages you recently opened"
      }
    >
      {products.map((p) => (
        <RailItem key={`recent-${p.id}`}>
          <MiniProductCard
            product={p}
            locale={locale}
            href={`/${locale}/products/${p.id}`}
          />
        </RailItem>
      ))}
    </Rail>
  );
}
