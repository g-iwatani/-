import { ImageResponse } from "next/og";
import { getGuide } from "@/lib/guides";
import { site } from "@/lib/site";
import { defaultLocale, hasLocale } from "../../dictionaries";

// 同上 — Cloudflare Workers + OpenNext で next/og を動かすため明示
export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.nameJa} 選び方ガイド`;

/**
 * ガイド記事用 OG 画像。タイトル + リード冒頭 + ブランド表示。
 * GuideCard と同じ slug-charcode ベースのパレットを使ってサイト全体の
 * 視覚一貫性を出す。
 */
export default async function GuideOg({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const safe = hasLocale(locale) ? locale : defaultLocale;
  const guide = getGuide(slug);
  const title = guide
    ? safe === "ja"
      ? guide.titleJa
      : guide.titleEn
    : safe === "ja"
      ? site.nameJa
      : site.nameEn;
  const lead = guide
    ? safe === "ja"
      ? guide.leadJa
      : guide.leadEn
    : "";
  const author = guide
    ? safe === "ja"
      ? guide.authorJa
      : guide.authorEn
    : safe === "ja"
      ? "わんプロブレム編集部"
      : "WanProblem editorial team";

  // GuideCard と同じパレット計算
  const palettes = [
    { from: "#5C7548", to: "#2E3D24", icon: "🦮" },
    { from: "#C84540", to: "#7A2520", icon: "🛁" },
    { from: "#7A8FB0", to: "#3A4868", icon: "🧓" },
    { from: "#F5A623", to: "#B07420", icon: "☀️" },
  ];
  const idx = slug.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % 4;
  const p = palettes[idx];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(135deg, ${p.from} 0%, ${p.to} 100%)`,
          fontFamily: "sans-serif",
          color: "#fff",
          padding: 80,
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            fontWeight: 800,
          }}
        >
          <span style={{ fontSize: 48 }}>{p.icon}</span>
          <span>選び方ガイド · {site.nameJa}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 60,
              fontWeight: 800,
              lineHeight: 1.18,
              display: "flex",
            }}
          >
            {title.length > 50 ? title.slice(0, 48) + "…" : title}
          </div>
          {lead && (
            <div
              style={{
                fontSize: 26,
                lineHeight: 1.5,
                opacity: 0.92,
                display: "flex",
              }}
            >
              {lead.length > 110 ? lead.slice(0, 108) + "…" : lead}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            opacity: 0.88,
          }}
        >
          <span>{author}</span>
          <span>{site.lastUpdated.year}年{site.lastUpdated.month}月最新</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
