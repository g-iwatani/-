import type { MetadataRoute } from "next";
import { breeds } from "@/lib/breeds";
import { concerns } from "@/lib/concerns";
import { guides } from "@/lib/guides";
import { visibleProducts as products } from "@/lib/products";
import { absoluteUrl, site } from "@/lib/site";

const STATIC_PATHS = [
  "",
  "/search",
  "/results",
  "/popular",
  "/breeds",
  "/legal/affiliate",
  "/legal/privacy",
  "/legal/terms",
  "/legal/about",
  "/legal/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // Top-level redirect
  entries.push({
    url: site.url,
    lastModified: now,
    changeFrequency: "daily",
    priority: 1,
  });

  // Locale-prefixed static pages
  for (const locale of site.locales) {
    for (const path of STATIC_PATHS) {
      const fullPath = `/${locale}${path}`;
      entries.push({
        url: absoluteUrl(fullPath),
        lastModified: now,
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            site.locales.map((l) => [l, absoluteUrl(`/${l}${path}`)]),
          ),
        },
      });
    }
  }

  // Product detail pages (one per locale × product)
  for (const locale of site.locales) {
    for (const p of products) {
      entries.push({
        url: absoluteUrl(`/${locale}/products/${p.id}`),
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  // Guides — high-priority SEO pages
  for (const locale of site.locales) {
    for (const g of guides) {
      entries.push({
        url: absoluteUrl(`/${locale}/guides/${g.slug}`),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  // 悩み別 LP (canonical SEO surface)。?concerns= 付き /results は param URL で
  // Google が canonical 集約しないため、/concerns/[id] static page に一本化して
  // priority を上げる。各悩みを個別の SEO 着地点として育てる。
  for (const locale of site.locales) {
    for (const c of concerns) {
      entries.push({
        url: absoluteUrl(`/${locale}/concerns/${c.id}`),
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            site.locales.map((l) => [
              l,
              absoluteUrl(`/${l}/concerns/${c.id}`),
            ]),
          ),
        },
      });
    }
  }

  // 犬種別 LP (canonical SEO surface)。?breed= の /search は param URL で
  // canonical 集約しないため /breeds/[id] static page を SEO 主軸にする。
  for (const locale of site.locales) {
    for (const b of breeds) {
      if (b.id === "mix" || b.id.startsWith("unknown-")) continue;
      entries.push({
        url: absoluteUrl(`/${locale}/breeds/${b.id}`),
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            site.locales.map((l) => [l, absoluteUrl(`/${l}/breeds/${b.id}`)]),
          ),
        },
      });
    }
  }

  // Breed-prefilled search pages (副系・低優先)
  for (const locale of site.locales) {
    for (const b of breeds) {
      if (b.id === "mix" || b.id.startsWith("unknown-")) continue;
      entries.push({
        url: absoluteUrl(`/${locale}/search?breed=${b.id}`),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.3,
      });
    }
  }

  return entries;
}
