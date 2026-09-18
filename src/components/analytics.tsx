"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { YM_ID } from "@/lib/analytics";

/**
 * Яндекс.Метрика. Подключается только когда задан NEXT_PUBLIC_YM_ID.
 * Вебвизор выключен по умолчанию (он записывает экраны с данными покупателей);
 * включается NEXT_PUBLIC_YM_WEBVISOR=true, если это отражено в политике конфиденциальности.
 * Переходы внутри сайта (App Router не перезагружает страницу) отправляются как hit.
 */
function RouteHits() {
  const pathname = usePathname();
  const search = useSearchParams();
  const first = useRef(true);

  useEffect(() => {
    if (!YM_ID || !window.ym) return;
    // первый показ засчитывает сам счётчик при инициализации
    if (first.current) {
      first.current = false;
      return;
    }
    const query = search.toString();
    window.ym(YM_ID, "hit", query ? `${pathname}?${query}` : pathname);
  }, [pathname, search]);

  return null;
}

export function Analytics() {
  if (!YM_ID) return null;
  const webvisor = process.env.NEXT_PUBLIC_YM_WEBVISOR === "true";
  return (
    <>
      <Script id="ym-init" strategy="afterInteractive">
        {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
ym(${YM_ID}, "init", { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: ${webvisor}, ecommerce: "dataLayer" });`}
      </Script>
      <noscript>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://mc.yandex.ru/watch/${YM_ID}`} style={{ position: "absolute", left: -9999 }} alt="" />
        </div>
      </noscript>
      <Suspense fallback={null}>
        <RouteHits />
      </Suspense>
    </>
  );
}
