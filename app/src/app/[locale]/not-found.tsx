import Link from "next/link";
import { defaultLocale, getDictionary } from "./dictionaries";

/**
 * locale 配下のページで notFound() が呼ばれた時のフォールバック。
 * Next.js の規約上、params から locale を読めない (server component の
 * 制約) ので、デフォルト言語を引き当てる。
 *
 * 救済リンクで離脱を最小化: 検索 / ガイド / ホーム の 3 入口を提示。
 */
export default async function NotFound() {
  const dict = await getDictionary(defaultLocale);
  const root = `/${defaultLocale}`;
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 py-16 text-center">
      <p className="text-7xl font-black text-primary md:text-8xl">404</p>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
        {dict.not_found.title}
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-fg md:text-base">
        {dict.not_found.body}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={root}
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-fg shadow-md hover:opacity-90"
        >
          {dict.not_found.cta_home}
        </Link>
        <Link
          href={`${root}/search`}
          className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:border-primary hover:text-primary"
        >
          {dict.not_found.cta_search}
        </Link>
        <Link
          href={`${root}/guides/harness-buying-guide`}
          className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:border-primary hover:text-primary"
        >
          {dict.not_found.cta_guides}
        </Link>
      </div>
    </div>
  );
}
