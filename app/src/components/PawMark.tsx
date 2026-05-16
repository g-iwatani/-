type Props = {
  className?: string;
  size?: number;
};

/**
 * ブランドシンボル。犬の肉球 (paw print)。
 * - 単色 (currentColor)。Header の text-primary、OG の白文字、favicon の
 *   任意背景、いずれにも展開できる。
 * - viewBox 0 0 32 32 / 16px まで 4 本指が独立して認識可能。
 * - 中央 2 指は cx=12.5 / 19.5 で軽い隔たりを入れ、指の重なりを回避。
 * - 名称は歴史的経緯で PawMark のまま (呼び出し側変更回避)。
 *   中身は paw print (Phase 1 ブランドリフレッシュ · 2026年5月)。
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
      <path d="M16 13.5 C19.5 13.5 23 16 24.5 19 C26 22 25.5 25.5 23 26.8 C20.5 28 18 26 16 26 C14 26 11.5 28 9 26.8 C6.5 25.5 6 22 7.5 19 C9 16 12.5 13.5 16 13.5 Z" />
      <ellipse cx="8.5" cy="11" rx="3" ry="3.8" />
      <ellipse cx="12.5" cy="6.8" rx="3" ry="3.8" />
      <ellipse cx="19.5" cy="6.8" rx="3" ry="3.8" />
      <ellipse cx="23.5" cy="11" rx="3" ry="3.8" />
    </svg>
  );
}
