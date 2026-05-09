"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/app/[locale]/dictionaries";
import {
  COMPARE_EVENT,
  COMPARE_MAX,
  dispatchCompareChange,
  readCompareIds,
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
 * - 選択切替時に COMPARE_EVENT を dispatch して、同じウィンドウ内の
 *   sticky compare bar や他カードの状態が即時更新される
 * - SSR 時は空の placeholder を返してハイドレーション差分を回避
 */
export function CompareToggle({ productId, dict }: Props) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const initial = readCompareIds();
    setIds(initial);
    setHydrated(true);
    const onChange = () => setIds(readCompareIds());
    window.addEventListener(COMPARE_EVENT, onChange);
    return () => window.removeEventListener(COMPARE_EVENT, onChange);
  }, []);

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
    setIds(next);
    dispatchCompareChange();
    showToast({
      message: adding
        ? dict.compare_toggle.toast_added
        : dict.compare_toggle.toast_removed,
      type: adding ? "success" : "info",
    });
  }

  // SSR/hydration 安定化のため、初回はチェックボックスのスケルトンだけ。
  if (!hydrated) {
    return (
      <div
        aria-hidden
        className="absolute right-3 top-3 z-20 h-8 w-8 rounded-full bg-card/80 ring-1 ring-card-border"
      />
    );
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

