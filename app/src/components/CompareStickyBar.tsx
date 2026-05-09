"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import type { Dictionary, Locale } from "@/app/[locale]/dictionaries";
import {
  clearCompareIds,
  dispatchCompareChange,
  getCompareSnapshot,
  getServerCompareSnapshot,
  subscribeCompare,
} from "@/lib/compare";
import { format } from "@/lib/format";

type Props = {
  locale: Locale;
  dict: Dictionary;
};

/**
 * 画面下部 sticky compare bar。商品カードのチェックを入れた瞬間に画面下から
 * スライドアップし、「比較中: N 商品 [比較する]」 を表示する。mybest 流。
 *
 * - 0 件のときは render しない (レイアウト邪魔しない)
 * - 同じ window 内の CompareToggle の変更を COMPARE_EVENT 経由で受信
 * - 「比較する」 で /compare?ids=A,B,C へ
 * - 「クリア」 でリスト全消し
 */
export function CompareStickyBar({ locale, dict }: Props) {
  const ids = useSyncExternalStore(
    subscribeCompare,
    getCompareSnapshot,
    getServerCompareSnapshot,
  );
  if (ids.length === 0) return null;

  const handleClear = () => {
    clearCompareIds();
    dispatchCompareChange();
  };

  return (
    <div
      role="region"
      aria-label={dict.compare_bar.aria_label}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 pt-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur-md"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-fg">
            {dict.compare_bar.label}
          </p>
          <p className="text-base font-extrabold text-foreground">
            {format(dict.compare_bar.count, { n: ids.length })}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-full px-3 py-2 text-xs font-semibold text-muted-fg hover:text-foreground"
        >
          {dict.compare_bar.clear}
        </button>
        <Link
          href={`/${locale}/compare?ids=${ids.join(",")}`}
          className={`inline-flex shrink-0 items-center justify-center rounded-full px-5 py-3 text-sm font-bold transition-opacity ${
            ids.length >= 2
              ? "bg-primary text-background hover:opacity-90"
              : "cursor-not-allowed bg-muted text-muted-fg"
          }`}
          aria-disabled={ids.length < 2}
          onClick={(e) => {
            // 1 商品しか入ってない時は遷移してもまともに比較できないので無効化
            if (ids.length < 2) e.preventDefault();
          }}
        >
          {ids.length < 2
            ? dict.compare_bar.cta_disabled
            : dict.compare_bar.cta}
        </Link>
      </div>
    </div>
  );
}
