import Link from "next/link";
import type { Dictionary, Locale } from "@/app/[locale]/dictionaries";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileMenu } from "./MobileMenu";
import { PawMark } from "./PawMark";

type Props = {
  locale: Locale;
  dict: Dictionary;
};

export function Header({ locale, dict }: Props) {
  const root = `/${locale}`;
  const navItems = [
    { href: `${root}/breeds`, label: dict.bottom_nav.breeds },
    { href: `${root}/my-dog`, label: dict.bottom_nav.my_dog },
    { href: `${root}/results`, label: dict.nav.browse },
    { href: `${root}/popular`, label: dict.nav.popular },
    { href: `${root}/guides/harness-buying-guide`, label: dict.nav.guides },
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
          {/* Header free-text search (md+ visible). Mobile users use MobileMenu. */}
          <form
            method="GET"
            action={`${root}/find`}
            role="search"
            aria-label={dict.find.header_aria}
            className="hidden items-center rounded-full border border-border bg-card px-3 py-1.5 focus-within:border-primary md:flex"
          >
            <span aria-hidden className="mr-1.5 text-muted-fg">
              🔍
            </span>
            <input
              type="search"
              name="q"
              placeholder={dict.find.placeholder}
              className="w-44 bg-transparent text-sm text-foreground placeholder:text-muted-fg focus:outline-none"
              autoComplete="off"
            />
          </form>
          <LocaleSwitcher current={locale} />
          <Link
            href={`${root}/my-dog`}
            className="hidden rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-fg transition-opacity hover:opacity-90 md:inline-flex"
          >
            {dict.hero.cta_primary}
          </Link>
          <MobileMenu
            navItems={navItems}
            ctaHref={`${root}/my-dog`}
            ctaLabel={dict.hero.cta_primary}
            dict={dict}
          />
        </div>
      </div>
    </header>
  );
}
