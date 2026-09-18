import { storageMode, storeImage } from "@/lib/storage";

export const dynamic = "force-dynamic";

/**
 * POST /api/upload  (multipart/form-data, поле "file")
 *
 * Фото приводится к WebP ≤1600 px и уходит в хранилище (см. lib/storage.ts):
 * S3-совместимое, папка UPLOADS_DIR или, если ничего не настроено, в базу
 * как data-URL. Ответ — адрес для поля images товара и режим хранения.
 */
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return Response.json({ error: "Файл не получен" }, { status: 400 });
    }
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
      return Response.json({ error: "Нужно растровое изображение (JPEG, PNG, WebP)" }, { status: 400 });
    }
    if (file.size > 12 * 1024 * 1024) {
      return Response.json({ error: "Файл больше 12 МБ" }, { status: 413 });
    }

    const stored = await storeImage(Buffer.from(await file.arrayBuffer()));
    return Response.json(
      { ok: true, src: stored.src, bytes: stored.bytes, width: stored.width, height: stored.height, mode: stored.mode },
      { status: 201 },
    );
  } catch (error) {
    console.error("Не удалось загрузить файл:", error);
    return Response.json({ error: "Не удалось загрузить файл" }, { status: 500 });
  }
}

/** GET /api/upload — какой режим хранения настроен (для подсказки в студии). */
export async function GET() {
  return Response.json({ mode: storageMode() });
}
