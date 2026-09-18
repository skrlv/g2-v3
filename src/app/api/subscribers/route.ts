import { db } from "@/db";
import { ensureReady } from "@/db/bootstrap";
import { subscribers } from "@/db/schema";
import { EMAIL_RE, failResponse, json, readJson, str } from "@/lib/api";
import { allowRequest, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Подписка на рассылку из подвала сайта. */
export async function POST(request: Request) {
  try {
    if (!allowRequest(`subscribers:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
      return json({ error: "Слишком много попыток. Попробуйте позже." }, 429);
    }
    const body = await readJson(request, 8 * 1024);

    // Скрытое поле-ловушка для ботов: отвечаем «ок», ничего не храним.
    if (str(body.website, 10)) {
      return json({ ok: true }, 201);
    }

    await ensureReady();
    const email = str(body.email, 200).toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return json({ error: "Укажите корректный email." }, 400);
    }

    await db.insert(subscribers).values({ email }).onConflictDoNothing();
    return json({ ok: true }, 201);
  } catch (error) {
    return failResponse(error, "Не удалось подписаться");
  }
}
