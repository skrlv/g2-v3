import { defineConfig } from "drizzle-kit";

/**
 * Настройка drizzle-kit (миграции / push). Само приложение создаёт и обновляет
 * таблицы при старте — см. src/db/bootstrap.ts, — так что запускать это вручную
 * не обязательно. Адрес базы берётся из DATABASE_URL.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
  },
});
