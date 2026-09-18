import { db } from "@/db";
import { ensureReady } from "@/db/bootstrap";
import { products } from "@/db/schema";
import { getProduct } from "@/lib/products";
import { parseProductInput, validateProductInput } from "@/lib/product-input";
import { failResponse, json, pgCode, readJson } from "@/lib/api";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ slug: string }> };

/** Поля, которые студия или API могут прислать частично. Цена обрабатывается отдельно. */
const FIELDS = [
  "name",
  "slug",
  "code",
  "category",
  "categoryLabel",
  "description",
  "story",
  "images",
  "sizes",
  "details",
  "modelUrl",
  "featured",
  "published",
  "position",
] as const;

export async function GET(_request: Request, { params }: Context) {
  try {
    const { slug } = await params;
    const product = await getProduct(slug);
    if (!product) {
      return json({ error: "Товар не найден" }, 404);
    }
    return json({ product });
  } catch (error) {
    return failResponse(error, "Не удалось загрузить товар");
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { slug } = await params;
    await ensureReady();
    const existing = await getProduct(slug, { includeUnpublished: true });
    if (!existing) {
      return json({ error: "Товар не найден" }, 404);
    }

    const body = await readJson(request, 8 * 1024 * 1024);

    // Берём текущий товар и накладываем только присланные поля.
    const merged: Record<string, unknown> = {
      name: existing.name,
      slug: existing.slug,
      code: existing.code,
      category: existing.category,
      categoryLabel: existing.categoryLabel,
      description: existing.description,
      story: existing.story,
      images: existing.images,
      sizes: existing.sizes,
      details: existing.details,
      modelUrl: existing.modelUrl ?? "",
      featured: existing.featured,
      published: existing.published,
      position: existing.position,
    };
    for (const field of FIELDS) {
      if (body[field] !== undefined) merged[field] = body[field];
    }
    // Цена: студия шлёт рубли (price), API может слать копейки (priceCents).
    // Раньше рубли из студии игнорировались, и цена никогда не менялась.
    if (body.priceCents !== undefined) {
      merged.priceCents = body.priceCents;
    } else if (body.price !== undefined) {
      merged.price = body.price;
    } else {
      merged.priceCents = existing.priceCents;
    }

    const input = parseProductInput(merged);
    const valid = validateProductInput(input);
    if (!valid.ok) {
      return json({ error: valid.error }, 400);
    }

    const [row] = await db
      .update(products)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(products.id, existing.id))
      .returning();

    return json({ product: row });
  } catch (error) {
    if (pgCode(error) === "23505") {
      return json({ error: "Такой адрес (slug) уже занят другим товаром." }, 409);
    }
    return failResponse(error, "Не удалось обновить товар");
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { slug } = await params;
    await ensureReady();
    const deleted = await db
      .delete(products)
      .where(eq(products.slug, slug))
      .returning({ slug: products.slug });
    if (!deleted.length) {
      return json({ error: "Товар не найден" }, 404);
    }
    return json({ ok: true });
  } catch (error) {
    return failResponse(error, "Не удалось удалить товар");
  }
}
