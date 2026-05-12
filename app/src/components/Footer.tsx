import Link from "next/link";
import type { Dictionary, Locale } from "@/app/[locale]/dictionaries";
import { format } from "@/lib/format";
import { PawMark } from "./PawMark";

type Props = {
  locale: Locale;
  dict: Dictionary;
};

export function Footer({ locale, dict }: Props) {
  const root = `/${locale}`;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 text-foreground">
            <span className="text-primary">
              <PawMark size={22} />
            </span>
            <span className="text-base font-extrabold">{dict.brand.name}</span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-fg">
            {dict.footer.tagline}
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted-fg">
            {dict.footer.links_title}
          </h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href={root} className="hover:text-primary">
                {dict.footer.links.home}
              </Link>
            </li>
            <li>
              <Link href={`${root}/my-dog`} className="hover:text-primary">
                {dict.footer.links.search}
              </Link>
            </li>
            <li>
              <Link href={`${root}/results`} className="hover:text-primary">
                {dict.nav.browse}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted-fg">
            {dict.footer.policy_title}
          </h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link
                href={`${root}/legal/affiliate`}
                className="hover:text-primary"
              >
                {dict.footer.links.affiliate_disclosure}
              </Link>
            </li>
            <li>
              <Link
                href={`${root}/legal/privacy`}
                className="hover:text-primary"
              >
                {dict.footer.links.privacy}
              </Link>
            </li>
            <li>
              <Link href={`${root}/legal/terms`} className="hover:text-primary">
                {dict.footer.links.terms}
              </Link>
            </li>
            <li>
              <Link href={`${root}/legal/about`} className="hover:text-primary">
                {locale === "ja" ? "運営者情報" : "About"}
              </Link>
            </li>
            <li>
              <Link
                href={`${root}/legal/contact`}
                className="hover:text-primary"
              >
                {dict.footer.links.contact}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/70 px-5 py-3">
        <p className="mx-auto max-w-6xl text-center text-[11px] leading-relaxed text-muted-fg">
          {locale === "ja"
            ? "※ 当サイトはアフィリエイト広告を含みます。詳細は"
            : "※ This site contains affiliate advertising. See "}
          <Link
            href={`${root}/legal/affiliate`}
            className="font-semibold underline hover:text-primary"
          >
            {locale === "ja" ? "アフィリエイト開示" : "Affiliate Disclosure"}
          </Link>
          {locale === "ja" ? "をご覧ください。" : "."}
        </p>
      </div>

      <div className="border-t border-border/70 px-5 py-4 text-center text-xs text-muted-fg">
        {format(dict.footer.copyright, { year })}
      </div>
    </footer>
  );
}
