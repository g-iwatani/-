type Props = {
  /** 大型に表示する数値。 */
  value: string | number;
  /** 数値の単位 (任意)。"℃" "%" "kg" 等。 */
  unit?: string;
  /** 主ラベル — 数字が何を表すか。 */
  label: string;
  /** 補足説明 (任意)。 */
  sub?: string;
  /** 色トーン。terracotta = primary、sage = accent。 */
  tone?: "terracotta" | "sage";
};

/**
 * 大型数字 + ラベルの editorial callout。データドリブンな主張を視覚化する
 * 用途。本文の流れを止めて「ここで覚えてほしい数字」 を提示する。
 */
export function StatCallout({
  value,
  unit,
  label,
  sub,
  tone = "terracotta",
}: Props) {
  const isTerracotta = tone === "terracotta";
  return (
    <aside
      className={`my-8 flex flex-wrap items-center gap-6 rounded-2xl px-7 py-7 md:gap-8 md:px-8 ${
        isTerracotta ? "bg-primary-soft" : "bg-accent-soft"
      }`}
    >
      <div className="flex items-baseline gap-1">
        <span
          className={`font-extrabold leading-[0.85] tracking-[-0.04em] ${
            isTerracotta ? "text-primary" : "text-accent"
          }`}
          style={{ fontSize: "88px" }}
        >
          {value}
        </span>
        {unit && (
          <span
            className={`text-xl font-extrabold tracking-[-0.01em] md:text-2xl ${
              isTerracotta ? "text-primary" : "text-accent"
            }`}
          >
            {unit}
          </span>
        )}
      </div>
      <div className="min-w-[14rem] flex-1 space-y-2">
        <p className="text-base font-extrabold tracking-[-0.015em] text-foreground md:text-lg">
          {label}
        </p>
        {sub && (
          <p className="text-xs leading-relaxed text-muted-fg md:text-[13px]">
            {sub}
          </p>
        )}
      </div>
    </aside>
  );
}
