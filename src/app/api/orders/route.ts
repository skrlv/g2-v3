import { db } from "@/db";
import { ensureReady } from "@/db/bootstrap";
import { orders, type OrderLine } from "@/db/schema";
import { getProductsBySlugs } from "@/lib/products";
import { ApiError, EMAIL_RE, failResponse, json, pgCode, readJson, str } from "@/lib/api";
import { STORE_CURRENCY, pathOnly } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { sendOrderConfirmation } from "@/lib/mail";
import { notifyOwner } from "@/lib/notify";
import { formatPhone, normalizePhone } from "@/lib/phone";
import { allowRequest, clientIp } from "@/lib/rate-limit";
import { SHIPPING_ZONES, describeShipping, quoteShipping } from "@/lib/shipping";

export const dynamic = "force-dynamic";

const MAX_LINES = 30;
const MAX_QUANTITY = 10;

/** Номер заказа: время + случайный хвост, чтобы два заказа в одну миллисекунду не сталкивались. */
function makeReference(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 4).toUpperCase();
  return `G2-${stamp}-${random}`;
}

type Wanted = { slug: string; size: string; quantity: number };

/**
 * Оформление заказа. Цены, названия и размеры берутся из базы, а не из
 * корзины, поэтому подделать сумму нельзя. Если товар или размер недоступен,
 * заказ не создаётся и покупатель видит, что именно не так.
 */
export async function POST(request: Request) {
  try {
    if (!allowRequest(`orders:${clientIp(request)}`, 10, 10 * 60 * 1000)) {
      return json({ error: "Слишком много попыток. Подождите несколько минут." }, 429);
    }
    const body = await readJson(request, 64 * 1024);
    await ensureReady();

    const email = str(body.email, 200).toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return json({ error: "Укажите корректный email." }, 400);
    }
    const phone = normalizePhone(str(body.phone, 40));
    if (!phone) {
      return json({ error: "Укажите телефон полностью, с кодом города или оператора." }, 400);
    }
    const customerName = str(body.customerName, 120);
    const note = str(body.note, 1000);
    const zoneId = str(body.shippingZone, 40);
    if (!SHIPPING_ZONES.some((zone) => zone.id === zoneId)) {
      return json({ error: "Выберите регион доставки." }, 400);
    }

    const incoming = Array.isArray(body.items) ? body.items : [];
    if (!incoming.length) {
      return json({ error: "Корзина пуста." }, 400);
    }
    if (incoming.length > MAX_LINES) {
      return json({ error: `В одном заказе не больше ${MAX_LINES} позиций.` }, 400);
    }

    const wanted: Wanted[] = [];
    for (const raw of incoming) {
      const item = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
      const slug = str(item.slug, 120);
      if (!slug) continue;
      const quantity = item.quantity === undefined ? 1 : Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        return json({ error: "Некорректное количество." }, 400);
      }
      wanted.push({ slug, size: str(item.size, 40), quantity: Math.min(MAX_QUANTITY, quantity) });
    }
    if (!wanted.length) {
      return json({ error: "Корзина пуста." }, 400);
    }

    const slugs = [...new Set(wanted.map((item) => item.slug))];
    const rows = await getProductsBySlugs(slugs);
    const bySlug = new Map(rows.map((row) => [row.slug, row]));

    // Одинаковые позиции (товар + размер) склеиваются уже после подстановки размера.
    const problems: string[] = [];
    const byKey = new Map<string, OrderLine>();
    for (const item of wanted) {
      const product = bySlug.get(item.slug);
      if (!product) {
        problems.push(`товара «${item.slug}» больше нет в каталоге`);
        continue;
      }
      const sizes = product.sizes.length ? product.sizes : ["ONE SIZE"];
      const size = item.size || sizes[0];
      if (!sizes.includes(size)) {
        problems.push(`${product.name}: размера ${size} нет`);
        continue;
      }
      const key = `${product.slug}::${size}`;
      const found = byKey.get(key);
      if (found) {
        found.quantity = Math.min(MAX_QUANTITY, found.quantity + item.quantity);
      } else {
        byKey.set(key, {
          slug: product.slug,
          name: product.name,
          size,
          quantity: item.quantity,
          priceCents: product.priceCents,
          image: pathOnly(product.images[0]),
        });
      }
    }
    if (problems.length) {
      return json({ error: `Обновите корзину: ${problems.join("; ")}.`, problems }, 400);
    }
    const lines = [...byKey.values()];

    const subtotalCents = lines.reduce(
      (total, line) => total + line.priceCents * line.quantity,
      0,
    );
    const shipping = quoteShipping(subtotalCents, zoneId);

    let order: typeof orders.$inferSelect | undefined;
    for (let attempt = 0; attempt < 2 && !order; attempt += 1) {
      try {
        [order] = await db
          .insert(orders)
          .values({
            reference: makeReference(),
            customerName,
            email,
            phone,
            note,
            items: lines,
            subtotalCents,
            shippingZone: shipping.zone.id,
            shippingCents: shipping.cents,
            currency: STORE_CURRENCY,
            status: "new",
          })
          .returning();
      } catch (error) {
        // совпал номер — пробуем ещё раз с новым
        if (pgCode(error) !== "23505" || attempt === 1) throw error;
      }
    }
    if (!order) {
      throw new ApiError(500, "Не удалось оформить заказ");
    }

    const shippingText = describeShipping(shipping, formatPrice);
    const totalCents = subtotalCents + (shipping.cents ?? 0);
    const summary = [
      `Новый заказ ${order.reference}`,
      `${customerName || "Без имени"} · ${formatPhone(phone)} · ${email}`,
      "",
      ...lines.map(
        (line) =>
          `${line.name} · ${line.size} × ${line.quantity} · ${formatPrice(line.priceCents * line.quantity)}`,
      ),
      "",
      `Товары: ${formatPrice(subtotalCents)}`,
      `Доставка: ${shipping.zone.label} — ${shippingText}`,
      `Итого${shipping.cents === null ? " без доставки" : ""}: ${formatPrice(totalCents)}`,
    ];
    if (note) summary.push(`Комментарий: ${note}`);
    // Владельцу — в Telegram, покупателю — на почту; ни то ни другое не задерживает ответ.
    const emailed = await Promise.all([
      notifyOwner(summary.join("\n")),
      sendOrderConfirmation({
        reference: order.reference,
        email,
        customerName,
        phone,
        note,
        items: lines,
        subtotalCents,
        shippingZone: shipping.zone.id,
        shippingCents: shipping.cents,
      }),
    ]).then(([, sent]) => sent);

    return json(
      {
        order: {
          reference: order.reference,
          subtotalCents,
          shippingZone: shipping.zone.id,
          shippingCents: shipping.cents,
          totalCents,
          currency: STORE_CURRENCY,
          items: lines,
          emailed,
        },
      },
      201,
    );
  } catch (error) {
    return failResponse(error, "Не удалось оформить заказ");
  }
}
