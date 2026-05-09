type Props = {
  /** 0-5 の数値。null の場合は何も表示しない */
  value: number | null;
  /** "sm" は 12px、"md" は 14px */
  size?: "sm" | "md";
};

/** 整数+0.5刻みの星表示。半端は最後の星の左半分塗り。 */
export function StarRating({ value, size = "sm" }: Props) {
  if (value === null || value <= 0) return null;
  const filled = Math.round(value * 2) / 2; // 0.5刻みに丸め
  const px = size === "sm" ? "text-[12px]" : "text-sm";
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${px} font-semibold text-amber-500`}
      aria-label={`評価 ${value.toFixed(2)} / 5`}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const isFull = i + 1 <= filled;
        const isHalf = !isFull && i + 0.5 <= filled;
        return (
          <span key={i} aria-hidden="true">
            {isFull ? "★" : isHalf ? "⯨" : "☆"}
          </span>
        );
      })}
      <span className="ml-1 text-foreground">{value.toFixed(1)}</span>
    </span>
  );
}
