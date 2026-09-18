/**
 * Общие помощники для маршрутов API: чтение JSON с проверкой типа и размера,
 * строки с ограничением длины, единый формат ошибок.
 */

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type JsonBody = Record<string, unknown>;

/** Читает JSON-тело. Не JSON, слишком большое или не объект → ApiError. */
export async function readJson(request: Request, maxBytes = 64 * 1024): Promise<JsonBody> {
  const type = request.headers.get("content-type") ?? "";
  if (!type.toLowerCase().includes("application/json")) {
    throw new ApiError(415, "Ожидается JSON.");
  }
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > maxBytes) {
    throw new ApiError(413, "Слишком большой запрос.");
  }
  const text = await request.text();
  if (text.length > maxBytes) {
    throw new ApiError(413, "Слишком большой запрос.");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ApiError(400, "Не удалось разобрать запрос.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new ApiError(400, "Не удалось разобрать запрос.");
  }
  return parsed as JsonBody;
}

/** Строка из произвольного значения, обрезанная до `max` знаков. Не строка и не число → "". */
export function str(value: unknown, max = 200): string {
  if (typeof value === "string") return value.trim().slice(0, max);
  if (typeof value === "number" && Number.isFinite(value)) return String(value).slice(0, max);
  return "";
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

/**
 * Ответ на ошибку: ApiError уходит клиенту с её статусом и текстом, всё остальное
 * пишется в лог сервера, а клиент получает общий текст без внутренних деталей.
 */
export function failResponse(error: unknown, fallback: string): Response {
  if (error instanceof ApiError) {
    return json({ error: error.message }, error.status);
  }
  console.error(fallback, error);
  return json({ error: fallback }, 500);
}

/** Код ошибки PostgreSQL (23505 — нарушение уникальности), в том числе из обёртки drizzle. */
export function pgCode(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const record = error as { code?: unknown; cause?: unknown };
  if (typeof record.code === "string") return record.code;
  if (record.cause && record.cause !== error) return pgCode(record.cause);
  return null;
}
