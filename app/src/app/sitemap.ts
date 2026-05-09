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

  // Concern result pages (deep-linked filter)
  for (const locale of site.locales) {
    for (const c of concerns) {
      entries.push({
        url: absoluteUrl(`/${locale}/results?concerns=${c.id}`),
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
  }

  // Breed-prefilled search pages
  for (const locale of site.locales) {
    for (const b of breeds) {
      if (b.id === "mix" || b.id.startsWith("unknown-")) continue;
      entries.push({
        url: absoluteUrl(`/${locale}/search?breed=${b.id}`),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.4,
      });
    }
  }

  return entries;
}
