import { NextResponse, type NextRequest } from "next/server";

const locales = ["ja", "en"] as const;
const defaultLocale = "ja";

function detectLocale(request: NextRequest): (typeof locales)[number] {
  const accept = request.headers.get("accept-language") ?? "";
  const lower = accept.toLowerCase();
  if (lower.startsWith("en")) return "en";
  for (const candidate of accept.split(",")) {
    const tag = candidate.split(";")[0]?.trim().toLowerCase();
    if (!tag) continue;
    if (tag.startsWith("ja")) return "ja";
    if (tag.startsWith("en")) return "en";
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return;

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\.).*)"],
};
