import Link from "next/link";

/**
 * locale プレフィックスを持たない URL (未マッチ) 用のグローバル 404。
 * locale 専用 dict が無いので最低限の bilingual 文言。クリックで /ja に誘導。
 */
export default function GlobalNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 py-16 text-center">
      <p className="text-7xl font-black text-primary md:text-8xl">404</p>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
        ページが見つかりませんでした
        <br />
        <span className="text-base text-muted-fg">Page not found</span>
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-fg md:text-base">
        URL に間違いがあるか、ページが移動・削除された可能性があります。
        トップページから探し直してください。
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/ja"
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-fg shadow-md hover:opacity-90"
        >
          日本語ホームへ
        </Link>
        <Link
          href="/en"
          className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:border-primary hover:text-primary"
        >
          English home
        </Link>
      </div>
    </div>
  );
}
