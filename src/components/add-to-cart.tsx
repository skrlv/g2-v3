"use client";

import { useEffect, useRef, useState } from "react";
import { useBuyState } from "@/components/buy-state";
import { useCart } from "@/components/cart-provider";
import { SizeSelector } from "@/components/size-selector";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_CENTS } from "@/lib/catalog";

export type BuyableProduct = {
  slug: string;
  name: string;
  priceCents: number;
  currency: string;
  image: string | null;
  sizes: string[];
};

export function AddToCart({ product }: { product: BuyableProduct }) {
  const { addItem } = useCart();
  const { size, setSize, quantity, setQuantity, setMainVisible } = useBuyState();
  const [added, setAdded] = useState(false);
  const root = useRef<HTMLDivElement | null>(null);

  // Пока этот блок на экране, нижняя панель на телефоне не нужна.
  useEffect(() => {
    const node = root.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setMainVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      setMainVisible(true);
    };
  }, [setMainVisible]);

  function onAdd() {
    addItem({
      slug: product.slug,
      name: product.name,
      size,
      quantity,
      priceCents: product.priceCents,
      currency: product.currency,
      image: product.image,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  }

  return (
    <div ref={root} className="space-y-7">
      <SizeSelector sizes={product.sizes} value={size} onChange={setSize} />

      <div className="flex items-stretch gap-3">
        <div className="flex items-center border hairline">
          <button
            type="button"
            onClick={() => setQuantity((value) => value - 1)}
            className="h-full w-10 text-bone/70 transition-colors duration-400 hover:text-bone"
            aria-label="Уменьшить количество"
          >
            −
          </button>
          <span className="meta w-8 text-center text-bone">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((value) => value + 1)}
            className="h-full w-10 text-bone/70 transition-colors duration-400 hover:text-bone"
            aria-label="Увеличить количество"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={onAdd}
          data-cursor="hover"
          className="group flex flex-1 items-center justify-between border border-bone/25 px-5 py-4 transition-colors duration-700 ease-[var(--ease-premium)] hover:border-bone/70 hover:bg-bone hover:text-void"
        >
          <span className="eyebrow text-bone transition-colors duration-700 group-hover:text-void">
            {added ? "В корзине" : "В корзину"}
          </span>
          <span className="transition-transform duration-700 ease-[var(--ease-premium)] group-hover:translate-x-1.5">
            {added ? "✓" : "→"}
          </span>
        </button>
      </div>

      <p className="meta normal-case tracking-normal">
        Бесплатная доставка от {formatPrice(FREE_SHIPPING_CENTS)} · возврат 14 дней · отправка за 2–4 рабочих дня
      </p>
    </div>
  );
}

/**
 * Компактная панель покупки для мобильной страницы товара. Добавляет тот
 * размер и количество, что выбраны в основном блоке, и показывается только
 * когда основной блок ушёл с экрана.
 */
export function StickyBuyBar({ product }: { product: BuyableProduct }) {
  const { addItem } = useCart();
  const { size, quantity, mainVisible } = useBuyState();
  const [added, setAdded] = useState(false);

  if (mainVisible) return null;

  return (
    <div className="sticky bottom-0 z-30 border-t hairline bg-void/92 px-5 py-3 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-xs uppercase tracking-[0.1em] text-bone">
            {product.name}
          </p>
          <p className="meta">{formatPrice(product.priceCents, product.currency)}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            addItem({
              slug: product.slug,
              name: product.name,
              size,
              quantity,
              priceCents: product.priceCents,
              currency: product.currency,
              image: product.image,
            });
            setAdded(true);
            window.setTimeout(() => setAdded(false), 2000);
          }}
          className="shrink-0 border border-bone/30 px-4 py-3 text-[0.625rem] uppercase tracking-[0.18em] text-bone"
        >
          {added ? "Добавлено ✓" : `В корзину · ${size}`}
        </button>
      </div>
    </div>
  );
}
