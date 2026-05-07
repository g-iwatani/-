import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "../dictionaries";

export default async function LegalLayout({
  children,
  params,
}: LayoutProps<"/[locale]/legal">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const navItems = [
    {
      href: `/${locale}/legal/affiliate`,
      labelJa: "アフィリエイト開示",
      labelEn: "Affiliate disclosure",
    },
    {
      href: `/${locale}/legal/privacy`,
      labelJa: "プライバシーポリシー",
      labelEn: "Privacy policy",
    },
    {
      href: `/${locale}/legal/terms`,
      labelJa: "利用規約",
      labelEn: "Terms of service",
    },
    {
      href: `/${locale}/legal/about`,
      labelJa: "運営者情報",
      labelEn: "About",
    },
    {
      href: `/${locale}/legal/contact`,
      labelJa: "お問い合わせ",
      labelEn: "Contact",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-5 pt-6 pb-16">
      <nav className="mb-6 -mx-2 flex flex-wrap gap-1 overflow-x-auto md:gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-fg transition-colors hover:border-primary hover:text-primary"
          >
            {locale === "ja" ? item.labelJa : item.labelEn}
          </Link>
        ))}
      </nav>
      <article className="prose-legal">{children}</article>
    </div>
  );
}
