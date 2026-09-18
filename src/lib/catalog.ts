/**
 * Каталожная терминология, безопасная для клиентских компонентов
 * (без импорта драйвера базы данных).
 */

/** Единственная валюта магазина. Цены хранятся в копейках. */
export const STORE_CURRENCY = "RUB";

/** Порог бесплатной доставки, в копейках (25 000 ₽). Один источник для корзины и текстов. */
export const FREE_SHIPPING_CENTS = 2_500_000;

/**
 * Общая фактура-заглушка: подставляется вместо отсутствующего фото и стоит
 * вторым кадром у товаров из стартового каталога. Вторым кадром карточки при
 * наведении она быть не должна — вещь пропадала бы с экрана.
 */
export const PLACEHOLDER_IMAGE = "/images/texture.jpg";

export const SORT_OPTIONS = [
  { value: "editorial", label: "Порядок студии" },
  { value: "price-asc", label: "Цена — по возрастанию" },
  { value: "price-desc", label: "Цена — по убыванию" },
  { value: "name", label: "По алфавиту" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export function isSortValue(value: string | undefined): value is SortValue {
  return SORT_OPTIONS.some((option) => option.value === value);
}

export type Category = {
  slug: string;
  label: string;
  count: number;
};

export type ProductDetailShape = {
  label: string;
  value: string;
};

/**
 * Обычная ссылка на картинку (путь из /public или http-адрес).
 * Фото из студии хранятся как data-URL в мегабайты длиной — их нельзя таскать
 * в корзину (лимит localStorage) и в заказы; для них возвращается null.
 */
export function pathOnly(src: string | null | undefined): string | null {
  if (!src) return null;
  const value = src.trim();
  if (value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  return null;
}

/** Данные карточки в сетке — только то, что нужно для отрисовки, без текстов и лишних фото. */
export type CardProduct = {
  slug: string;
  name: string;
  priceCents: number;
  currency: string;
  cover: string;
  alternate: string | null;
  sizes: string[];
  hasModel: boolean;
};
