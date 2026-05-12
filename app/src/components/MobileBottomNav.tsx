"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dictionary, Locale } from "@/app/[locale]/dictionaries";
import { guides } from "@/lib/guides";

type Props = {
  locale: Locale;
  dict: Dictionary;
};

/**
 * モバイル/タブレット 下部固定 4 タブナビ。スニダン / メルカリ / ZOZO 流の
 * 「コマース反射神経」 を持たせるため、検索・うちの子・ガイドへの 1 タップ動線を
 * 全ページで提供する。
 *
 * - md+ では非表示 (Header の nav が代替)
 * - z-30 で本文より上、StickyMobileCta (z-40) より下
 * - safe-area-inset-bottom 対応で iPhone notch/indicator を回避
 *
 * NOTE: 旧「比較」タブは UX 低品質のため撤去。/compare ページ自体は
 * ブックマーク互換のため残しているが nav 動線は無い。
 */
export function MobileBottomNav({ locale, dict }: Props) {
  const pathname = usePathname();
  const root = `/${locale}`;
  const guidesHref = `${root}/guides/${guides[0]?.slug ?? "harness-buying-guide"}`;

  const tabs: {
    href: string;
    label: string;
    icon: React.ReactNode;
    match: (p: string) => boolean;
  }[] = [
    {
      href: root,
      label: dict.bottom_nav.home,
      icon: <HomeIcon />,
      match: (p) => p === root || p === `${root}/`,
    },
    {
      href: `${root}/find`,
      label: dict.bottom_nav.search,
      icon: <SearchIcon />,
      match: (p) =>
        p.startsWith(`${root}/find`) ||
        p.startsWith(`${root}/search`) ||
        p.startsWith(`${root}/results`),
    },
    {
      href: `${root}/my-dog`,
      label: dict.bottom_nav.my_dog,
      icon: <PawIcon />,
      match: (p) =>
        p.startsWith(`${root}/my-dog`) || p.startsWith(`${root}/breeds`),
    },
    {
      href: guidesHref,
      label: dict.bottom_nav.guides,
      icon: <BookIcon />,
      match: (p) => p.startsWith(`${root}/guides`),
    },
  ];

  return (
    <nav
      aria-label={dict.bottom_nav.aria_label}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-4">
        {tabs.map((t) => {
          const active = t.match(pathname);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 px-2 py-2 transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-fg hover:text-foreground"
                }`}
              >
                <span aria-hidden>{t.icon}</span>
                <span className="text-[10px] font-bold leading-none">
                  {t.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M3 11l9-8 9 8M5 10v10h14V10" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}
function PawIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden
    >
      <ellipse cx="6" cy="9" rx="1.6" ry="2.2" />
      <ellipse cx="10" cy="6" rx="1.6" ry="2.2" />
      <ellipse cx="14" cy="6" rx="1.6" ry="2.2" />
      <ellipse cx="18" cy="9" rx="1.6" ry="2.2" />
      <path d="M12 11c-3 0-5 2.5-5 5 0 2 1.5 3 3 3 .8 0 1.3-.3 2-.3s1.2.3 2 .3c1.5 0 3-1 3-3 0-2.5-2-5-5-5z" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M4 4h7a3 3 0 013 3v13a2 2 0 00-2-2H4zM20 4h-7a3 3 0 00-3 3v13a2 2 0 012-2h8z" />
    </svg>
  );
}
