"use client";

import type { Dictionary } from "@/app/[locale]/dictionaries";
import { showToast } from "@/lib/toast";

type Props = {
  url: string;
  title: string;
  dict: Dictionary;
};

/**
 * シェアボタン (X / LINE / URL コピー)。
 * URL コピーは clipboard API、トースト通知でフィードバック。
 * X / LINE は intent URL なので静的リンク (新規タブ)。
 */
export function ShareButtons({ url, title, dict }: Props) {
  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const lineHref = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      showToast({ message: dict.share.copied, type: "success" });
    } catch {
      // 古いブラウザ / iframe 内で失敗するケース。フォールバック: prompt
      if (typeof window !== "undefined") {
        window.prompt(dict.share.copy_fallback, url);
      }
    }
  }

  const baseBtn =
    "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold transition-colors";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs font-bold uppercase tracking-wide text-muted-fg">
        {dict.share.label}
      </span>
      <a
        href={xHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={dict.share.x}
        className={`${baseBtn} text-foreground hover:border-foreground`}
      >
        <span aria-hidden>𝕏</span>
        <span>{dict.share.x}</span>
      </a>
      <a
        href={lineHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={dict.share.line}
        className={`${baseBtn} text-emerald-700 hover:border-emerald-600`}
      >
        <span aria-hidden>💬</span>
        <span>{dict.share.line}</span>
      </a>
      <button
        type="button"
        onClick={copy}
        className={`${baseBtn} text-muted-fg hover:border-primary hover:text-primary`}
      >
        <span aria-hidden>🔗</span>
        <span>{dict.share.copy}</span>
      </button>
    </div>
  );
}
