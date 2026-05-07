type Props = {
  palette: { from: string; to: string };
  emoji: string;
  /** 実商品画像URL。指定があればグラデの代わりに表示 */
  imageUrl?: string;
  /** alt 用の商品名 */
  alt?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-32 text-3xl",
  md: "h-48 text-5xl",
  lg: "aspect-square text-7xl",
};

export function ProductImage({
  palette,
  emoji,
  imageUrl,
  alt,
  className,
  size = "md",
}: Props) {
  if (imageUrl) {
    return (
      <div
        className={`relative w-full overflow-hidden rounded-2xl bg-muted ${
          sizeClasses[size]
        } ${className ?? ""}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={alt ?? ""}
          loading="lazy"
          className="h-full w-full object-cover object-center"
        />
      </div>
    );
  }
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl ${
        sizeClasses[size]
      } ${className ?? ""}`}
      style={{
        backgroundImage: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5) 0%, transparent 50%)",
        }}
      />
      <div className="relative flex h-full w-full items-center justify-center">
        <span aria-hidden="true">{emoji}</span>
      </div>
    </div>
  );
}
