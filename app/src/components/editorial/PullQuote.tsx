type Props = {
  children: React.ReactNode;
  /** 引用元 (発言者など)。表示時に "—" を自動付与する。 */
  attribution?: string;
};

/**
 * 編集メディアの大型 pull quote。テラコッタの縦線 + 太字 JA、attribution は
 * mono uppercase で下に。長文の途中で「視覚的息継ぎ」 を作る。
 */
export function PullQuote({ children, attribution }: Props) {
  return (
    <blockquote className="my-10 border-l-[3px] border-primary pl-6">
      <p className="text-balance text-2xl font-extrabold leading-snug tracking-[-0.02em] text-foreground md:text-3xl">
        {children}
      </p>
      {attribution && (
        <p className="mt-3 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted-fg">
          — {attribution}
        </p>
      )}
    </blockquote>
  );
}
