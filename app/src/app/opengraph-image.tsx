import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#D97A4E",
            fontWeight: 800,
            fontSize: 32,
            letterSpacing: 0.5,
          }}
        >
          <svg width="48" height="48" viewBox="0 0 32 32">
            <ellipse cx="16" cy="22" rx="6.5" ry="5.5" fill="currentColor" />
            <ellipse cx="7" cy="14" rx="3" ry="3.5" fill="currentColor" />
            <ellipse cx="25" cy="14" rx="3" ry="3.5" fill="currentColor" />
            <ellipse cx="11" cy="7" rx="2.5" ry="3" fill="currentColor" />
            <ellipse cx="21" cy="7" rx="2.5" ry="3" fill="currentColor" />
          </svg>
          <div style={{ display: "flex", gap: 12 }}>
            <span>{site.nameJa}</span>
            <span style={{ opacity: 0.5 }}>/</span>
            <span>{site.nameEn}</span>
          </div>
        </div>

        <div
          style={{
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
