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
          width="120"
          height="120"
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
