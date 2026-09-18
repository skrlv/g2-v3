import { db } from "@/db";
import { ensureReady } from "@/db/bootstrap";
import { messages } from "@/db/schema";
import { EMAIL_RE, failResponse, json, readJson, str } from "@/lib/api";
import { notifyOwner } from "@/lib/notify";
import { allowRequest, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Сообщение из формы «Контакты»: в базу и, если настроен Telegram, владельцу. */
export async function POST(request: Request) {
  try {
    if (!allowRequest(`messages:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
      return json({ error: "Слишком много сообщений подряд. Попробуйте позже." }, 429);
    }
    const body = await readJson(request, 32 * 1024);

    // Скрытое поле-ловушка: люди его не видят, боты заполняют. Отвечаем «ок», ничего не храним.
    if (str(body.website, 10)) {
      return json({ ok: true }, 201);
    }

    await ensureReady();
    const email = str(body.email, 200).toLowerCase();
    const text = str(body.body, 4000);
    const name = str(body.name, 120);
    const subject = str(body.subject, 80) || "Общий вопрос";

    if (!EMAIL_RE.test(email)) {
      return json({ error: "Укажите корректный email." }, 400);
    }
    if (text.length < 4) {
      return json({ error: "Напишите сообщение." }, 400);
    }

    const [message] = await db
      .insert(messages)
      .values({ name, email, subject, body: text })
      .returning({ id: messages.id });

    await notifyOwner(
      `Сообщение с сайта · ${subject}\n${name || "Без имени"} · ${email}\n\n${text}`,
    );

    return json({ ok: true, id: message?.id }, 201);
  } catch (error) {
    return failResponse(error, "Не удалось отправить сообщение");
  }
}
