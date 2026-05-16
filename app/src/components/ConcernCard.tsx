import Link from "next/link";
import type { Locale } from "@/app/[locale]/dictionaries";
import type { Concern } from "@/lib/concerns";
import { ConcernIcon } from "./BrandIcon";

type Props = {
  concern: Concern;
  locale: Locale;
  href: string;
};

export function ConcernCard({ concern, locale, href }: Props) {
  const label = locale === "ja" ? concern.labelJa : concern.labelEn;
  const desc = locale === "ja" ? concern.descJa : concern.descEn;

  return (
    <Link
      href={href}
      className="group flex h-full flex-col gap-3 rounded-3xl border border-card-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-primary-soft text-primary">
          <ConcernIcon iconKey={concern.iconKey} size={24} />
        </span>
        <div>
          <h3 className="text-sm font-bold leading-snug text-foreground group-hover:text-primary">
            {label}
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-fg">
            {locale === "ja"
              ? `${concern.popularity}% の飼い主が関心`
              : `${concern.popularity}% of owners care about this`}
          </p>
        </div>
      </div>
      <p className="line-clamp-2 text-sm leading-relaxed text-muted-fg">
        {desc}
      </p>
    </Link>
  );
}
