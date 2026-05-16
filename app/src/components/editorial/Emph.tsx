/**
 * 本文中の強調。黄色マーカー (linear-gradient で下半分塗り) + 太字。
 * 通常の <strong> より視覚的なヒエラルキー優先で、長文の中で「ここが要点」
 * を一目で識別できる。
 */
export function Emph({ children }: { children: React.ReactNode }) {
  return (
    <strong
      className="font-bold text-foreground"
      style={{
        backgroundImage:
          "linear-gradient(180deg, transparent 60%, #fce6d8 60%)",
        padding: "0 2px",
      }}
    >
      {children}
    </strong>
  );
}
