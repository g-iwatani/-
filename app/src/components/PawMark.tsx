type Props = {
  className?: string;
  size?: number;
};

/**
 * ブランドマーク。立ち耳の犬の顔シルエット。
 * - 単色 (currentColor)。Header の text-primary、OG の白文字、favicon の
 *   任意背景、いずれにも展開できる。
 * - viewBox 0 0 32 32 にフィット。16x16 まで耳と顔の輪郭で犬と判別可能。
 * - 名称は歴史的経緯で PawMark のまま (呼び出し側変更回避)。中身は犬の顔。
 */
export function PawMark({ className, size = 28 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* 左耳 (立ち耳・三角) */}
      <path d="M5 4 L13.5 8.5 L11 17.5 Z" />
      {/* 右耳 */}
      <path d="M27 4 L18.5 8.5 L21 17.5 Z" />
      {/* 顔 (やや幅広の楕円で柴犬っぽい輪郭) */}
      <ellipse cx="16" cy="19" rx="10" ry="9" />
      {/* 鼻先のアクセント (顔と同色だが下半円を少しだけ盛って "マズル感" を出す) */}
      <ellipse cx="16" cy="23.5" rx="4.5" ry="3" />
    </svg>
  );
}
