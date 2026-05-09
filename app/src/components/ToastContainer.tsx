"use client";

import { useEffect, useState } from "react";
import { TOAST_EVENT, type ToastDetail } from "@/lib/toast";

type Item = ToastDetail & { id: number };

/**
 * 画面右下 (デスクトップ) / 中央下 (モバイル) に積まれる toast 集合体。
 *
 * - showToast() からの window CustomEvent を listen
 * - 各 toast は duration ms (default 2200) で自動消滅
 * - 同時表示は最大 3 件、超過時は古いものから push out
 * - クリックで早期 dismiss
 */
export function ToastContainer() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<ToastDetail>).detail;
      if (!detail) return;
      const id = Date.now() + Math.random();
      const duration = detail.duration ?? 2200;
      setItems((prev) => {
        const next = [...prev, { ...detail, id }];
        return next.slice(-3); // 最大 3 件
      });
      if (duration > 0) {
        window.setTimeout(() => {
          setItems((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end"
    >
      {items.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() =>
            setItems((prev) => prev.filter((x) => x.id !== t.id))
          }
          className={`pointer-events-auto inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold shadow-lg backdrop-blur-md transition-all ${
            t.type === "warning"
              ? "bg-amber-500 text-white"
              : t.type === "success"
                ? "bg-emerald-500 text-white"
                : "bg-foreground text-background"
          }`}
        >
          <span aria-hidden>
            {t.type === "warning" ? "⚠" : t.type === "success" ? "✓" : "ℹ"}
          </span>
          <span>{t.message}</span>
        </button>
      ))}
    </div>
  );
}
