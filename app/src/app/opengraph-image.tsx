import { ImageResponse } from "next/og";
import { absoluteUrl, site } from "@/lib/site";

// Cloudflare Workers + OpenNext で next/og を動かすために必要
export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.nameJa} / ${site.nameEn}`;

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #FFF9F2 0%, #FCE6D8 60%, #D97A4E 130%)",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        {/* デザイナー納品の OG 背景パターン。グラデの上に重ねて質感を足す。 */}
        <img
          src={absoluteUrl("/brand/og-templates/og-bg-pattern.png")}
          alt=""
          width={1200}
          height={630}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0.55,
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#D97A4E",
            fontWeight: 800,
            fontSize: 32,
            letterSpacing: 0.5,
          }}
        >
          <svg width="48" height="48" viewBox="0 0 32 32" fill="currentColor">
            <path d="M16 13.5 C19.5 13.5 23 16 24.5 19 C26 22 25.5 25.5 23 26.8 C20.5 28 18 26 16 26 C14 26 11.5 28 9 26.8 C6.5 25.5 6 22 7.5 19 C9 16 12.5 13.5 16 13.5 Z" />
            <ellipse cx="8.5" cy="11" rx="3" ry="3.8" />
            <ellipse cx="12.5" cy="6.8" rx="3" ry="3.8" />
            <ellipse cx="19.5" cy="6.8" rx="3" ry="3.8" />
            <ellipse cx="23.5" cy="11" rx="3" ry="3.8" />
          </svg>
          <div style={{ display: "flex", gap: 12 }}>
            <span>{site.nameJa}</span>
            <span style={{ opacity: 0.5 }}>/</span>
            <span>{site.nameEn}</span>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              letterSpacing: -2,
              color: "#2D1F1A",
              lineHeight: 1.05,
              maxWidth: 980,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>ワンちゃんの困りごとに、</span>
            <span>世界中のブランドから答えを。</span>
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 600,
              color: "#6B5848",
              maxWidth: 980,
              lineHeight: 1.4,
            }}
          >
            犬種・体型・悩みからぴったりの犬用品を探せる、複数ブランド横断のアグリゲーター。
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            gap: 12,
            marginTop: 36,
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          {["MIX犬対応", "260犬種", "50悩み", "Trivago型UI"].map((t) => (
            <span
              key={t}
              style={{
                background: "#FFFFFFD9",
                color: "#D97A4E",
                padding: "10px 18px",
                borderRadius: 999,
                border: "1px solid #EAD9C2",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
