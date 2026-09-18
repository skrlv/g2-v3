import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureReady } from "@/db/bootstrap";
import { products } from "@/db/schema";
import { failResponse, json } from "@/lib/api";
import { decodeDataUrl, storageMode, storeImage } from "@/lib/storage";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/migrate-images — переносит фото, сохранённые в базе как
 * data-URL, в настроенное хранилище (S3 или UPLOADS_DIR) и подменяет адреса
 * в товарах. Закрыто паролем студии (proxy.ts). Повторный вызов безопасен:
 * переносятся только оставшиеся data-URL.
 */
export async function POST() {
  try {
    const mode = storageMode();
    if (mode === "database") {
      return json({ error: "Хранилище не настроено: задайте S3_* или UPLOADS_DIR." }, 400);
    }
    await ensureReady();
    const rows = await db.select({ id: products.id, slug: products.slug, images: products.images }).from(products);

    let moved = 0;
    let failed = 0;
    const touched: string[] = [];
    for (const row of rows) {
      let changed = false;
      const next: string[] = [];
      for (const src of row.images) {
        const bytes = src.startsWith("data:") ? decodeDataUrl(src) : null;
        if (!bytes) {
          next.push(src);
          continue;
        }
        try {
          const stored = await storeImage(bytes);
          next.push(stored.src);
          moved += 1;
          changed = true;
        } catch (error) {
          console.error(`migrate-images: ${row.slug}`, error);
          next.push(src);
          failed += 1;
        }
      }
      if (changed) {
        await db.update(products).set({ images: next, updatedAt: new Date() }).where(eq(products.id, row.id));
        touched.push(row.slug);
      }
    }
    return json({ ok: true, mode, moved, failed, products: touched });
  } catch (error) {
    return failResponse(error, "Не удалось перенести фото");
  }
}
