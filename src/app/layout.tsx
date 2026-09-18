import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import "./globals.css";
import { Analytics } from "@/components/analytics";
import { CartProvider } from "@/components/cart-provider";
import { CartDrawer } from "@/components/cart-drawer";
import { Cursor } from "@/components/cursor";
import { ScrollProgressBar } from "@/components/motion";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SmoothScroll } from "@/components/smooth-scroll";
import { siteCopy } from "@/db/seed-data";
import { JsonLd } from "@/components/json-ld";
import { siteUrl } from "@/lib/site";

/**
 * Шрифты лежат в репозитории (src/app/fonts, OFL): сборка не ходит в Google Fonts,
 * а значит не зависит от доступности fonts.googleapis.com на CI и у хостинга.
 * Оба файла — variable-шрифты, субсет latin + cyrillic.
 */
const display = localFont({
  src: "./fonts/Oswald-variable.woff2",
  weight: "200 700",
  variable: "--font-display-file",
  display: "swap",
  adjustFontFallback: "Arial",
});

const body = localFont({
  src: "./fonts/Inter-variable.woff2",
  weight: "100 900",
  variable: "--font-body-file",
  display: "swap",
  adjustFontFallback: "Arial",
});


export const metadata: Metadata = {
  title: {
    default: "G2 — стритвеар программа",
    template: "%s — G2",
  },
  description:
    "G2 — стритвеар бренд, вдохновлённый современной военной эстетикой: тяжёлый футер, мытый хлопок, техническая верхняя одежда и литые объекты.",
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  openGraph: {
    title: "G2 — стритвеар программа",
    description: siteCopy.tagline,
    locale: "ru_RU",
    type: "website",
    siteName: "G2",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={`${display.variable} ${body.variable}`}>
      <body className="grain bg-void text-bone antialiased">
        <a
          href="#content"
          className="eyebrow fixed left-5 top-5 z-[100] -translate-y-24 border border-bone/40 bg-void px-4 py-3 text-bone transition-transform duration-500 focus:translate-y-0"
        >
          К содержимому
        </a>
        <CartProvider>
          <SmoothScroll />
          <Cursor />
          <ScrollProgressBar />
          <SiteHeader />
          <main id="content" className="relative z-10 min-h-screen">{children}</main>
          <SiteFooter />
          <CartDrawer />
        </CartProvider>
        <Analytics />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": `${siteUrl}/#org`,
                name: siteCopy.brand,
                url: siteUrl,
                logo: `${siteUrl}/opengraph-image`,
                email: siteCopy.email,
                sameAs: [siteCopy.telegram, siteCopy.vk],
              },
              {
                "@type": "WebSite",
                "@id": `${siteUrl}/#site`,
                name: siteCopy.brand,
                url: siteUrl,
                inLanguage: "ru",
                publisher: { "@id": `${siteUrl}/#org` },
              },
            ],
          }}
        />
      </body>
    </html>
  );
}
