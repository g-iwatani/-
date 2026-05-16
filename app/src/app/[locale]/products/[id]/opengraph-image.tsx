import { ImageResponse } from "next/og";
import { getProduct } from "@/lib/products";
import { absoluteUrl, site } from "@/lib/site";
import { defaultLocale, hasLocale } from "../../dictionaries";

// Cloudflare Workers では Edge Runtime 必須 (Node 専用 API を持つ next/og の
// 一部機能を WebAssembly fallback に切替えるため)。指定無しだと OpenNext で
// Workers にデプロイした時に 500 エラーで OG 画像が出ない。
export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.nameJa} 商品ページ`;

/**
 * 商品ページ専用 OG 画像。SNS シェア時に商品名 + ブランド + サイト名を
 * ブランド色のグラデで表示する。商品画像がある場合は左半分にレイアウト。
 *
 * Note: Edge Runtime / Workers でも動くよう、画像は URL 参照のみで埋め込み。
 * 多重リダイレクトする URL は ImageResponse でロード失敗するので、
 * fetch 失敗時は背景パターンだけにフォールバック。
 */
export default async function ProductOg({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const safe = hasLocale(locale) ? locale : defaultLocale;
  const product = getProduct(id);
  const name = product
    ? safe === "ja"
      ? product.nameJa
      : product.nameEn
    : safe === "ja"
      ? site.nameJa
      : site.nameEn;
  const brand = product?.brand ?? "";
  const imageUrl = product?.imageUrl;

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "linear-gradient(135deg, #FFF9F2 0%, #FCE6D8 60%, #D97A4E 130%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* デザイナー納品の OG 背景パターン */}
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
        {/* Left: product image (when available) — 画像が無ければ paw print frame をフォールバックで表示 */}
        <div
          style={{
            position: "relative",
            width: 540,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
            background: imageUrl ? "#fff" : "transparent",
          }}
        >
          <img
            src={
              imageUrl ?? absoluteUrl("/brand/og-templates/og-frame-product.svg")
            }
            alt=""
            width={460}
            height={460}
            style={{ objectFit: "contain", borderRadius: 24 }}
          />
        </div>
        {/* Right: text */}
        <div
          style={{
            position: "relative",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 64,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: "#D97A4E",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            🐾 {site.nameJa}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {brand && (
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#7A2520",
                  letterSpacing: 1,
                }}
              >
                {brand}
              </div>
            )}
            <div
              style={{
                fontSize: imageUrl ? 52 : 64,
                fontWeight: 800,
                color: "#1F1410",
                lineHeight: 1.15,
                display: "flex",
              }}
            >
              {name.length > 60 ? name.slice(0, 58) + "…" : name}
            </div>
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#7A5A4A",
              display: "flex",
              gap: 16,
            }}
          >
            <span>悩み別 犬用品</span>
            <span>·</span>
            <span>{site.taglineJa.slice(0, 20)}</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
