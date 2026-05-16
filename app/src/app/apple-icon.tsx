import { ImageResponse } from "next/og";

/**
 * iOS ホーム画面/共有シート向けの高解像度アイコン。
 * 180x180 (Apple touch icon 推奨サイズ)。背景はテラコッタの角丸プレート。
 */
export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #d97a4e 0%, #b85e36 100%)",
          color: "#ffffff",
        }}
      >
        <svg
          width="110"
          height="110"
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
