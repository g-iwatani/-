"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * locale 配下のサーバ/クライアントエラー境界。
 * Next.js の規約上 client component 必須 + reset() でリトライできる。
 *
 * dict にアクセスできない (use client + getDictionary は server-only) ため
 * 最低限の bilingual 文言で逃げる。
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 本番では Cloudflare Workers のログに出る。digest は SSR で生成される
    // エラー識別子で問い合わせ時の手がかりになる。
    console.error("[locale/error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 py-16 text-center">
      <p className="text-5xl font-black text-primary md:text-6xl">
        Something went wrong
      </p>
      <h1 className="mt-4 text-xl font-extrabold tracking-tight text-foreground md:text-2xl">
        ページの表示中にエラーが発生しました
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-fg md:text-base">
        時間をおいて再度お試しください。問題が続く場合はお問い合わせから
        ご連絡をお願いします。
      </p>
      {error.digest && (
        <p className="mt-3 text-[11px] text-muted-fg">
          エラーID: <code className="font-mono">{error.digest}</code>
        </p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-fg shadow-md hover:opacity-90"
        >
          再読み込み
        </button>
        <Link
          href="/ja"
          className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:border-primary hover:text-primary"
        >
          ホームへ
        </Link>
      </div>
    </div>
  );
}
