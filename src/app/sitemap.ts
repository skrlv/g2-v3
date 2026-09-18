import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/products";

import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

/** Статические разделы плюс все опубликованные товары. Без базы — только разделы. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/shop`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/delivery`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const products = await listProducts({});
    for (const product of products) {
      pages.push({
        url: `${siteUrl}/shop/${product.slug}`,
        lastModified: new Date(product.updatedAt),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch (error) {
    console.error("sitemap: каталог недоступен", error);
  }

  return pages;
}
