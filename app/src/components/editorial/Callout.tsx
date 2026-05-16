type Kind = "tip" | "warning" | "supervisor";

type Props = {
  kind?: Kind;
  /** カードヘッダの題名 (任意)。 */
  title?: string;
  children: React.ReactNode;
};

const palettes: Record<Kind, { bg: string; accent: string; label: string }> = {
  tip: { bg: "bg-muted", accent: "border-l-primary", label: "TIP" },
  warning: {
    bg: "bg-[#fde6d8]",
    accent: "border-l-[#b85b36]",
    label: "WARNING",
  },
  supervisor: {
    bg: "bg-accent-soft",
    accent: "border-l-accent",
    label: "監修者コメント",
  },
};

const labelColor: Record<Kind, string> = {
  tip: "text-primary",
  warning: "text-[#b85b36]",
  supervisor: "text-accent",
};

/**
 * 編集メディアの汎用 callout box。3 種 (tip / warning / supervisor) を kind で
 * 切替える。左に色アクセントの太枠、上段に mono ラベル + 題名、本文。
 */
export function Callout({ kind = "tip", title, children }: Props) {
  const palette = palettes[kind];
  return (
    <aside
      className={`my-8 border-l-4 ${palette.accent} ${palette.bg} rounded-l-sm rounded-r-xl p-6 md:p-7`}
    >
      <div className="mb-2 flex items-center gap-3">
        <span
          className={`font-mono text-[10px] font-extrabold uppercase tracking-[0.16em] ${labelColor[kind]}`}
        >
          {palette.label}
        </span>
        {title && (
          <span className="text-sm font-extrabold text-foreground">
            {title}
          </span>
        )}
      </div>
      <div className="text-pretty text-sm leading-relaxed text-foreground md:text-[15px]">
        {children}
      </div>
    </aside>
  );
}
