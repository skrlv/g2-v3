import { desc } from "drizzle-orm";
import { db } from "@/db";
import { ensureReady } from "@/db/bootstrap";
import { orders } from "@/db/schema";
import { failResponse, json } from "@/lib/api";
import { pathOnly } from "@/lib/catalog";

export const dynamic = "force-dynamic";

/** Последние заказы для студии, новые сверху. Доступ закрыт паролем в proxy.ts. */
export async function GET() {
  try {
    await ensureReady();
    const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(200);
    return json({
      orders: rows.map((row) => ({
        ...row,
        // старые заказы могли сохранить фото как data-URL — в список их не отдаём
        items: row.items.map((line) => ({ ...line, image: pathOnly(line.image) })),
      })),
    });
  } catch (error) {
    return failResponse(error, "Не удалось загрузить заказы");
  }
}
