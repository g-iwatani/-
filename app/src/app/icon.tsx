import { ImageResponse } from "next/og";

/**
 * 動的ファビコン。ブランドマーク (犬シルエット) をテラコッタ背景の丸で囲む。
 * 静的 favicon.ico を廃して、PawMark の更新が favicon にも自動反映される
 * ように一本化している。
 *
 * runtime = edge は Cloudflare Workers + OpenNext での起動要件。
 */
export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#d97a4e",
          borderRadius: "50%",
          color: "#ffffff",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 32 32"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 4 L13.5 8.5 L11 17.5 Z" />
          <path d="M27 4 L18.5 8.5 L21 17.5 Z" />
          <ellipse cx="16" cy="19" rx="10" ry="9" />
          <ellipse cx="16" cy="23.5" rx="4.5" ry="3" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
