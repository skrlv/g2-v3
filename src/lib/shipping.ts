import { FREE_SHIPPING_CENTS } from "@/lib/catalog";

/**
 * Зоны доставки — единый источник для страницы /delivery, корзины и заказа.
 * Значения перенесены из прежней таблицы на странице «Доставка».
 *
 * `priceCents: null` — тариф в источнике не указан (Москва и МО ниже порога):
 * покупателю показывается «уточним при подтверждении», в сумму заказа не входит.
 * Когда тариф известен — впишите число, и корзина, письмо и Telegram подхватят его сами.
 * `freeFromCents` — порог бесплатной доставки для зоны; для зарубежья его нет,
 * пошлины оплачивает получатель.
 */
export type ShippingZone = {
  id: string;
  label: string;
  term: string;
  priceCents: number | null;
  freeFromCents: number | null;
};

export const SHIPPING_ZONES: ShippingZone[] = [
  {
    id: "moscow",
    label: "Россия, Москва и МО",
    term: "1–2 рабочих дня",
    priceCents: null,
    freeFromCents: FREE_SHIPPING_CENTS,
  },
  {
    id: "russia",
    label: "Россия, регионы",
    term: "3–7 рабочих дней",
    priceCents: 79_000,
    freeFromCents: FREE_SHIPPING_CENTS,
  },
  { id: "cis", label: "СНГ", term: "5–10 рабочих дней", priceCents: 190_000, freeFromCents: null },
  { id: "europe", label: "Европа", term: "7–12 рабочих дней", priceCents: 240_000, freeFromCents: null },
  { id: "world", label: "Остальной мир", term: "10–18 рабочих дней", priceCents: 350_000, freeFromCents: null },
];

export const DEFAULT_ZONE_ID = "russia";

export function getZone(id: string | null | undefined): ShippingZone {
  return SHIPPING_ZONES.find((zone) => zone.id === id) ?? SHIPPING_ZONES[1];
}

export type ShippingQuote = {
  zone: ShippingZone;
  /** Стоимость в копейках; null — тариф уточняется при подтверждении. */
  cents: number | null;
  free: boolean;
};

/** Стоимость доставки для суммы товаров и зоны. */
export function quoteShipping(subtotalCents: number, zoneId: string | null | undefined): ShippingQuote {
  const zone = getZone(zoneId);
  const free = zone.freeFromCents !== null && subtotalCents >= zone.freeFromCents;
  if (free) return { zone, cents: 0, free: true };
  return { zone, cents: zone.priceCents, free: false };
}

/** Текст стоимости для таблицы и корзины. `formatPrice` передаётся, чтобы модуль не тянул формат в клиент дважды. */
export function describeShipping(
  quote: ShippingQuote,
  formatPrice: (cents: number) => string,
): string {
  if (quote.free) return "бесплатно";
  if (quote.cents === null) return "по тарифу курьера — уточним при подтверждении";
  return formatPrice(quote.cents);
}

/** Строка тарифа для страницы «Доставка». */
export function describeZoneRate(zone: ShippingZone, formatPrice: (cents: number) => string): string {
  const parts: string[] = [];
  if (zone.priceCents !== null) parts.push(formatPrice(zone.priceCents));
  else parts.push("по тарифу курьера");
  if (zone.freeFromCents !== null) parts.push(`бесплатно от ${formatPrice(zone.freeFromCents)}`);
  return parts.join(" · ");
}
