/**
 * Цели и события для Яндекс.Метрики. Счётчик подключается компонентом
 * <Analytics /> по NEXT_PUBLIC_YM_ID; без него все вызовы — пустые операции,
 * поэтому компоненты зовут track() безусловно.
 *
 * Цели, которые нужно завести в Метрике (тип «JavaScript-событие», идентификаторы):
 *   add_to_cart · order · subscribe · contact
 * Электронная коммерция включена через dataLayer — в настройках счётчика
 * поставьте галочку «Электронная коммерция», контейнер «dataLayer».
 */
declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export type Goal = "add_to_cart" | "order" | "subscribe" | "contact";

export const YM_ID = Number(process.env.NEXT_PUBLIC_YM_ID || 0) || null;

export function track(goal: Goal, params?: Record<string, unknown>): void {
  if (typeof window === "undefined" || !YM_ID || !window.ym) return;
  try {
    window.ym(YM_ID, "reachGoal", goal, params);
  } catch {
    /* счётчик заблокирован блокировщиком — не наша проблема */
  }
}

type EcommerceProduct = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
  brand?: string;
};

function pushEcommerce(payload: Record<string, unknown>): void {
  if (typeof window === "undefined" || !YM_ID) return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ ecommerce: { currencyCode: "RUB", ...payload } });
}

/** Товар добавлен в корзину. Цена — в рублях. */
export function trackAddToCart(product: EcommerceProduct): void {
  track("add_to_cart", { id: product.id, price: product.price });
  pushEcommerce({ add: { products: [{ brand: "G2", ...product }] } });
}

/** Заказ оформлен: цель с доходом плюс событие purchase для отчёта «Заказы». */
export function trackPurchase(order: {
  id: string;
  revenue: number;
  shipping?: number;
  products: EcommerceProduct[];
}): void {
  track("order", { order_id: order.id, revenue: order.revenue });
  pushEcommerce({
    purchase: {
      actionField: { id: order.id, revenue: order.revenue, shipping: order.shipping ?? 0 },
      products: order.products.map((product) => ({ brand: "G2", ...product })),
    },
  });
}
