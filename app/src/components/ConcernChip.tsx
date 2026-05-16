import Link from "next/link";
import type { Locale } from "@/app/[locale]/dictionaries";
import type { Concern } from "@/lib/concerns";
import { ConcernIcon } from "./BrandIcon";

type Props = {
  concern: Concern;
  locale: Locale;
  href: string;
};

const categoryAccent: Record<Concern["category"], string> = {
  size: "bg-primary",
  season: "bg-[#c98c47]",
  behavior: "bg-[#a85530]",
  purpose: "bg-[#8b7355]",
  care: "bg-accent",
};
const categoryText: Record<Concern["category"], string> = {
  size: "text-primary",
  season: "text-[#c98c47]",
  behavior: "text-[#a85530]",
  purpose: "text-[#8b7355]",
  care: "text-accent",
};

export function ConcernChip({ concern, locale, href }: Props) {
  const label = locale === "ja" ? concern.labelJa : concern.labelEn;
  const desc = locale === "ja" ? concern.descJa : concern.descEn;
  const number =
    (concern as Concern & { number?: string }).number ?? "";

  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-2xl border border-card-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md md:p-6"
    >
      <span
        aria-hidden="true"
        className={`absolute left-0 top-0 h-full w-1 ${categoryAccent[concern.category]}`}
      />
      <div className="mb-3 flex items-center gap-3">
        {number && (
          <span
            className={`font-mono text-xs font-bold tracking-wider ${categoryText[concern.category]}`}
          >
            {number}
          </span>
        )}
        <ConcernIcon
          iconKey={concern.iconKey}
          size={18}
          className={categoryText[concern.category]}
        />
        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-muted-fg">
          {concern.category}
        </span>
      </div>
      <p className="text-base font-extrabold tracking-[-0.015em] leading-snug text-foreground group-hover:text-primary md:text-lg">
        {label}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted-fg">{desc}</p>
    </Link>
  );
}
