import Link from "next/link";
import type { Locale } from "@/app/[locale]/dictionaries";
import type { Concern } from "@/lib/concerns";

type Props = {
  concern: Concern;
  locale: Locale;
  href: string;
};

const iconMap: Record<string, string> = {
  ruler: "📏",
  alert: "⚠️",
  compass: "🧭",
  sun: "☀️",
  snowflake: "❄️",
  "cloud-rain": "🌧️",
  footprints: "🐾",
  anchor: "⚓",
  shield: "🛡️",
  heart: "💛",
  moon: "🌙",
  sparkles: "✨",
  mountain: "⛰️",
  wind: "🌬️",
  leaf: "🍃",
};

const categoryGradient: Record<
  Concern["category"],
  { from: string; to: string }
> = {
  size: { from: "#FCE6D8", to: "#D97A4E" },
  season: { from: "#E8EEDB", to: "#6B8E4E" },
  behavior: { from: "#F5E0D5", to: "#B85B36" },
  purpose: { from: "#E8DFCE", to: "#8B7355" },
};

export function ConcernChip({ concern, locale, href }: Props) {
  const label = locale === "ja" ? concern.labelJa : concern.labelEn;
  const desc = locale === "ja" ? concern.descJa : concern.descEn;
  const icon = iconMap[concern.iconKey] ?? "❓";
  const palette = categoryGradient[concern.category];

  return (
    <Link
      href={href}
      className="group block w-[260px] overflow-hidden rounded-2xl border border-card-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md md:w-[300px]"
    >
      <div
        className="flex h-24 items-center justify-center text-4xl"
        style={{
          backgroundImage: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`,
        }}
      >
        <span aria-hidden="true">{icon}</span>
      </div>
      <div className="px-4 py-3">
        <p className="line-clamp-2 text-sm font-bold leading-snug text-foreground group-hover:text-primary">
          {label}
        </p>
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-fg">
          {desc}
        </p>
      </div>
    </Link>
  );
}
