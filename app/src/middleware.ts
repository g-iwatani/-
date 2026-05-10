import { NextResponse, type NextRequest } from "next/server";

const locales = ["ja", "en"] as const;
const defaultLocale = "ja";

/**
 * Next.js が special file として生成するメタ系のパス。
 * ロケールに依存しないルート直下のリソースなので、proxy で
 * /ja/ に書き換えてはいけない。
 */
const RESERVED_ROOT_PATHS = new Set<string>([
  "/sitemap.xml",
  "/robots.txt",
  "/opengraph-image",
  "/twitter-image",
  "/icon",
  "/apple-icon",
  "/manifest.webmanifest",
  "/manifest.json",
]);

function isReserved(pathname: string): boolean {
  if (RESERVED_ROOT_PATHS.has(pathname)) return true;
  // Image variants (e.g. /opengraph-image-1.png, /icon-1.png) や API routes
  if (pathname.startsWith("/api/")) return true;
  if (pathname.startsWith("/opengraph-image")) return true;
  if (pathname.startsWith("/twitter-image")) return true;
  if (pathname.startsWith("/icon")) return true;
  if (pathname.startsWith("/apple-icon")) return true;
  return false;
}

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isReserved(pathname)) return;

  const matchedLocale = locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (matchedLocale) {
    // Pass locale through to the root layout so <html lang> matches the URL.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale", matchedLocale);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\.).*)"],
};

