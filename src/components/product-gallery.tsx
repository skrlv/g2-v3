"use client";

import { useState } from "react";
import { ImageReveal } from "@/components/motion";
import { Picture, SIZES } from "@/components/picture";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const gallery = images.length ? images : ["/images/texture.jpg"];
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row md:gap-5">
      {gallery.length > 1 ? (
        <div className="no-scrollbar flex gap-3 overflow-x-auto md:w-20 md:flex-col md:overflow-visible">
          {gallery.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Изображение ${index + 1} из ${gallery.length}`}
              className={`relative aspect-4/5 w-16 shrink-0 overflow-hidden border transition-colors duration-500 md:w-full ${
                active === index ? "border-bone/60" : "border-transparent"
              }`}
            >
              <Picture
                src={image}
                alt=""
                sizes={SIZES.thumb}
                className={`object-cover transition-opacity duration-700 ${
                  active === index ? "opacity-100" : "opacity-50 hover:opacity-80"
                }`}
                imgProps={{ "aria-hidden": true }}
              />
            </button>
          ))}
        </div>
      ) : null}

      <div className="relative flex-1">
        <ImageReveal
          key={gallery[active]}
          src={gallery[active]}
          alt={name}
          priority
          sizes={SIZES.half}
          className="aspect-4/5 w-full bg-graphite"
        />
        <span className="meta absolute bottom-3 left-3 text-bone/60">
          {String(active + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
