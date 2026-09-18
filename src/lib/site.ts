/**
 * Адрес сайта для абсолютных ссылок: метаданные, sitemap, robots, письма, JSON-LD.
 * NEXT_PUBLIC_SITE_URL задаётся на хостинге; на Vercel без неё берётся адрес деплоя.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

/** Абсолютный адрес для пути или уже абсолютной ссылки; data-URL возвращается как есть. */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^(https?:)?\/\//.test(pathOrUrl) || pathOrUrl.startsWith("data:")) return pathOrUrl;
  return `${siteUrl}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}
