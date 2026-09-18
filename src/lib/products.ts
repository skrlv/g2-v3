import { db } from "@/db";
import { ensureReady, syncFromSeedFile, type ProductDetail } from "@/db/bootstrap";
import { products } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { and, asc, desc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { CATEGORY_ORDER } from "@/db/seed-data";
import { PLACEHOLDER_IMAGE, type CardProduct, type Category, type SortValue } from "@/lib/catalog";

type ProductRow = InferSelectModel<typeof products>;

export type Product = Omit<ProductRow, "createdAt" | "updatedAt"> & {
  createdAt: string | Date;
  updatedAt: string | Date;
};

export { SORT_OPTIONS, isSortValue } from "@/lib/catalog";
export type { Category, SortValue } from "@/lib/catalog";

export async function listProducts(options?: {
  category?: string;
  sort?: SortValue;
  includeUnpublished?: boolean;
}): Promise<Product[]> {
  await ensureReady();
  const filters = [];
  if (!options?.includeUnpublished) {
    filters.push(eq(products.published, true));
  }
  if (options?.category && options.category !== "all") {
    filters.push(eq(products.category, options.category));
  }

  const orderBy = (() => {
    switch (options?.sort) {
      case "price-asc":
        return [asc(products.priceCents), asc(products.position)];
      case "price-desc":
        return [desc(products.priceCents), asc(products.position)];
      case "name":
        return [asc(products.name)];
      default:
        return [asc(products.position), asc(products.id)];
    }
  })();

  const rows = await db
    .select()
    .from(products)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(...orderBy);

  return rows;
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  await ensureReady();
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.published, true), eq(products.featured, true)))
    .orderBy(asc(products.position))
    .limit(limit);
  if (rows.length) return rows;
  return listProducts({});
}

/**
 * Товар по адресу. По умолчанию только опубликованный: черновики не должны
 * открываться по ссылке и попадать в заказ. Студии нужен и черновик —
 * `includeUnpublished: true`.
 */
export async function getProduct(
  slug: string,
  options?: { includeUnpublished?: boolean },
): Promise<Product | null> {
  await ensureReady();
  const filters = [eq(products.slug, slug)];
  if (!options?.includeUnpublished) {
    filters.push(eq(products.published, true));
  }
  const rows = await db
    .select()
    .from(products)
    .where(and(...filters))
    .limit(1);
  return rows[0] ?? null;
}

/** Опубликованные товары по списку адресов одним запросом — для оформления заказа. */
export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  await ensureReady();
  if (!slugs.length) return [];
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.published, true), inArray(products.slug, slugs)));
  return rows;
}

/** Первый опубликованный товар с 3D-моделью — для блока на главной. Нет модели → null. */
export async function getModelPiece(): Promise<Product | null> {
  await ensureReady();
  const rows = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.published, true),
        isNotNull(products.modelUrl),
        sql`${products.modelUrl} <> ''`,
      ),
    )
    .orderBy(asc(products.position), asc(products.id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getRelatedProducts(
  product: Product,
  limit = 3,
): Promise<Product[]> {
  await ensureReady();
  const sameCategory = await db
    .select()
    .from(products)
    .where(and(eq(products.published, true), eq(products.category, product.category)))
    .orderBy(asc(products.position));
  const others = sameCategory.filter((row) => row.slug !== product.slug);
  if (others.length >= limit) return others.slice(0, limit);

  const rest = await db
    .select()
    .from(products)
    .where(eq(products.published, true))
    .orderBy(asc(products.position));
  const seen = new Set([product.slug, ...others.map((row) => row.slug)]);
  for (const row of rest) {
    if (others.length >= limit) break;
    if (seen.has(row.slug)) continue;
    seen.add(row.slug);
    others.push(row);
  }
  return others.slice(0, limit);
}

/**
 * Категории с количеством товаров. Группировка только по slug категории:
 * если у товаров одной категории разные подписи, берётся подпись первого по
 * позиции — иначе в фильтре появлялись дубли.
 */
export async function listCategories(): Promise<Category[]> {
  await ensureReady();
  const rows = await db
    .select({
      slug: products.category,
      label: sql<string>`(array_agg(${products.categoryLabel} order by ${products.position}, ${products.id}))[1]`,
      count: sql<number>`count(*)::int`,
    })
    .from(products)
    .where(eq(products.published, true))
    .groupBy(products.category);

  return rows.sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.slug);
    const bi = CATEGORY_ORDER.indexOf(b.slug);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

/** The viewer falls back to the cover image whenever this returns null/empty. */
export function resolveModelUrl(product: {
  modelUrl?: string | null;
}): string | null {
  const value = product.modelUrl?.trim();
  return value ? value : null;
}

/** Урезанные данные для карточки в сетке — в клиент не уезжают тексты и лишние фото. */
export function toCardProduct(product: Product): CardProduct {
  return {
    slug: product.slug,
    name: product.name,
    priceCents: product.priceCents,
    currency: product.currency,
    cover: product.images[0] ?? PLACEHOLDER_IMAGE,
    // второй кадр показывается при наведении только если это настоящее фото, а не фактура-заглушка
    alternate:
      product.images[1] && product.images[1] !== PLACEHOLDER_IMAGE ? product.images[1] : null,
    sizes: product.sizes,
    hasModel: Boolean(resolveModelUrl(product)),
  };
}

export { syncFromSeedFile };
export type { ProductDetail };
