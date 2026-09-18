"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart, itemKey } from "@/components/cart-provider";
import { Picture, SIZES } from "@/components/picture";
import { trackPurchase } from "@/lib/analytics";
import { formatPrice } from "@/lib/format";
import { formatPhoneInput } from "@/lib/phone";
import { DEFAULT_ZONE_ID, SHIPPING_ZONES, describeShipping, quoteShipping } from "@/lib/shipping";

type Status = "idle" | "sending" | "done" | "error";
type Placed = {
  reference: string;
  subtotalCents: number;
  totalCents: number;
  shippingCents: number | null;
  email: string;
  emailed: boolean;
};

const ZONE_KEY = "g2.zone";

function rememberedZone(): string {
  try {
    const value = window.localStorage.getItem(ZONE_KEY);
    if (value && SHIPPING_ZONES.some((zone) => zone.id === value)) return value;
  } catch {
    /* нет доступа к localStorage */
  }
  return DEFAULT_ZONE_ID;
}

const fieldClass =
  "w-full border hairline bg-transparent px-3 py-3 text-sm placeholder:text-smoke focus:border-bone/40 focus:outline-none";

export function CartDrawer() {
  const { items, isOpen, closeCart, subtotalCents, currency, setQuantity, removeItem, clear } =
    useCart();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [placed, setPlaced] = useState<Placed | null>(null);
  const [form, setForm] = useState({ email: "", phone: "", customerName: "", note: "" });
  const [zoneId, setZoneId] = useState(DEFAULT_ZONE_ID);

  // Регион запоминается на устройстве; читается после монтирования, чтобы не расходиться с сервером.
  useEffect(() => {
    setZoneId(rememberedZone());
  }, []);

  function chooseZone(next: string) {
    setZoneId(next);
    try {
      window.localStorage.setItem(ZONE_KEY, next);
    } catch {
      /* нет доступа к localStorage */
    }
  }

  const shipping = quoteShipping(subtotalCents, zoneId);
  const totalCents = subtotalCents + (shipping.cents ?? 0);
  const freeFrom = shipping.zone.freeFromCents;

  useEffect(() => {
    if (isOpen) {
      setStatus((current) => (current === "done" ? "idle" : current));
    }
  }, [isOpen]);

  async function submitOrder(event: React.FormEvent) {
    event.preventDefault();
    if (!items.length) return;
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          shippingZone: zoneId,
          items: items.map((item) => ({
            slug: item.slug,
            size: item.size,
            quantity: item.quantity,
          })),
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        order?: {
          reference: string;
          subtotalCents: number;
          totalCents: number;
          shippingCents: number | null;
          emailed?: boolean;
        };
      };
      if (!response.ok || !data.order) {
        throw new Error(data.error ?? "Не удалось оформить заказ");
      }
      setPlaced({
        reference: data.order.reference,
        subtotalCents: data.order.subtotalCents,
        totalCents: data.order.totalCents,
        shippingCents: data.order.shippingCents,
        email: form.email,
        emailed: Boolean(data.order.emailed),
      });
      setStatus("done");
      trackPurchase({
        id: data.order.reference,
        revenue: data.order.totalCents / 100,
        shipping: (data.order.shippingCents ?? 0) / 100,
        products: items.map((item) => ({
          id: item.slug,
          name: item.name,
          price: item.priceCents / 100,
          quantity: item.quantity,
          variant: item.size,
        })),
      });
      clear();
      setForm((current) => ({ ...current, note: "" }));
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Не удалось оформить заказ");
    }
  }

  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-[80] ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      <button
        type="button"
        tabIndex={isOpen ? 0 : -1}
        aria-label="Закрыть корзину"
        onClick={closeCart}
        className={`absolute inset-0 bg-void/70 backdrop-blur-[2px] transition-opacity duration-700 ease-[var(--ease-premium)] ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-[26rem] flex-col border-l hairline bg-carbon transition-transform duration-[900ms] ease-[var(--ease-premium)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b hairline px-5 py-5">
          <span className="eyebrow">Корзина / {String(items.length).padStart(2, "0")}</span>
          <button
            type="button"
            onClick={closeCart}
            className="eyebrow text-bone/70 transition-colors duration-500 hover:text-bone"
          >
            Закрыть
          </button>
        </div>

        <div data-lenis-prevent className="flex-1 overflow-y-auto px-5 py-6">
          {status === "done" && placed ? (
            <div className="space-y-4">
              <p className="eyebrow">Заказ принят</p>
              <p className="type-display text-2xl">№ {placed.reference}</p>
              <p className="text-sm leading-relaxed text-mist">
                {placed.shippingCents === null
                  ? `Товары на ${formatPrice(placed.subtotalCents, currency)}, доставку посчитаем при подтверждении.`
                  : `Итого ${formatPrice(placed.totalCents, currency)}, доставка ${
                      placed.shippingCents === 0 ? "бесплатно" : formatPrice(placed.shippingCents, currency)
                    }.`}{" "}
                {placed.emailed
                  ? `Подтверждение отправили на ${placed.email}.`
                  : `Мы напишем на ${placed.email} или позвоним.`}{" "}
                Подтвердим наличие и пришлём способ оплаты. Сохраните номер заказа.
              </p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="eyebrow inline-block border border-bone/20 px-4 py-3 text-bone"
              >
                В каталог
              </Link>
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-start justify-center gap-5">
              <p className="eyebrow">Корзина пуста</p>
              <p className="type-display text-3xl">
                Ничего
                <br />
                не выбрано
              </p>
              {placed ? (
                <p className="meta normal-case tracking-normal">
                  Последний заказ № {placed.reference} принят, мы на связи.
                </p>
              ) : null}
              <Link
                href="/shop"
                onClick={closeCart}
                className="eyebrow border border-bone/20 px-4 py-3 text-bone transition-colors duration-500 hover:border-bone/50"
              >
                Открыть каталог
              </Link>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => {
                const key = itemKey(item);
                return (
                  <li key={key} className="flex gap-4 border-b hairline pb-6">
                    <Link
                      href={`/shop/${item.slug}`}
                      onClick={closeCart}
                      className="relative h-28 w-20 shrink-0 overflow-hidden bg-graphite"
                    >
                      {item.image ? (
                        <Picture src={item.image} alt={item.name} sizes={SIZES.thumb} className="object-cover" />
                      ) : null}
                    </Link>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="space-y-1">
                        <Link
                          href={`/shop/${item.slug}`}
                          onClick={closeCart}
                          className="block text-sm uppercase tracking-[0.06em]"
                        >
                          {item.name}
                        </Link>
                        <p className="meta">Размер {item.size}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border hairline">
                          <button
                            type="button"
                            aria-label="Уменьшить количество"
                            onClick={() => setQuantity(key, item.quantity - 1)}
                            className="h-8 w-8 text-sm text-bone/70 transition-colors duration-400 hover:text-bone"
                          >
                            −
                          </button>
                          <span className="meta w-7 text-center text-bone">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Увеличить количество"
                            onClick={() => setQuantity(key, item.quantity + 1)}
                            className="h-8 w-8 text-sm text-bone/70 transition-colors duration-400 hover:text-bone"
                          >
                            +
                          </button>
                        </div>
                        <span className="meta text-bone">
                          {formatPrice(item.priceCents * item.quantity, item.currency)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(key)}
                      className="meta self-start text-bone/40 transition-colors duration-400 hover:text-bone"
                      aria-label={`Удалить ${item.name}`}
                    >
                      ✕
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && status !== "done" ? (
          <form onSubmit={submitOrder} className="space-y-4 border-t hairline px-5 py-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="meta">Товары</span>
                <span className="meta text-bone">{formatPrice(subtotalCents, currency)}</span>
              </div>

              {/* Регион и стоимость доставки — из той же таблицы, что на странице «Доставка» */}
              <label className="flex items-center justify-between gap-4">
                <span className="meta">Доставка</span>
                <select
                  value={zoneId}
                  onChange={(event) => chooseZone(event.target.value)}
                  aria-label="Регион доставки"
                  className="max-w-[60%] border hairline bg-transparent px-3 py-2 text-[0.625rem] uppercase tracking-[0.16em] text-bone focus:border-bone/40 focus:outline-none"
                >
                  {SHIPPING_ZONES.map((zone) => (
                    <option key={zone.id} value={zone.id} className="bg-carbon">
                      {zone.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-baseline justify-between gap-4">
                <span className="meta normal-case tracking-normal">{shipping.zone.term}</span>
                <span className="meta normal-case tracking-normal text-right text-bone">
                  {describeShipping(shipping, (cents) => formatPrice(cents, currency))}
                </span>
              </div>

              {/* Линейка до бесплатной доставки: та же мерная шкала, что и в герое */}
              {freeFrom !== null ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="meta normal-case tracking-normal">
                      {shipping.free
                        ? "Доставка бесплатно"
                        : `До бесплатной доставки — ${formatPrice(freeFrom - subtotalCents, currency)}`}
                    </span>
                    <span className="meta">
                      {Math.min(100, Math.round((subtotalCents / freeFrom) * 100))
                        .toString()
                        .padStart(2, "0")}
                      %
                    </span>
                  </div>
                  <div className="relative h-px w-full bg-bone/15" aria-hidden="true">
                    <div
                      className="absolute inset-y-0 left-0 bg-bone/80 transition-[width] duration-700 ease-[var(--ease-premium)]"
                      style={{ width: `${Math.min(100, (subtotalCents / freeFrom) * 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="meta normal-case tracking-normal">Пошлины за пределами России оплачивает получатель.</p>
              )}

              <div className="flex items-center justify-between border-t hairline pt-3">
                <span className="eyebrow">{shipping.cents === null ? "Итого без доставки" : "Итого"}</span>
                <span className="type-display text-xl">{formatPrice(totalCents, currency)}</span>
              </div>
            </div>
            <div className="grid gap-3">
              <input
                required
                type="email"
                autoComplete="email"
                aria-label="Ваш email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="Ваш email"
                className={fieldClass}
              />
              <input
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                aria-label="Телефон"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: formatPhoneInput(event.target.value) })}
                placeholder="+7 (999) 123-45-67"
                className={fieldClass}
              />
              <input
                type="text"
                autoComplete="name"
                aria-label="Имя"
                value={form.customerName}
                onChange={(event) => setForm({ ...form, customerName: event.target.value })}
                placeholder="Имя"
                className={fieldClass}
              />
              <textarea
                rows={2}
                aria-label="Адрес доставки или комментарий"
                value={form.note}
                onChange={(event) => setForm({ ...form, note: event.target.value })}
                placeholder="Адрес доставки или комментарий"
                className={`${fieldClass} resize-none`}
              />
            </div>
            {message ? <p className="meta text-bone">{message}</p> : null}
            <button
              type="submit"
              disabled={status === "sending"}
              className="flex w-full items-center justify-between border border-bone/25 px-4 py-4 text-left transition-colors duration-500 hover:border-bone/60 disabled:opacity-50"
            >
              <span className="eyebrow text-bone">
                {status === "sending" ? "Отправка" : "Оформить заказ"}
              </span>
              <span className="text-bone">→</span>
            </button>
            <p className="meta normal-case tracking-normal text-smoke">
              После оформления мы свяжемся с вами по почте или телефону, подтвердим наличие
              и пришлём способ оплаты: карта, СБП или счёт.
            </p>
          </form>
        ) : null}
      </aside>
    </div>
  );
}
