"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dictionary, Locale } from "@/app/[locale]/dictionaries";
import { guides } from "@/lib/guides";
import { BrandIcon } from "./BrandIcon";

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
      icon: <BrandIcon name="home" size={20} />,
      match: (p) => p === root || p === `${root}/`,
    },
    {
      href: `${root}/find`,
      label: dict.bottom_nav.search,
      icon: <BrandIcon name="search" size={20} />,
      match: (p) => p.startsWith(`${root}/find`),
    },
    {
      href: `${root}/my-dog`,
      label: dict.bottom_nav.my_dog,
      icon: <BrandIcon name="paw" size={20} />,
      match: (p) =>
        p.startsWith(`${root}/my-dog`) ||
        p.startsWith(`${root}/breeds`) ||
        // 「うちの子」 submit からの結果ページ。検索タブではなくこちらに帰属。
        p.startsWith(`${root}/results`),
    },
    {
      href: guidesHref,
      label: dict.bottom_nav.guides,
      icon: <BrandIcon name="book" size={20} />,
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

