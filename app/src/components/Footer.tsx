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
              <Link href={`${root}/search`} className="hover:text-primary">
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
              <span className="text-muted-fg">
                {dict.footer.links.privacy}
              </span>
            </li>
            <li>
              <span className="text-muted-fg">{dict.footer.links.terms}</span>
            </li>
            <li>
              <span className="text-muted-fg">
                {dict.footer.links.affiliate_disclosure}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/70 px-5 py-4 text-center text-xs text-muted-fg">
        {format(dict.footer.copyright, { year })}
      </div>
    </footer>
  );
}
