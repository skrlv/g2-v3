import nodemailer from "nodemailer";
import type { OrderLine } from "@/db/schema";
import { formatPrice } from "@/lib/format";
import { formatPhone } from "@/lib/phone";
import { getZone } from "@/lib/shipping";
import { siteUrl } from "@/lib/site";

/**
 * Письма покупателю через SMTP. Работает, если заданы SMTP_HOST, SMTP_USER,
 * SMTP_PASS и MAIL_FROM (Яндекс 360, Mail.ru, Timeweb, любой SMTP); без них
 * молча ничего не делает — заказ всё равно сохраняется, владелец получает Telegram.
 *
 * SMTP_PORT по умолчанию 465 (TLS); для 587 задайте SMTP_SECURE=false.
 */
function transport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM;
  if (!host || !user || !pass || !from) return null;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE !== "false" : port === 465;
  return {
    from,
    mailer: nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 12000,
    }),
  };
}

export type OrderMail = {
  reference: string;
  email: string;
  customerName: string;
  phone: string;
  note: string;
  items: OrderLine[];
  subtotalCents: number;
  shippingZone: string;
  shippingCents: number | null;
};


function escape(value: string): string {
  return value.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char] ?? char);
}

/** Подтверждение заказа: номер, состав, доставка, что дальше. Текст и HTML. */
export function renderOrderMail(order: OrderMail): { subject: string; text: string; html: string } {
  const zone = getZone(order.shippingZone);
  const shipping =
    order.shippingCents === null
      ? "по тарифу курьера — уточним при подтверждении"
      : order.shippingCents === 0
        ? "бесплатно"
        : formatPrice(order.shippingCents);
  const total = order.subtotalCents + (order.shippingCents ?? 0);
  const totalNote = order.shippingCents === null ? " без доставки" : "";

  const lines = order.items.map(
    (line) => `${line.name} · ${line.size} × ${line.quantity} — ${formatPrice(line.priceCents * line.quantity)}`,
  );

  const text = [
    `G2 — заказ ${order.reference} принят`,
    "",
    ...lines,
    "",
    `Товары: ${formatPrice(order.subtotalCents)}`,
    `Доставка (${zone.label}, ${zone.term}): ${shipping}`,
    `Итого${totalNote}: ${formatPrice(total)}`,
    "",
    "Что дальше: мы напишем или позвоним, подтвердим наличие и пришлём способ оплаты — карта, СБП или счёт.",
    `Контакт для связи: ${formatPhone(order.phone)}`,
    order.note ? `Ваш комментарий: ${order.note}` : "",
    "",
    `Условия доставки и возврата: ${siteUrl}/delivery`,
    "Точность. Скорость. Результат.",
  ]
    .filter((line, index, all) => !(line === "" && all[index - 1] === ""))
    .join("\n");

  const rows = order.items
    .map(
      (line) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid #e6e4dd;">${escape(line.name)} <span style="color:#6d6e72">· ${escape(line.size)} × ${line.quantity}</span></td><td style="padding:10px 0;border-bottom:1px solid #e6e4dd;text-align:right;white-space:nowrap">${formatPrice(line.priceCents * line.quantity)}</td></tr>`,
    )
    .join("");

  const html = `<!doctype html><html lang="ru"><body style="margin:0;background:#f3f2ee;color:#060606;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55">
<div style="max-width:560px;margin:0 auto;padding:40px 24px">
  <p style="margin:0 0 24px;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#6d6e72">G2 · Заказ принят</p>
  <p style="margin:0 0 8px;font-size:28px;font-weight:700;letter-spacing:-0.02em">№ ${escape(order.reference)}</p>
  <p style="margin:0 0 28px;color:#6d6e72">Сохраните номер — он понадобится для вопросов по заказу.</p>
  <table style="width:100%;border-collapse:collapse;border-top:1px solid #060606">${rows}
    <tr><td style="padding:10px 0;color:#6d6e72">Товары</td><td style="padding:10px 0;text-align:right">${formatPrice(order.subtotalCents)}</td></tr>
    <tr><td style="padding:4px 0 10px;color:#6d6e72">Доставка — ${escape(zone.label)}, ${escape(zone.term)}</td><td style="padding:4px 0 10px;text-align:right">${escape(shipping)}</td></tr>
    <tr><td style="padding:12px 0;border-top:1px solid #060606;font-weight:700">Итого${totalNote}</td><td style="padding:12px 0;border-top:1px solid #060606;text-align:right;font-weight:700">${formatPrice(total)}</td></tr>
  </table>
  <p style="margin:28px 0 0">Что дальше: мы напишем или позвоним, подтвердим наличие и пришлём способ оплаты — карта, СБП или счёт.</p>
  <p style="margin:12px 0 0;color:#6d6e72">Контакт: ${escape(formatPhone(order.phone))}${order.note ? `<br>Ваш комментарий: ${escape(order.note)}` : ""}</p>
  <p style="margin:32px 0 0;font-size:12px;color:#6d6e72"><a href="${siteUrl}/delivery" style="color:#060606">Условия доставки и возврата</a> · Точность. Скорость. Результат.</p>
</div></body></html>`;

  return { subject: `G2 — заказ ${order.reference} принят`, text, html };
}

/** Отправка подтверждения; ошибки только в лог. */
export async function sendOrderConfirmation(order: OrderMail): Promise<boolean> {
  const smtp = transport();
  if (!smtp) return false;
  const mail = renderOrderMail(order);
  try {
    await smtp.mailer.sendMail({ from: smtp.from, to: order.email, ...mail });
    return true;
  } catch (error) {
    console.error("Не удалось отправить письмо покупателю:", error);
    return false;
  }
}

export function mailConfigured(): boolean {
  return transport() !== null;
}
