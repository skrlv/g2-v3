import { STORE_CURRENCY } from "@/lib/catalog";

/** Цена хранится в копейках, чтобы оформление заказа было корректным. */
export function formatPrice(cents: number, currency: string = STORE_CURRENCY): string {
  const amount = cents / 100;
  const hasFraction = Math.round(amount * 100) % 100 !== 0;
  const fixed = amount.toFixed(hasFraction ? 2 : 0);
  const [integer, fraction] = fixed.split(".");
  // 8900 → 8 900 (пробел как разделитель разрядов, как в референсе)
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const number = fraction ? `${grouped},${fraction}` : grouped;

  const symbol =
    currency === "RUB"
      ? "₽"
      : currency === "EUR"
        ? "€"
        : currency === "USD"
          ? "$"
          : currency;

  return `${number} ${symbol}`;
}

export function formatDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const months = [
    "01", "02", "03", "04", "05", "06",
    "07", "08", "09", "10", "11", "12",
  ];
  return `${String(date.getUTCDate()).padStart(2, "0")}.${
    months[date.getUTCMonth()]
  }.${date.getUTCFullYear()}`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-я]+/gi, "-")
    .replace(/(^-|-$)/g, "");
}

/** Транслитерация кириллицы — чтобы slug для новых товаров был латиницей. */
const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

export function slugifyLatin(value: string): string {
  const transliterated = value
    .toLowerCase()
    .split("")
    .map((char) => (char in TRANSLIT ? TRANSLIT[char] : char))
    .join("");
  return transliterated
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
