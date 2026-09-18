import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

/** Студия и API закрыты от индексации; карта сайта — в sitemap.ts. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
