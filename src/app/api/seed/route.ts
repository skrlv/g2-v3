import { ensureReady, syncFromSeedFile } from "@/db/bootstrap";
import { failResponse, json } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * Читает src/db/seed-data.ts в базу. По умолчанию добавляет только отсутствующие
 * товары; с `?overwrite=true` перезаписывает все товары из файла (правки из
 * студии по этим товарам пропадут). Закрыто паролем в proxy.ts.
 */
export async function POST(request: Request) {
  try {
    await ensureReady();
    const overwrite = new URL(request.url).searchParams.get("overwrite") === "true";
    const result = await syncFromSeedFile({ overwrite });
    return json({ ok: true, ...result });
  } catch (error) {
    return failResponse(error, "Синхронизация не удалась");
  }
}
