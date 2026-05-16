/**
 * 脚注番号。本文中に [1] のように上付き表示。同記事末尾の引用元セクション
 * (id="sources") にスクロールアンカー。
 */
export function Cite({ n }: { n: number }) {
  return (
    <a
      href={`#source-${n}`}
      className="ml-px align-super font-mono text-[10px] font-extrabold text-primary no-underline hover:underline"
      aria-label={`脚注 ${n}`}
    >
      [{n}]
    </a>
  );
}
