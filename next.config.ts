import type { NextConfig } from "next";

/** Хост объектного хранилища (S3_PUBLIC_URL) — единственный внешний хост, чьи картинки оптимизирует next/image. */
const imageHost = (() => {
  try {
    return process.env.S3_PUBLIC_URL ? new URL(process.env.S3_PUBLIC_URL).host : "";
  } catch {
    return "";
  }
})();

const nextConfig: NextConfig = {
  // Самодостаточный сервер для деплоя в Docker / на VPS. На Vercel не мешает.
  output: "standalone",
  env: { NEXT_PUBLIC_IMAGE_HOST: imageHost },
  images: {
    formats: ["image/avif", "image/webp"],
    // фото товаров живут в сетке годами — кэш оптимизированных версий на месяц
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: imageHost ? [{ protocol: "https", hostname: imageHost }] : [],
  },
  // Шрифты для серверной картинки Open Graph читаются с диска — в standalone-сборку их надо включить.
  outputFileTracingIncludes: {
    "/opengraph-image": ["./src/app/fonts/*.ttf"],
  },
};

export default nextConfig;
