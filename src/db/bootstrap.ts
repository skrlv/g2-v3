import { db } from "@/db";
import { products, settings, type ProductDetail } from "@/db/schema";
import { seedProducts, type SeedProduct } from "@/db/seed-data";
import { STORE_CURRENCY } from "@/lib/catalog";
import { eq, sql } from "drizzle-orm";

let readyPromise: Promise<void> | null = null;

const DDL = [
  `create table if not exists products (
    id serial primary key,
    slug text not null unique,
    name text not null,
    code text not null default '',
    category text not null default 'apparel',
    category_label text not null default 'Apparel',
    price_cents integer not null default 0,
    currency text not null default 'RUB',
    description text not null default '',
    story text not null default '',
    images jsonb not null default '[]'::jsonb,
    sizes jsonb not null default '[]'::jsonb,
    details jsonb not null default '[]'::jsonb,
    model_url text,
    featured boolean not null default false,
    published boolean not null default true,
    position integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  )`,
  `create table if not exists orders (
    id serial primary key,
    reference text not null unique,
    customer_name text not null default '',
    email text not null default '',
    phone text not null default '',
    note text not null default '',
    items jsonb not null default '[]'::jsonb,
    subtotal_cents integer not null default 0,
    shipping_zone text not null default '',
    shipping_cents integer,
    currency text not null default 'RUB',
    status text not null default 'new',
    created_at timestamptz not null default now()
  )`,
  `create table if not exists messages (
    id serial primary key,
    name text not null default '',
    email text not null default '',
    subject text not null default 'General',
    body text not null default '',
    created_at timestamptz not null default now()
  )`,
  `create table if not exists subscribers (
    id serial primary key,
    email text not null unique,
    created_at timestamptz not null default now()
  )`,
  `create table if not exists settings (
    key text primary key,
    value text not null default '',
    updated_at timestamptz not null default now()
  )`,
];

/**
 * Изменения схемы для баз, созданных раньше. Каждая команда безопасна при
 * повторном запуске (if not exists / set default), поэтому выполняется при
 * каждом старте вместе с DDL.
 */
const MIGRATIONS = [
  `alter table orders add column if not exists phone text not null default ''`,
  `alter table orders add column if not exists status text not null default 'new'`,
  `alter table orders add column if not exists shipping_zone text not null default ''`,
  `alter table orders add column if not exists shipping_cents integer`,
  `alter table products alter column currency set default 'RUB'`,
  `alter table orders alter column currency set default 'RUB'`,
  // У магазина одна валюта: товары, заведённые старой студией как EUR, приводим к рублям.
  `update products set currency = 'RUB' where currency <> 'RUB'`,
  `update orders set currency = 'RUB' where currency <> 'RUB'`,
  // Демо-модель «Монолит» удалена из проекта — ссылка на неё в базе больше не работает.
  `update products set model_url = null where model_url = '/models/ob-01-monolith.gltf'`,
];

/**
 * Создаёт таблицы, если их нет, применяет мелкие миграции и один раз
 * загружает стартовый каталог из seed-data.ts, чтобы магазин всегда открывался.
 */
export async function ensureReady(): Promise<void> {
  if (!readyPromise) {
    readyPromise = (async () => {
      for (const statement of [...DDL, ...MIGRATIONS]) {
        await db.execute(sql.raw(statement));
      }
      await seedIfFresh();
    })().catch((error) => {
      readyPromise = null;
      throw error;
    });
  }
  return readyPromise;
}

/**
 * Стартовый каталог загружается только в базу, которую ещё ни разу не засевали
 * и в которой нет товаров. Если владелец сам опустошил каталог, демо-товары
 * при перезапуске обратно не возвращаются.
 */
async function seedIfFresh(): Promise<void> {
  const marker = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, "seeded_at"))
    .limit(1);
  if (marker.length) return;

  const existing = await db.execute<{ count: string }>(
    sql`select count(*)::text as count from products`,
  );
  const count = Number(existing.rows[0]?.count ?? "0");
  if (count === 0) {
    await syncFromSeedFile({ overwrite: true });
  }
  await db
    .insert(settings)
    .values({ key: "seeded_at", value: new Date().toISOString() })
    .onConflictDoNothing();
}

function seedValues(item: SeedProduct) {
  return {
    slug: item.slug,
    name: item.name,
    code: item.code,
    category: item.category,
    categoryLabel: item.categoryLabel,
    priceCents: Math.round(item.price * 100),
    currency: STORE_CURRENCY,
    description: item.description,
    story: item.story,
    images: item.images,
    sizes: item.sizes,
    details: item.details,
    modelUrl: item.modelUrl ? item.modelUrl : null,
    featured: item.featured,
    position: item.position,
    updatedAt: new Date(),
  };
}

/**
 * Записывает товары из src/db/seed-data.ts в базу.
 * По умолчанию добавляет только отсутствующие (по slug) и не трогает те, что
 * уже есть, — чтобы не затереть цены и фото, отредактированные в студии.
 * С `overwrite: true` перезаписывает все товары из файла целиком.
 */
export async function syncFromSeedFile(options?: {
  overwrite?: boolean;
}): Promise<{ synced: number; mode: "insert" | "overwrite" }> {
  let synced = 0;
  for (const item of seedProducts) {
    const values = seedValues(item);
    if (options?.overwrite) {
      await db
        .insert(products)
        .values({ ...values, published: true })
        .onConflictDoUpdate({ target: products.slug, set: values });
      synced += 1;
    } else {
      const rows = await db
        .insert(products)
        .values({ ...values, published: true })
        .onConflictDoNothing({ target: products.slug })
        .returning({ slug: products.slug });
      synced += rows.length;
    }
  }
  return { synced, mode: options?.overwrite ? "overwrite" : "insert" };
}

export type { ProductDetail };
