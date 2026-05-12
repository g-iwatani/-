"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Dictionary } from "@/app/[locale]/dictionaries";

type Props = {
  navItems: { href: string; label: string }[];
  ctaHref: string;
  ctaLabel: string;
  dict: Dictionary;
};

/**
 * モバイル専用ハンバーガーメニュー → 右からスライドするドロワー。
 *
 * Header は server component なので、ここを切り出して "use client" にする。
 * - Body scroll lock (open 時に背景スクロール禁止)
 * - Esc キーで閉じる
 * - Backdrop クリックで閉じる
 * - リンククリックで閉じる (Next.js Link の onClick で先回りに setOpen(false))
 *
 * a11y は最低限: aria-expanded / aria-label / dialog role。focus trap は
 * シンプルさを優先して未実装 (将来必要時に @radix-ui/react-dialog 等で置換)。
 */
export function MobileMenu({ navItems, ctaHref, ctaLabel, dict }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-label={dict.mobile_menu.open}
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-muted md:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="h-5 w-5"
          aria-hidden
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={dict.mobile_menu.aria_label}
          className="fixed inset-0 z-50 md:hidden"
        >
          {/* backdrop */}
          <button
            type="button"
            aria-label={dict.mobile_menu.close}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          {/* panel */}
          <div
            className="absolute right-0 top-0 flex h-full w-[min(20rem,80vw)] flex-col bg-card shadow-2xl"
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <span className="text-base font-extrabold tracking-tight text-foreground">
                {dict.brand.name}
              </span>
              <button
                type="button"
                aria-label={dict.mobile_menu.close}
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-fg hover:bg-muted"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="h-5 w-5"
                  aria-hidden
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <form
              method="GET"
              // ctaHref は /my-dog (うちの子) 等を指すが、検索フォームは常に /find に飛ばす。
              // /my-dog の locale prefix だけ流用するため、末尾を /find に差し替える。
              action={ctaHref.replace(/\/[^/]+$/, "/find")}
              role="search"
              aria-label={dict.find.header_aria}
              className="mx-3 mt-3 flex items-center rounded-full border border-border bg-background px-3 py-2 focus-within:border-primary"
              onSubmit={() => setOpen(false)}
            >
              <span aria-hidden className="mr-2 text-muted-fg">
                🔍
              </span>
              <input
                type="search"
                name="q"
                placeholder={dict.find.placeholder}
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-fg focus:outline-none"
                autoComplete="off"
              />
            </form>

            <nav className="flex-1 overflow-y-auto px-2 py-4">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-4 py-3 text-base font-semibold text-foreground hover:bg-muted"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div
              className="border-t border-border bg-card px-5 py-4"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
            >
              <Link
                href={ctaHref}
                onClick={() => setOpen(false)}
                className="block w-full rounded-full bg-primary px-5 py-3 text-center text-sm font-bold text-primary-fg shadow-md hover:opacity-90"
              >
                {ctaLabel}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
