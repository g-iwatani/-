"use client";

import { useSyncExternalStore } from "react";
import type { Dictionary } from "@/app/[locale]/dictionaries";
import {
  COMPARE_MAX,
  dispatchCompareChange,
  getCompareSnapshot,
  getServerCompareSnapshot,
  readCompareIds,
  subscribeCompare,
  writeCompareIds,
} from "@/lib/compare";
import { showToast } from "@/lib/toast";

type Props = {
  productId: string;
  dict: Dictionary;
};

/**
 * 商品カードの右上に出る「比較に追加」 トグル。
 *
 * - 状態は localStorage に永続化、ページ遷移しても比較リストが残る
 * - 4 件選択済みでチェックされていない時は disabled 表示
 * - 選択切替時に COMPARE_EVENT を dispatch、同じウィンドウ内の
 *   他コンポーネント (sticky bar、他カード) は useSyncExternalStore で同期
 * - SSR は空配列 snapshot を返し、hydration 後に localStorage 値で再描画
 */
export function CompareToggle({ productId, dict }: Props) {
  const ids = useSyncExternalStore(
    subscribeCompare,
    getCompareSnapshot,
    getServerCompareSnapshot,
  );
  const checked = ids.includes(productId);
  const full = !checked && ids.length >= COMPARE_MAX;

  function toggle(e: React.MouseEvent | React.KeyboardEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (full) {
      showToast({ message: dict.compare_toggle.toast_full, type: "warning" });
      return;
    }
    const current = readCompareIds();
    const adding = !current.includes(productId);
    const next = adding
      ? [...current, productId]
      : current.filter((id) => id !== productId);
    writeCompareIds(next);
    dispatchCompareChange();
    showToast({
      message: adding
        ? dict.compare_toggle.toast_added
        : dict.compare_toggle.toast_removed,
      type: adding ? "success" : "info",
    });
  }

  const label = full
    ? dict.compare_toggle.full
    : checked
      ? dict.compare_toggle.in_compare
      : dict.compare_toggle.add;

  return (
    <button
      type="button"
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") toggle(e);
      }}
      aria-pressed={checked}
      aria-label={label}
      title={label}
      disabled={full}
      className={`absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full ring-1 transition-all ${
        checked
          ? "bg-primary text-background ring-primary shadow-md"
          : full
            ? "cursor-not-allowed bg-muted/80 text-muted-fg ring-border"
            : "bg-card/95 text-muted-fg ring-card-border hover:bg-primary hover:text-background hover:ring-primary"
      }`}
    >
      {checked ? <CheckIcon /> : <PlusIcon />}
    </button>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M3 8l3.5 3.5L13 5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

