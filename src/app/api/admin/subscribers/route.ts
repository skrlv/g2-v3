import { desc } from "drizzle-orm";
import { db } from "@/db";
import { ensureReady } from "@/db/bootstrap";
import { subscribers } from "@/db/schema";
import { failResponse, json } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Подписчики рассылки для студии, новые сверху. Закрыто паролем в proxy.ts. */
export async function GET() {
  try {
    await ensureReady();
    const rows = await db
      .select()
      .from(subscribers)
      .orderBy(desc(subscribers.createdAt))
      .limit(1000);
    return json({ subscribers: rows });
  } catch (error) {
    return failResponse(error, "Не удалось загрузить подписчиков");
  }
}
