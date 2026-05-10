"use client";

import { useEffect } from "react";
import { pushRecent } from "@/lib/recently-viewed";

/**
 * 商品詳細ページに mount するだけで「最近見た商品」 履歴に id を unshift する
 * トラッカ。視覚要素は出さない (return null)。
 *
 * useEffect で 1 度だけ走る。SPA 内遷移でも productId が変われば再実行される。
 */
export function RecentTracker({ productId }: { productId: string }) {
  useEffect(() => {
    pushRecent(productId);
  }, [productId]);
  return null;
}
