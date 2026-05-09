import Link from "next/link";
import type { Dictionary, Locale } from "@/app/[locale]/dictionaries";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { PawMark } from "./PawMark";

type Props = {
  locale: Locale;
  dict: Dictionary;
};

export function Header({ locale, dict }: Props) {
  const root = `/${locale}`;
  const navItems = [
    { href: `${root}/search`, label: dict.nav.search },
    { href: `${root}/results`, label: dict.nav.browse },
    { href: `${root}/popular`, label: dict.nav.popular },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link
          href={root}
          className="flex items-center gap-2 text-foreground transition-opacity hover:opacity-80"
        >
          <span className="text-primary">
            <PawMark size={26} />
          </span>
          <span className="text-base font-extrabold tracking-tight">
            {dict.brand.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-fg transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher current={locale} />
          <Link
            href={`${root}/search`}
            className="hidden rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-fg transition-opacity hover:opacity-90 md:inline-flex"
          >
            {dict.hero.cta_primary}
          </Link>
        </div>
      </div>
    </header>
  );
}
