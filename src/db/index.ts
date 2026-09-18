import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * Подключение к базе создаётся лениво, при первом запросе, а не при импорте
 * модуля. Иначе `next build` (в том числе сборка в Docker) падал с ошибкой
 * «DATABASE_URL is required», хотя на этапе сборки база не нужна.
 */
type Database = NodePgDatabase<Record<string, never>>;

const globalForDb = globalThis as typeof globalThis & {
  __g2Database?: Database;
};

function connect(): Database {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }
  const pool = new Pool({ connectionString: databaseUrl, max: 5 });
  return drizzle(pool);
}

function instance(): Database {
  if (!globalForDb.__g2Database) {
    globalForDb.__g2Database = connect();
  }
  return globalForDb.__g2Database;
}

/** Обычный объект drizzle; реальное подключение открывается при первом обращении. */
export const db: Database = new Proxy({} as Database, {
  get(_target, property) {
    const real = instance();
    const value = Reflect.get(real, property, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
