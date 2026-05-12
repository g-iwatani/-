import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // クロール対象から外したい薄いページ:
        //   /api/    … 内部 API endpoint
        //   /*/find  … ヘッダ検索 box の遷移先。query 駆動で canonical が
        //              無いため Google が無限に索引候補を生成する。
        //              page.tsx 側でも meta robots noindex が指定済だが、
        //              robots.txt でクロール自体を抑制しクォータを節約。
        //
        // /results は意図的に索引対象 (sitemap でも公開している) ため
        // disallow しない。canonical の concern LP に集約させたい query
        // パターンは概要を sitemap 側で /concerns/[id] に流している。
        // /search は /my-dog に 308 redirect 済み (next.config.ts)。
        disallow: ["/api/", "/*/find"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
