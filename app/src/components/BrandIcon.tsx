/**
 * デザイナー納品のブランドアイコン群を inline render する。
 *
 * - public/brand/icons/ と public/brand/concern-icons/ の SVG を img 経由で
 *   読むと currentColor が効かないため、path data を本ファイルにコピーして
 *   inline 出力する。SVG ファイル自体はソース管理 / 単体プレビュー用に残置。
 *
 * 2 系統:
 *   - <BrandIcon name="search" />   … UI 一般 (検索 / メニュー / 矢印 等)
 *   - <ConcernIcon iconKey="sun" /> … 悩み 15 種 (Concern.iconKey と一致)
 *
 * 全て currentColor 単色。サイズは size prop で px 指定 (Tailwind 互換は
 * 16/18/20/24 のいずれかが望ましい)。
 */

type BrandIconName =
  | "book"
  | "check"
  | "checkbox"
  | "chevron-right"
  | "close"
  | "filter"
  | "home"
  | "menu"
  | "paw"
  | "save"
  | "search"
  | "share"
  | "sort";

type BrandIconProps = {
  name: BrandIconName;
  size?: number;
  className?: string;
};

const UI_SPECS: Record<
  BrandIconName,
  {
    viewBox: string;
    /** "stroke" モード (fill=none + stroke=currentColor) か "fill" モード。 */
    mode: "stroke" | "fill";
    strokeWidth?: number;
  }
> = {
  book: { viewBox: "0 0 24 24", mode: "fill" },
  check: { viewBox: "0 0 18 18", mode: "stroke", strokeWidth: 2.4 },
  checkbox: { viewBox: "0 0 18 18", mode: "fill" },
  "chevron-right": { viewBox: "0 0 16 16", mode: "stroke", strokeWidth: 2 },
  close: { viewBox: "0 0 24 24", mode: "stroke", strokeWidth: 2 },
  filter: { viewBox: "0 0 18 18", mode: "stroke", strokeWidth: 1.8 },
  home: { viewBox: "0 0 24 24", mode: "fill" },
  menu: { viewBox: "0 0 24 24", mode: "stroke", strokeWidth: 2 },
  paw: { viewBox: "0 0 32 32", mode: "fill" },
  save: { viewBox: "0 0 18 18", mode: "stroke", strokeWidth: 1.8 },
  search: { viewBox: "0 0 24 24", mode: "stroke", strokeWidth: 2 },
  share: { viewBox: "0 0 18 18", mode: "stroke", strokeWidth: 1.8 },
  sort: { viewBox: "0 0 18 18", mode: "stroke", strokeWidth: 1.8 },
};

function UiPaths({ name }: { name: BrandIconName }) {
  switch (name) {
    case "book":
      return (
        <path d="M5 3.5A1.5 1.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H7a1 1 0 0 0 0 2h12a1 1 0 1 1 0 2H6.5A2.5 2.5 0 0 1 4 20.5V4a.5.5 0 0 1 1-.5zM7 5v12h11V5H7z" />
      );
    case "check":
      return <path d="M3.5 9.5l3.5 3.5L14.5 5" />;
    case "checkbox":
      return (
        <path d="M3 2h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm4.1 9.6L4.9 9.4a.9.9 0 0 0-1.3 1.3l2.9 2.9a.9.9 0 0 0 1.3 0l6.6-6.6a.9.9 0 0 0-1.3-1.3l-6 6z" />
      );
    case "chevron-right":
      return <path d="M6 4l4 4-4 4" />;
    case "close":
      return <path d="M6 6l12 12M18 6L6 18" />;
    case "filter":
      return <path d="M2 3.5h14M4 8.5h10M6.5 13.5h5" />;
    case "home":
      return (
        <path d="M11.3 2.6a1 1 0 0 1 1.4 0l8.6 8.1a1 1 0 0 1-.7 1.7H20v8a1 1 0 0 1-1 1h-4.5v-6.2h-5V21.4H5a1 1 0 0 1-1-1v-8h-.6a1 1 0 0 1-.7-1.7l8.6-8.1z" />
      );
    case "menu":
      return <path d="M4 7h16M4 12h16M4 17h16" />;
    case "paw":
      return (
        <>
          <path d="M16 13.5c3.5 0 7 2.5 8.5 5.5s1 6.5-1.5 7.8c-2.5 1.2-5-0.8-7-0.8s-4.5 2-7 0.8c-2.5-1.3-3-4.8-1.5-7.8s5-5.5 8.5-5.5z" />
          <ellipse cx="8.5" cy="11" rx="3" ry="3.8" />
          <ellipse cx="12.5" cy="6.8" rx="3" ry="3.8" />
          <ellipse cx="19.5" cy="6.8" rx="3" ry="3.8" />
          <ellipse cx="23.5" cy="11" rx="3" ry="3.8" />
        </>
      );
    case "save":
      return <path d="M4 2.5h10a.5.5 0 0 1 .5.5v12L9 11.5 3.5 15V3a.5.5 0 0 1 .5-.5z" />;
    case "search":
      return (
        <>
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M16 16l5 5" />
        </>
      );
    case "share":
      return (
        <>
          <circle cx="13.5" cy="3.5" r="2" />
          <circle cx="4.5" cy="9" r="2" />
          <circle cx="13.5" cy="14.5" r="2" />
          <path d="M6.3 8L11.7 4.5M6.3 10L11.7 13.5" />
        </>
      );
    case "sort":
      return <path d="M5 3v12M2.5 5.5L5 3l2.5 2.5M13 15V3M10.5 12.5L13 15l2.5-2.5" />;
  }
}

export function BrandIcon({ name, size = 20, className }: BrandIconProps) {
  const spec = UI_SPECS[name];
  const strokeProps =
    spec.mode === "stroke"
      ? {
          fill: "none",
          stroke: "currentColor",
          strokeWidth: spec.strokeWidth,
          strokeLinecap: "round" as const,
          strokeLinejoin: "round" as const,
        }
      : { fill: "currentColor" };
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={spec.viewBox}
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
      {...strokeProps}
    >
      <UiPaths name={name} />
    </svg>
  );
}

// ───────────────────────────────────────────────────────────────────
// Concern icons (15 種、すべて viewBox 24x24 / stroke 1.7 / currentColor)
// ───────────────────────────────────────────────────────────────────

type ConcernIconKey =
  | "alert"
  | "anchor"
  | "cloud-rain"
  | "compass"
  | "footprints"
  | "heart"
  | "leaf"
  | "moon"
  | "mountain"
  | "ruler"
  | "shield"
  | "snowflake"
  | "sparkles"
  | "sun"
  | "wind";

function ConcernPaths({ iconKey }: { iconKey: ConcernIconKey }) {
  switch (iconKey) {
    case "alert":
      return (
        <>
          <path d="M10.3 4.2L3.7 17.4A1.4 1.4 0 0 0 4.9 19.5h14.2a1.4 1.4 0 0 0 1.2-2.1L13.7 4.2a1.6 1.6 0 0 0-2.8 0Z" />
          <path d="M12 10v3.5" />
          <circle cx="12" cy="16.4" r=".8" fill="currentColor" stroke="none" />
        </>
      );
    case "anchor":
      return (
        <>
          <circle cx="12" cy="5.4" r="1.7" />
          <path d="M12 7.1V21" />
          <path d="M8 11.5h8" />
          <path d="M5 14a7 7 0 0 0 7 7 7 7 0 0 0 7-7" />
          <path d="M5 14H3.4M19 14h1.6" />
        </>
      );
    case "cloud-rain":
      return (
        <>
          <path d="M7 14a3.4 3.4 0 0 1-.4-6.8 5 5 0 0 1 9.7-.6A3.6 3.6 0 0 1 17.8 14H7Z" />
          <path d="M8.5 17.5l-.7 2M12 17.5l-.7 2M15.5 17.5l-.7 2" />
        </>
      );
    case "compass":
      return (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path
            d="M14.6 9.4L11 13l-1.6 1.6L13 11 14.6 9.4Z"
            fill="currentColor"
            stroke="none"
          />
        </>
      );
    case "footprints":
      return (
        <>
          <ellipse cx="7" cy="14.5" rx="2" ry="2.6" />
          <circle cx="4.8" cy="11.2" r=".9" />
          <circle cx="6.8" cy="9.2" r=".9" />
          <circle cx="9.2" cy="11.2" r=".9" />
          <ellipse cx="17" cy="9.5" rx="2" ry="2.6" />
          <circle cx="14.8" cy="6.2" r=".9" />
          <circle cx="16.8" cy="4.2" r=".9" />
          <circle cx="19.2" cy="6.2" r=".9" />
        </>
      );
    case "heart":
      return (
        <path d="M12 20.4S3.5 14.8 3.5 9.2a4.6 4.6 0 0 1 8.5-2.4 4.6 4.6 0 0 1 8.5 2.4c0 5.6-8.5 11.2-8.5 11.2Z" />
      );
    case "leaf":
      return (
        <>
          <path d="M4.5 19.5C4.5 12 11 4.5 19.5 4.5c0 8.5-7.5 15-15 15Z" />
          <path d="M4.5 19.5L14 10" />
        </>
      );
    case "moon":
      return (
        <path d="M20.5 14.4A8.5 8.5 0 0 1 9.6 3.5 8.5 8.5 0 1 0 20.5 14.4Z" />
      );
    case "mountain":
      return (
        <>
          <path d="M3 19l5.5-9 3.5 5 2.5-4 6.5 8H3Z" />
          <circle cx="16.5" cy="6.8" r="1.5" />
        </>
      );
    case "ruler":
      return (
        <>
          <rect x="3" y="9" width="18" height="6" rx="1.5" />
          <path d="M7 9v3M11 9v3M15 9v3M9 9v2M13 9v2" />
        </>
      );
    case "shield":
      return (
        <>
          <path d="M12 3l8 3v5.5c0 4.6-3.4 8.8-8 9.5-4.6-.7-8-4.9-8-9.5V6l8-3Z" />
          <path d="M9.4 12l1.8 1.8 3.4-3.4" />
        </>
      );
    case "snowflake":
      return (
        <>
          <path d="M12 3v18M3 12h18M5.5 5.5l13 13M18.5 5.5l-13 13" />
          <path d="M9.5 4.5L12 6l2.5-1.5M9.5 19.5L12 18l2.5 1.5M4.5 9.5L6 12l-1.5 2.5M19.5 9.5L18 12l1.5 2.5" />
        </>
      );
    case "sparkles":
      return (
        <>
          <path d="M12 4.2l1.2 3.4L16.6 9l-3.4 1.2L12 13.6l-1.2-3.4L7.4 9l3.4-1.2L12 4.2Z" />
          <path d="M5.5 14.2l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6.6-1.7Z" />
          <path d="M18 14.8l.5 1.4 1.4.5-1.4.5-.5 1.4-.5-1.4-1.4-.5 1.4-.5.5-1.4Z" />
        </>
      );
    case "sun":
      return (
        <>
          <circle cx="12" cy="12" r="3.6" />
          <path d="M12 3.2v2.4M12 18.4v2.4M3.2 12h2.4M18.4 12h2.4M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M5.6 18.4l1.7-1.7M16.7 7.3l1.7-1.7" />
        </>
      );
    case "wind":
      return (
        <>
          <path d="M3.5 8.5h11a2.5 2.5 0 1 0-2.5-2.5" />
          <path d="M3.5 12h16a2.5 2.5 0 1 1-2.5 2.5" />
          <path d="M3.5 15.5h8a2.5 2.5 0 1 1-2.5 2.5" />
        </>
      );
  }
}

type ConcernIconProps = {
  /** Concern.iconKey と一致する key。未知の key の場合 null を返す。 */
  iconKey: string;
  size?: number;
  className?: string;
};

const CONCERN_KEYS = new Set<ConcernIconKey>([
  "alert",
  "anchor",
  "cloud-rain",
  "compass",
  "footprints",
  "heart",
  "leaf",
  "moon",
  "mountain",
  "ruler",
  "shield",
  "snowflake",
  "sparkles",
  "sun",
  "wind",
]);

export function ConcernIcon({ iconKey, size = 20, className }: ConcernIconProps) {
  if (!CONCERN_KEYS.has(iconKey as ConcernIconKey)) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <ConcernPaths iconKey={iconKey as ConcernIconKey} />
    </svg>
  );
}

// ───────────────────────────────────────────────────────────────────
// Breed silhouettes (A3) — viewBox 200x200、fill=currentColor 主体。
// 目のハイライトに #fff9f2 を内包する。背景が #fff9f2 系の muted パーチ
// メント上で映える前提でデザインされている。
// ───────────────────────────────────────────────────────────────────

type BreedSilhouetteSize = "tiny" | "small" | "medium" | "large" | "giant";

function BreedSilhouettePaths({ size }: { size: BreedSilhouetteSize }) {
  switch (size) {
    case "tiny":
      return (
        <>
          <ellipse cx="118" cy="125" rx="36" ry="22" />
          <circle cx="150" cy="100" r="22" />
          <polygon points="138,82 132,68 144,76" />
          <polygon points="162,82 168,68 156,76" />
          <circle cx="158" cy="103" r="2" fill="#fff9f2" />
          <rect x="92" y="143" width="5" height="22" rx="2" />
          <rect x="106" y="143" width="5" height="22" rx="2" />
          <rect x="126" y="143" width="5" height="22" rx="2" />
          <rect x="140" y="143" width="5" height="22" rx="2" />
          <path d="M82 122 Q70 110 78 100" />
        </>
      );
    case "small":
      return (
        <>
          <ellipse cx="110" cy="118" rx="50" ry="26" />
          <circle cx="156" cy="98" r="25" />
          <polygon points="142,76 134,60 150,68" />
          <polygon points="170,76 178,60 162,68" />
          <circle cx="164" cy="102" r="2.5" fill="#fff9f2" />
          <rect x="76" y="138" width="6" height="30" rx="2.5" />
          <rect x="94" y="138" width="6" height="30" rx="2.5" />
          <rect x="124" y="138" width="6" height="30" rx="2.5" />
          <rect x="142" y="138" width="6" height="30" rx="2.5" />
          <path d="M64 116 Q50 105 56 90" />
        </>
      );
    case "medium":
      return (
        <>
          <ellipse cx="100" cy="112" rx="58" ry="30" />
          <circle cx="158" cy="92" r="28" />
          <polygon points="142,68 132,50 150,58" />
          <polygon points="174,68 184,50 166,58" />
          <circle cx="168" cy="97" r="3" fill="#fff9f2" />
          <path
            d="M186 87 Q193 86 192 92"
            stroke="currentColor"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
          <rect x="62" y="135" width="7" height="38" rx="3" />
          <rect x="84" y="135" width="7" height="38" rx="3" />
          <rect x="118" y="135" width="7" height="38" rx="3" />
          <rect x="140" y="135" width="7" height="38" rx="3" />
          <path
            d="M44 108 Q28 92 38 76 Q50 70 58 84"
            stroke="currentColor"
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
          />
        </>
      );
    case "large":
      return (
        <>
          <ellipse cx="98" cy="105" rx="64" ry="33" />
          <circle cx="160" cy="86" r="30" />
          <path d="M140 75 Q130 95 138 108 Q146 100 148 84 Z" />
          <path d="M180 75 Q190 95 182 108 Q174 100 172 84 Z" />
          <circle cx="170" cy="92" r="3.5" fill="#fff9f2" />
          <path
            d="M188 78 Q198 76 196 86"
            stroke="currentColor"
            strokeWidth={3.5}
            fill="none"
            strokeLinecap="round"
          />
          <rect x="56" y="132" width="8" height="42" rx="3.5" />
          <rect x="80" y="132" width="8" height="42" rx="3.5" />
          <rect x="116" y="132" width="8" height="42" rx="3.5" />
          <rect x="140" y="132" width="8" height="42" rx="3.5" />
          <path
            d="M34 102 Q14 102 16 88"
            stroke="currentColor"
            strokeWidth={8}
            fill="none"
            strokeLinecap="round"
          />
        </>
      );
    case "giant":
      return (
        <>
          <ellipse cx="96" cy="96" rx="70" ry="36" />
          <circle cx="162" cy="74" r="33" />
          <path d="M140 60 Q128 84 138 100 Q150 92 152 70 Z" />
          <path d="M184 60 Q196 84 186 100 Q174 92 172 70 Z" />
          <circle cx="172" cy="80" r="4" fill="#fff9f2" />
          <path
            d="M192 64 Q204 62 202 74"
            stroke="currentColor"
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
          />
          <rect x="52" y="128" width="10" height="50" rx="4" />
          <rect x="78" y="128" width="10" height="50" rx="4" />
          <rect x="116" y="128" width="10" height="50" rx="4" />
          <rect x="142" y="128" width="10" height="50" rx="4" />
          <path
            d="M30 90 Q8 92 8 78"
            stroke="currentColor"
            strokeWidth={9}
            fill="none"
            strokeLinecap="round"
          />
        </>
      );
  }
}

export function BreedSilhouette({
  size,
  width,
  height,
  className,
}: {
  size: BreedSilhouetteSize;
  /** width/height いずれかを指定。両方省略時はコンテナ充填 (100% / auto)。 */
  width?: number | string;
  height?: number | string;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={width ?? "100%"}
      height={height ?? "100%"}
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <BreedSilhouettePaths size={size} />
    </svg>
  );
}

// ───────────────────────────────────────────────────────────────────
// Guide category icons (B1) — viewBox 48x48、stroke 2.2 主、一部 fill 混在。
// GuideCard の slug-charcode 4 クラスローテに対応。
// ───────────────────────────────────────────────────────────────────

type GuideIconName = "harness" | "bath" | "senior" | "season";

function GuideIconPaths({ name }: { name: GuideIconName }) {
  switch (name) {
    case "harness":
      return (
        <>
          <path d="M16 14h16l-3 8 4 14h-6l-3-11-3 11h-6l4-14-3-8Z" />
          <circle cx="24" cy="18" r="1.5" fill="currentColor" stroke="none" />
          <path d="M14 22l-3 4M34 22l3 4" />
        </>
      );
    case "bath":
      return (
        <>
          <path d="M6 26h36v6a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4v-6Z" />
          <path d="M11 26V13a3 3 0 0 1 6 0v3" />
          <circle cx="22" cy="9" r="2.2" fill="currentColor" stroke="none" />
          <path d="M27 7l3-1M30 11l2 1M27 13l3 1" />
          <path d="M14 40v3M22 40v3M30 40v3M38 40v3" />
        </>
      );
    case "senior":
      return (
        <>
          <circle cx="20" cy="26" r="11" />
          <path d="M13 18l-1-4 5 2M27 18l1-4-5 2" />
          <circle cx="17" cy="25" r="1.3" fill="currentColor" stroke="none" />
          <circle cx="23" cy="25" r="1.3" fill="currentColor" stroke="none" />
          <path d="M18 30c.5.7 1.2 1.1 2 1.1s1.5-.4 2-1.1" />
          <path
            d="M36 16c-2 0-3 1.4-3 3 0 2.5 3 5 3 5s3-2.5 3-5c0-1.6-1-3-3-3Z"
            fill="currentColor"
          />
        </>
      );
    case "season":
      return (
        <>
          <circle cx="17" cy="24" r="6" />
          <path d="M17 13v-3M17 38v-3M6 24h-3M9 16l-2-2M9 32l-2 2" />
          <path d="M34 14v20M28 17l6 4 6-4M28 31l6-4 6 4M28 20l6 4-6 4M40 20l-6 4 6 4" />
        </>
      );
  }
}

export function GuideIcon({
  name,
  size = 48,
  className,
}: {
  name: GuideIconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <GuideIconPaths name={name} />
    </svg>
  );
}

// ───────────────────────────────────────────────────────────────────
// Seasonal banner icons (B2) — viewBox 64x64、stroke 3。
// SeasonalBanner の tone (warm/cool/fresh) → summer/winter/spring-autumn。
// ───────────────────────────────────────────────────────────────────

type BannerIconName = "summer" | "winter" | "spring-autumn";

function BannerIconPaths({ name }: { name: BannerIconName }) {
  switch (name) {
    case "summer":
      return (
        <>
          <circle cx="32" cy="28" r="9" />
          <path d="M32 12v-5M32 49v-5M16 28h-5M53 28h-5M20 16l-3.5-3.5M44 16l3.5-3.5M20 40l-3.5 3.5M44 40l3.5 3.5" />
          <path d="M14 56c3-3 6 3 9 0s6 3 9 0 6 3 9 0 6 3 9 0" />
        </>
      );
    case "winter":
      return (
        <>
          <path d="M32 8v48M8 32h48M14 14l36 36M50 14L14 50" />
          <path d="M24 12l8 4 8-4M24 52l8-4 8 4M12 24l4 8-4 8M52 24l-4 8 4 8" />
        </>
      );
    case "spring-autumn":
      return (
        <>
          <path d="M14 50C14 28 28 14 50 14c0 22-14 36-36 36Z" />
          <path d="M14 50L34 30" />
          <circle cx="44" cy="44" r="3" fill="currentColor" stroke="none" />
          <path d="M44 38v-3M44 53v-3M38 44h-3M53 44h-3" />
        </>
      );
  }
}

export function BannerIcon({
  name,
  size = 56,
  className,
}: {
  name: BannerIconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <BannerIconPaths name={name} />
    </svg>
  );
}
