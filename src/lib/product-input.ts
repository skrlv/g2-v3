import type { ProductDetail } from "@/db/schema";
import { STORE_CURRENCY } from "@/lib/catalog";
import { slugifyLatin } from "@/lib/format";

export type ProductInput = {
  slug: string;
  name: string;
  code: string;
  category: string;
  categoryLabel: string;
  priceCents: number;
  currency: string;
  description: string;
  story: string;
  images: string[];
  sizes: string[];
  details: ProductDetail[];
  modelUrl: string | null;
  featured: boolean;
  published: boolean;
  position: number;
};

type RawBody = Record<string, unknown>;

const LIMITS = {
  name: 200,
  slug: 120,
  code: 60,
  category: 60,
  categoryLabel: 80,
  description: 2000,
  story: 8000,
  modelUrl: 300,
  images: 12,
  /** одно фото из студии (data-URL) — не больше ~3 МБ */
  imageChars: 4_000_000,
  sizes: 30,
  details: 40,
  /** 1 000 000 ₽ в копейках */
  priceCents: 100_000_000,
};

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return fallback;
}

/** Список через запятую или с новой строки — для размеров. */
function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => asString(item)).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * Список только по строкам — для картинок. Разделять по запятой нельзя:
 * data-URL из студии («data:image/webp;base64,…») содержит запятую, и раньше
 * каждое загруженное фото разваливалось на два битых куска.
 */
function asLines(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => asString(item)).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function asDetails(value: unknown): ProductDetail[] {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[")) {
      try {
        return asDetails(JSON.parse(trimmed));
      } catch {
        return [];
      }
    }
    return trimmed
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, ...rest] = line.split(":");
        return { label: label.trim(), value: rest.join(":").trim() };
      })
      .filter((detail) => detail.label);
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          const [label, ...rest] = item.split(":");
          return { label: label.trim(), value: rest.join(":").trim() };
        }
        if (item && typeof item === "object") {
          const record = item as RawBody;
          return {
            label: asString(record.label),
            value: asString(record.value),
          };
        }
        return { label: "", value: "" };
      })
      .filter((detail) => detail.label);
  }
  return [];
}

/** Цена: `priceCents` в копейках, иначе `price` в рублях. */
function asPriceCents(body: RawBody): number {
  if (body.priceCents !== undefined && body.priceCents !== null) {
    const cents = Number(body.priceCents);
    return Number.isFinite(cents) ? Math.max(0, Math.round(cents)) : 0;
  }
  const price = Number(asString(body.price).replace(",", "."));
  return Number.isFinite(price) ? Math.max(0, Math.round(price * 100)) : 0;
}

/** Нормализует любой payload студии/API в строку, которую принимает база. */
export function parseProductInput(body: RawBody): ProductInput {
  const name = asString(body.name).slice(0, LIMITS.name);
  const slugInput = asString(body.slug);
  const slug = slugifyLatin(slugInput || name).slice(0, LIMITS.slug);
  const categoryLabel = asString(body.categoryLabel).slice(0, LIMITS.categoryLabel);

  return {
    slug,
    name,
    code: asString(body.code).slice(0, LIMITS.code),
    category: slugifyLatin(asString(body.category) || categoryLabel || "apparel").slice(
      0,
      LIMITS.category,
    ),
    categoryLabel: categoryLabel || asString(body.category).slice(0, LIMITS.categoryLabel) || "Одежда",
    priceCents: asPriceCents(body),
    // У магазина одна валюта; значение из запроса не учитывается.
    currency: STORE_CURRENCY,
    description: asString(body.description).slice(0, LIMITS.description),
    story: asString(body.story).slice(0, LIMITS.story),
    images: asLines(body.images),
    sizes: asStringList(body.sizes).slice(0, LIMITS.sizes),
    details: asDetails(body.details).slice(0, LIMITS.details),
    // Пустая модель → везде показывается фото товара.
    modelUrl: asString(body.modelUrl).slice(0, LIMITS.modelUrl) || null,
    featured: body.featured === true || body.featured === "true",
    published: body.published === false || body.published === "false" ? false : true,
    position: Number.isFinite(Number(body.position)) ? Math.trunc(Number(body.position)) : 0,
  };
}

export function validateProductInput(
  input: ProductInput,
): { ok: true } | { ok: false; error: string } {
  if (!input.name) return { ok: false, error: "Укажите название товара." };
  if (!input.slug) return { ok: false, error: "Не удалось получить slug." };
  if (!input.images.length) {
    return { ok: false, error: "Добавьте хотя бы одно изображение." };
  }
  if (input.images.length > LIMITS.images) {
    return { ok: false, error: `Не больше ${LIMITS.images} изображений у товара.` };
  }
  if (input.images.some((image) => image.length > LIMITS.imageChars)) {
    return { ok: false, error: "Одно из фото слишком большое. Загрузите файл поменьше." };
  }
  if (!input.sizes.length) {
    return { ok: false, error: "Добавьте хотя бы один размер." };
  }
  if (input.priceCents <= 0) {
    return { ok: false, error: "Укажите цену товара." };
  }
  if (input.priceCents > LIMITS.priceCents) {
    return { ok: false, error: "Цена слишком большая." };
  }
  return { ok: true };
}
