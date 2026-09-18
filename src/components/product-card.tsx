"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { Picture, SIZES } from "@/components/picture";
import type { CardProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

export function ProductCard({
  product,
  index = 0,
  priority = false,
}: {
  product: CardProduct;
  index?: number;
  priority?: boolean;
}) {
  const { addItem } = useCart();
  const [hovered, setHovered] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const cover = product.cover;
  const alternate = product.alternate;

  function quickAdd(size: string) {
    addItem({
      slug: product.slug,
      name: product.name,
      size,
      priceCents: product.priceCents,
      currency: product.currency,
      image: cover,
    });
    setShowSizes(false);
  }

  return (
    <article
      className="group relative"
      style={{ "--reveal-delay": `${Math.min(index, 8) * 60}ms` } as React.CSSProperties}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setShowSizes(false);
      }}
    >
      <Link href={`/shop/${product.slug}`} className="block" data-cursor="hover">
        <div className="relative aspect-4/5 overflow-hidden bg-graphite">
          <Picture
            src={cover}
            alt={product.name}
            sizes={SIZES.card}
            priority={priority}
            className={`object-cover transition-all duration-[1400ms] ease-[var(--ease-premium)] ${
              hovered
                ? `scale-[1.03] ${alternate ? "opacity-0" : "opacity-100"}`
                : "scale-100 opacity-100"
            }`}
          />
          {alternate ? (
            <Picture
              src={alternate}
              alt=""
              sizes={SIZES.card}
              className={`object-cover transition-[opacity,transform] duration-[1400ms] ease-[var(--ease-premium)] ${
                hovered ? "scale-[1.03] opacity-100" : "scale-100 opacity-0"
              }`}
              imgProps={{ "aria-hidden": true }}
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-void/45 via-transparent to-transparent" />

          {product.hasModel ? (
            <span className="meta absolute left-3 top-3 text-bone/60">3D</span>
          ) : null}

          {/*
            Быстрый выбор размера. С мышью панель выезжает сама при наведении
            (group-hover в Tailwind v4 срабатывает только на устройствах с hover),
            на тач-экранах её открывает «+» под карточкой.
          */}
          {product.sizes.length > 1 ? (
            <div
              className={`absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-1 border-t border-bone/15 bg-void/88 p-2 backdrop-blur-md transition-[opacity,transform] duration-500 ease-[var(--ease-premium)] group-hover:translate-y-0 group-hover:opacity-100 ${
                showSizes ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
              aria-hidden={!showSizes && !hovered}
            >
              <span className="meta mr-1 hidden text-[0.5625rem] text-bone/55 sm:block">Размер</span>
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  tabIndex={showSizes ? 0 : -1}
                  onClick={(event) => {
                    event.preventDefault();
                    quickAdd(size);
                  }}
                  className="min-w-9 border border-bone/20 px-2 py-1.5 text-[0.625rem] uppercase tracking-[0.16em] text-bone transition-colors duration-400 hover:border-bone/60 hover:bg-bone hover:text-void"
                >
                  {size}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </Link>

      <div className="mt-3 flex items-start justify-between gap-3 border-b hairline pb-3 sm:mt-3.5 sm:gap-4">
        <div className="min-w-0 space-y-1.5">
          <Link
            href={`/shop/${product.slug}`}
            className="block truncate text-[0.75rem] uppercase tracking-[0.08em] text-bone sm:text-[0.8125rem]"
          >
            {product.name}
          </Link>
          <p className="meta text-bone/70">
            {formatPrice(product.priceCents, product.currency)}
          </p>
        </div>
        {product.sizes.length > 1 ? (
          <button
            type="button"
            aria-label={`Быстро добавить ${product.name}`}
            onClick={() => setShowSizes((open) => !open)}
            className="flex h-6 w-6 shrink-0 items-center justify-center text-lg font-light leading-none text-bone/55 transition-colors duration-500 hover:text-bone"
          >
            <span
              className={showSizes ? "rotate-45 transition-transform duration-500" : "transition-transform duration-500"}
            >
              +
            </span>
          </button>
        ) : (
          <button
            type="button"
            aria-label={`Добавить ${product.name}`}
            onClick={() => quickAdd(product.sizes[0] ?? "ONE SIZE")}
            className="flex h-6 w-6 shrink-0 items-center justify-center text-lg font-light leading-none text-bone/55 transition-colors duration-500 hover:text-bone"
          >
            +
          </button>
        )}
      </div>
    </article>
  );
}
