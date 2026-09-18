import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
// Относительный путь, а не «@/»: файл читает и drizzle-kit, который алиасы не знает.
import { STORE_CURRENCY } from "../lib/catalog";

export type ProductDetail = {
  label: string;
  value: string;
};

export type OrderLine = {
  slug: string;
  name: string;
  size: string;
  quantity: number;
  priceCents: number;
  image: string | null;
};

/** Статусы заказа: new — принят, дальше проставляет студия. */
export type OrderStatus = "new" | "confirmed" | "paid" | "shipped" | "done" | "cancelled";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  code: text("code").notNull().default(""),
  category: text("category").notNull().default("apparel"),
  categoryLabel: text("category_label").notNull().default("Apparel"),
  priceCents: integer("price_cents").notNull().default(0),
  currency: text("currency").notNull().default(STORE_CURRENCY),
  description: text("description").notNull().default(""),
  story: text("story").notNull().default(""),
  images: jsonb("images").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  sizes: jsonb("sizes").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  details: jsonb("details")
    .$type<ProductDetail[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  modelUrl: text("model_url"),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(true),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  customerName: text("customer_name").notNull().default(""),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  note: text("note").notNull().default(""),
  items: jsonb("items").$type<OrderLine[]>().notNull().default(sql`'[]'::jsonb`),
  subtotalCents: integer("subtotal_cents").notNull().default(0),
  /** Зона доставки (id из lib/shipping.ts) и её стоимость; null — тариф уточняется при подтверждении. */
  shippingZone: text("shipping_zone").notNull().default(""),
  shippingCents: integer("shipping_cents"),
  currency: text("currency").notNull().default(STORE_CURRENCY),
  status: text("status").$type<OrderStatus>().notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default(""),
  email: text("email").notNull().default(""),
  subject: text("subject").notNull().default("General"),
  body: text("body").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Служебные отметки: например, когда каталог был засеян из файла. */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
