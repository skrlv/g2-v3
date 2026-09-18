import { db } from "@/db";
import { ensureReady } from "@/db/bootstrap";
import { products } from "@/db/schema";
import { listProducts, isSortValue, type SortValue } from "@/lib/products";
import { parseProductInput, validateProductInput } from "@/lib/product-input";
import { failResponse, json, pgCode, readJson } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Каталог. `?all=true` (с черновиками) доступен только студии — закрыто паролем в proxy.ts. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category") ?? undefined;
  const sortParam = url.searchParams.get("sort") ?? undefined;
  const sort: SortValue | undefined = isSortValue(sortParam) ? sortParam : undefined;
  const includeUnpublished = url.searchParams.get("all") === "true";

  try {
    const rows = await listProducts({ category, sort, includeUnpublished });
    return json({ products: rows });
  } catch (error) {
    return failResponse(error, "Не удалось загрузить товары");
  }
}

/** Создание товара. Адрес (slug) должен быть свободен: существующий товар не перезаписывается. */
export async function POST(request: Request) {
  try {
    await ensureReady();
    const body = await readJson(request, 8 * 1024 * 1024);
    const input = parseProductInput(body);
    const valid = validateProductInput(input);
    if (!valid.ok) {
      return json({ error: valid.error }, 400);
    }

    const [row] = await db
      .insert(products)
      .values({ ...input, updatedAt: new Date() })
      .returning();

    return json({ product: row }, 201);
  } catch (error) {
    if (pgCode(error) === "23505") {
      return json(
        { error: "Товар с таким адресом (slug) уже есть. Откройте его в списке или измените адрес." },
        409,
      );
    }
    return failResponse(error, "Не удалось сохранить товар");
  }
}
