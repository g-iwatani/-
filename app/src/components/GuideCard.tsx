import Link from "next/link";
import type { Locale } from "@/app/[locale]/dictionaries";
import type { Guide } from "@/lib/guides";

type Props = {
  guide: Guide;
  locale: Locale;
};

/**
 * ホームページ Rail 用の小さめガイドカード。サムネ画像はまだ持っていないので、
 * グラデーション + アイコン文字でカテゴリ感を演出する暫定。将来 OG 画像
 * 自動生成を入れたら差し替え。
 */
export function GuideCard({ guide, locale }: Props) {
  const title = locale === "ja" ? guide.titleJa : guide.titleEn;
  const lead = locale === "ja" ? guide.leadJa : guide.leadEn;
  const author = locale === "ja" ? guide.authorJa : guide.authorEn;

  // ガイド毎にざっくり色を変える: slug の charcode 合計 % 4 でパレット選択
  const paletteIdx =
    guide.slug.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % 4;
  const palettes = [
    { from: "#5C7548", to: "#2E3D24", icon: "🦮" },
    { from: "#C84540", to: "#7A2520", icon: "🛁" },
    { from: "#7A8FB0", to: "#3A4868", icon: "🧓" },
    { from: "#F5A623", to: "#B07420", icon: "☀️" },
  ];
  const palette = palettes[paletteIdx];

  return (
    <Link
      href={`/${locale}/guides/${guide.slug}`}
      className="block w-72 overflow-hidden rounded-2xl border border-card-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
    >
      <div
        className="flex h-32 items-center justify-center text-5xl"
        style={{
          backgroundImage: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`,
        }}
        aria-hidden
      >
        {palette.icon}
      </div>
      <div className="space-y-2 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
          {locale === "ja" ? "選び方ガイド" : "Buying guide"}
        </p>
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground">
          {title}
        </h3>
        <p className="line-clamp-3 text-xs leading-relaxed text-muted-fg">
          {lead}
        </p>
        <p className="pt-1 text-[10px] text-muted-fg">{author}</p>
      </div>
    </Link>
  );
}
