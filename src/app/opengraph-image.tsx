import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteCopy } from "@/db/seed-data";

/**
 * Превью для соцсетей (Open Graph / Twitter) для всех страниц без своего
 * изображения: страницы товаров отдают фото из generateMetadata.
 * Рисуется на сервере: знак «G2» в Oswald с фирменным наклоном на фоне void,
 * измерительная колонка справа, слоган и координаты внизу — как в герое.
 */
export const alt = "G2 — стритвеар программа";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const VOID = "#060606";
const BONE = "#f3f2ee";
const SMOKE = "#6d6e72";
const MIST = "#9d9ea2";

export default async function OpenGraphImage() {
  const [oswald, inter] = await Promise.all([
    readFile(join(process.cwd(), "src/app/fonts/Oswald-700-og.ttf")),
    readFile(join(process.cwd(), "src/app/fonts/Inter-400-og.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: VOID,
          color: BONE,
          padding: "56px 64px",
          fontFamily: "Inter",
          position: "relative",
        }}
      >
        {/* измерительная колонка */}
        <div
          style={{
            position: "absolute",
            right: 64,
            top: 96,
            width: 1,
            height: 438,
            background: "rgba(243,242,238,0.25)",
            display: "flex",
          }}
        />
        {[96, 315, 533].map((top) => (
          <div
            key={top}
            style={{
              position: "absolute",
              right: 58,
              top,
              width: 13,
              height: 1,
              background: "rgba(243,242,238,0.4)",
              display: "flex",
            }}
          />
        ))}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 18, letterSpacing: "0.14em", color: SMOKE, textTransform: "uppercase" }}>
            {siteCopy.season}
          </span>
          <span style={{ fontSize: 18, letterSpacing: "0.14em", color: SMOKE, marginRight: 64 }}>
            {siteCopy.coordinates}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Oswald",
              fontSize: 300,
              lineHeight: 0.86,
              letterSpacing: "-0.06em",
              transform: "skewX(-6deg)",
              transformOrigin: "left bottom",
              marginLeft: 8,
            }}
          >
            <span>G</span>
            <span style={{ transform: "translateY(-6px) scaleX(0.92)", marginLeft: 4 }}>2</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 44,
              fontFamily: "Oswald",
              fontSize: 34,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: MIST,
            }}
          >
            {siteCopy.tagline}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Oswald", data: oswald, weight: 700, style: "normal" },
        { name: "Inter", data: inter, weight: 400, style: "normal" },
      ],
    },
  );
}
