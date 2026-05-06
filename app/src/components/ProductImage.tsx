type Props = {
  palette: { from: string; to: string };
  emoji: string;
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
  className,
  size = "md",
}: Props) {
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
