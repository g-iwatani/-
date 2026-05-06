"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Locale } from "@/app/[locale]/dictionaries";

const locales: { code: Locale; label: string }[] = [
  { code: "ja", label: "JA" },
  { code: "en", label: "EN" },
];

type Props = {
  current: Locale;
};

export function LocaleSwitcher({ current }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchTo(target: Locale) {
    if (target === current) return;
    const segments = pathname.split("/");
    if (segments[1] === current) {
      segments[1] = target;
    } else {
      segments.splice(1, 0, target);
    }
    const next = segments.join("/") || `/${target}`;
    startTransition(() => router.push(next));
  }

  return (
    <div
      className="inline-flex items-center rounded-full border border-border bg-card p-0.5 text-xs font-semibold"
      data-pending={isPending ? "true" : undefined}
    >
      {locales.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => switchTo(l.code)}
          aria-pressed={current === l.code}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            current === l.code
              ? "bg-primary text-primary-fg"
              : "text-muted-fg hover:text-foreground"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
