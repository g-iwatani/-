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
          width="22"
          height="22"
          viewBox="0 0 32 32"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16 13.5 C19.5 13.5 23 16 24.5 19 C26 22 25.5 25.5 23 26.8 C20.5 28 18 26 16 26 C14 26 11.5 28 9 26.8 C6.5 25.5 6 22 7.5 19 C9 16 12.5 13.5 16 13.5 Z" />
          <ellipse cx="8.5" cy="11" rx="3" ry="3.8" />
          <ellipse cx="12.5" cy="6.8" rx="3" ry="3.8" />
          <ellipse cx="19.5" cy="6.8" rx="3" ry="3.8" />
          <ellipse cx="23.5" cy="11" rx="3" ry="3.8" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
