import type { Locale } from "@/app/[locale]/dictionaries";

export function formatPrice(price: number, locale: Locale): string {
  if (locale === "en") {
    const usd = Math.round(price / 150);
    return `$${usd.toLocaleString("en-US")}`;
  }
  return `¥${price.toLocaleString("ja-JP")}`;
}

/**
 * Replaces {placeholders} in a translation string with values.
 */
export function format(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    String(values[key] ?? `{${key}}`),
  );
}
