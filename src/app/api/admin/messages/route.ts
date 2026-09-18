import { desc } from "drizzle-orm";
import { db } from "@/db";
import { ensureReady } from "@/db/bootstrap";
import { messages } from "@/db/schema";
import { failResponse, json } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Сообщения из формы «Контакты» для студии, новые сверху. Закрыто паролем в proxy.ts. */
export async function GET() {
  try {
    await ensureReady();
    const rows = await db
      .select()
      .from(messages)
      .orderBy(desc(messages.createdAt))
      .limit(300);
    return json({ messages: rows });
  } catch (error) {
    return failResponse(error, "Не удалось загрузить сообщения");
  }
}
