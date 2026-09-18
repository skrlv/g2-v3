"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminImageManager } from "@/components/admin-image-manager";
import { formatPrice } from "@/lib/format";
import { getZone } from "@/lib/shipping";

type AdminProduct = {
  id: number;
  slug: string;
  name: string;
  code: string;
  category: string;
  categoryLabel: string;
  priceCents: number;
  currency: string;
  description: string;
  story: string;
  images: string[];
  sizes: string[];
  details: { label: string; value: string }[];
  modelUrl: string | null;
  featured: boolean;
  published: boolean;
  position: number;
};

type AdminOrderLine = {
  slug: string;
  name: string;
  size: string;
  quantity: number;
  priceCents: number;
  image: string | null;
};

type AdminOrder = {
  id: number;
  reference: string;
  customerName: string;
  email: string;
  phone: string;
  note: string;
  items: AdminOrderLine[];
  subtotalCents: number;
  shippingZone?: string;
  shippingCents?: number | null;
  currency: string;
  status: string;
  createdAt: string;
};

type AdminMessage = {
  id: number;
  name: string;
  email: string;
  subject: string;
  body: string;
  createdAt: string;
};

type AdminSubscriber = {
  id: number;
  email: string;
  createdAt: string;
};

type View = "products" | "orders" | "messages" | "subscribers";

type FormState = {
  name: string;
  slug: string;
  code: string;
  category: string;
  categoryLabel: string;
  price: string;
  description: string;
  story: string;
  images: string;
  sizes: string;
  details: string;
  modelUrl: string;
  featured: boolean;
  published: boolean;
  position: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  slug: "",
  code: "",
  category: "",
  categoryLabel: "",
  price: "",
  description: "",
  story: "",
  images: "/images/texture.jpg",
  sizes: "S, M, L, XL",
  details: "Ткань: футер петля 480 г/м²\nПроизводство: Португалия",
  modelUrl: "",
  featured: false,
  published: true,
  position: "10",
};

const STATUS_LABEL: Record<string, string> = {
  new: "Новый",
  confirmed: "Подтверждён",
  paid: "Оплачен",
  shipped: "Отправлен",
  done: "Выполнен",
  cancelled: "Отменён",
};

function toForm(product: AdminProduct | null): FormState {
  if (!product) return EMPTY_FORM;
  return {
    name: product.name,
    slug: product.slug,
    code: product.code,
    category: product.category,
    categoryLabel: product.categoryLabel,
    price: (product.priceCents / 100).toString(),
    description: product.description,
    story: product.story,
    images: product.images.join("\n"),
    sizes: product.sizes.join(", "),
    details: product.details.map((d) => `${d.label}: ${d.value}`).join("\n"),
    modelUrl: product.modelUrl ?? "",
    featured: product.featured,
    published: product.published,
    position: String(product.position),
  };
}

function formatWhen(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Разбирает ответ сервера; не-JSON (например, 413 от хостинга) превращает в понятный текст. */
async function readResponse<T extends object>(response: Response): Promise<T & { error?: string }> {
  try {
    return (await response.json()) as T & { error?: string };
  } catch {
    const error =
      response.status === 413
        ? "Слишком большой запрос: уменьшите или удалите часть фото."
        : `Сервер ответил кодом ${response.status} без данных.`;
    return { error } as unknown as T & { error?: string };
  }
}

export default function AdminPage() {
  const [view, setView] = useState<View>("products");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [subscribers, setSubscribers] = useState<AdminSubscriber[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/products?all=true", { cache: "no-store" });
      const data = await readResponse<{ products?: AdminProduct[] }>(response);
      if (!response.ok) throw new Error(data.error ?? "Не удалось загрузить товары");
      setProducts(data.products ?? []);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось загрузить товары");
    }
  }, []);

  const loadLists = useCallback(async () => {
    try {
      const [ordersRes, messagesRes, subscribersRes] = await Promise.all([
        fetch("/api/admin/orders", { cache: "no-store" }),
        fetch("/api/admin/messages", { cache: "no-store" }),
        fetch("/api/admin/subscribers", { cache: "no-store" }),
      ]);
      const [ordersData, messagesData, subscribersData] = await Promise.all([
        readResponse<{ orders?: AdminOrder[] }>(ordersRes),
        readResponse<{ messages?: AdminMessage[] }>(messagesRes),
        readResponse<{ subscribers?: AdminSubscriber[] }>(subscribersRes),
      ]);
      setOrders(ordersData.orders ?? []);
      setMessages(messagesData.messages ?? []);
      setSubscribers(subscribersData.subscribers ?? []);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось загрузить заказы и сообщения");
    }
  }, []);

  useEffect(() => {
    void load();
    void loadLists();
  }, [load, loadLists]);

  function update(patch: Partial<FormState>) {
    setForm((current) => ({ ...current, ...patch }));
    setDirty(true);
  }

  function confirmLeave(): boolean {
    if (!dirty) return true;
    return window.confirm("Есть несохранённые правки. Перейти без сохранения?");
  }

  function select(product: AdminProduct) {
    if (!confirmLeave()) return;
    setSelectedSlug(product.slug);
    setForm(toForm(product));
    setDirty(false);
    setStatus(`Редактирование: ${product.name}`);
  }

  function startNew() {
    if (!confirmLeave()) return;
    setSelectedSlug(null);
    setForm({ ...EMPTY_FORM, position: String(products.length + 1) });
    setDirty(false);
    setStatus("Новый товар — пока не сохранён");
  }

  const field =
    "w-full border hairline bg-transparent px-3 py-2.5 text-sm placeholder:text-smoke focus:border-bone/40 focus:outline-none";

  async function save() {
    setBusy(true);
    setStatus("Сохраняем…");
    try {
      const payload = {
        ...form,
        // пустое поле цены — оставить прежнюю цену (при создании товара цена обязательна)
        price: form.price.trim() === "" ? undefined : Number(form.price.replace(",", ".")) || 0,
        position: Number(form.position) || 0,
        modelUrl: form.modelUrl.trim(),
      };
      const response = await fetch(
        selectedSlug ? `/api/products/${selectedSlug}` : "/api/products",
        {
          method: selectedSlug ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await readResponse<{ product?: AdminProduct }>(response);
      if (!response.ok) throw new Error(data.error ?? "Не удалось сохранить");
      await load();
      if (data.product) {
        setSelectedSlug(data.product.slug);
        setForm(toForm(data.product));
      }
      setDirty(false);
      setStatus(`Сохранено: ${data.product?.name ?? "товар"}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось сохранить");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!selectedSlug) return;
    const name = products.find((product) => product.slug === selectedSlug)?.name ?? selectedSlug;
    if (!window.confirm(`Удалить «${name}»? Товар и его фото пропадут, отменить нельзя.`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/products/${selectedSlug}`, { method: "DELETE" });
      const data = await readResponse<{ ok?: boolean }>(response);
      if (!response.ok) throw new Error(data.error ?? "Не удалось удалить");
      setStatus(`Удалено: ${name}`);
      setSelectedSlug(null);
      setForm(EMPTY_FORM);
      setDirty(false);
      await load();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось удалить");
    } finally {
      setBusy(false);
    }
  }

  async function syncSeed() {
    if (
      !window.confirm(
        "Добавить в базу товары из файла src/db/seed-data.ts, которых ещё нет? Существующие товары не изменятся.",
      )
    ) {
      return;
    }
    setBusy(true);
    setStatus("Читаем файл контента…");
    try {
      const response = await fetch("/api/seed", { method: "POST" });
      const data = await readResponse<{ synced?: number }>(response);
      if (!response.ok) throw new Error(data.error ?? "Синхронизация не удалась");
      await load();
      setStatus(`Добавлено новых товаров из файла: ${data.synced ?? 0}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Синхронизация не удалась");
    } finally {
      setBusy(false);
    }
  }

  const tabs: { id: View; label: string; count: number }[] = [
    { id: "products", label: "Товары", count: products.length },
    { id: "orders", label: "Заказы", count: orders.length },
    { id: "messages", label: "Сообщения", count: messages.length },
    { id: "subscribers", label: "Подписки", count: subscribers.length },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] px-5 pt-24 sm:px-8 lg:px-12 lg:pt-32">
      <header className="flex flex-col gap-6 border-b hairline pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <span className="meta">Студия / Управление контентом</span>
          <h1 className="type-display text-4xl sm:text-5xl">Студия</h1>
          <p className="max-w-xl text-sm leading-relaxed text-mist">
            Товары, заказы, сообщения из формы контактов и подписчики рассылки. Всё, что вы
            сохраняете здесь, сразу появляется на сайте.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={startNew}
            className="border border-bone/25 px-4 py-3 text-[0.625rem] uppercase tracking-[0.22em] text-bone transition-colors duration-500 hover:border-bone/70 hover:bg-bone hover:text-void"
          >
            + Новый товар
          </button>
          <button
            type="button"
            onClick={syncSeed}
            disabled={busy}
            className="border hairline px-4 py-3 text-[0.625rem] uppercase tracking-[0.22em] text-bone/70 transition-colors duration-500 hover:border-bone/50 hover:text-bone disabled:opacity-50"
          >
            Добавить из файла контента
          </button>
          <Link
            href="/shop"
            className="border hairline px-4 py-3 text-[0.625rem] uppercase tracking-[0.22em] text-bone/70 transition-colors duration-500 hover:border-bone/50 hover:text-bone"
          >
            Смотреть каталог →
          </Link>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2 border-b hairline py-4" aria-label="Разделы студии">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setView(tab.id)}
            aria-pressed={view === tab.id}
            className={`border px-3 py-2 text-[0.625rem] uppercase tracking-[0.22em] transition-colors duration-500 ${
              view === tab.id
                ? "border-bone/70 bg-bone text-void"
                : "border-bone/15 text-bone/70 hover:border-bone/40 hover:text-bone"
            }`}
          >
            {tab.label}
            <span className="ml-2 text-[0.5625rem] opacity-60">
              {String(tab.count).padStart(2, "0")}
            </span>
          </button>
        ))}
        {view !== "products" ? (
          <button
            type="button"
            onClick={() => void loadLists()}
            className="ml-auto border hairline px-3 py-2 text-[0.625rem] uppercase tracking-[0.22em] text-bone/70 transition-colors duration-500 hover:border-bone/50 hover:text-bone"
          >
            Обновить
          </button>
        ) : null}
      </nav>

      {view === "orders" ? (
        <section className="py-10">
          {orders.length === 0 ? (
            <p className="meta normal-case tracking-normal">Заказов пока нет.</p>
          ) : (
            <ul className="divide-y divide-bone/10 border-y hairline">
              {orders.map((order) => (
                <li key={order.id} className="grid gap-3 py-5 lg:grid-cols-[0.5fr_1fr_0.5fr] lg:gap-8">
                  <div className="space-y-1">
                    <p className="text-sm uppercase tracking-[0.06em] text-bone">{order.reference}</p>
                    <p className="meta normal-case tracking-normal">{formatWhen(order.createdAt)}</p>
                    <p className="meta">{STATUS_LABEL[order.status] ?? order.status}</p>
                  </div>
                  <div className="space-y-2 text-sm text-bone/85">
                    <p>
                      {order.customerName || "Без имени"} · {order.phone || "телефон не указан"} ·{" "}
                      <a href={`mailto:${order.email}`} className="link-underline">
                        {order.email}
                      </a>
                    </p>
                    <ul className="space-y-1 text-mist">
                      {order.items.map((line, index) => (
                        <li key={`${order.id}-${index}`}>
                          {line.name} · {line.size} × {line.quantity} ·{" "}
                          {formatPrice(line.priceCents * line.quantity, order.currency)}
                        </li>
                      ))}
                    </ul>
                    {order.note ? (
                      <p className="whitespace-pre-wrap text-mist">Комментарий: {order.note}</p>
                    ) : null}
                    {order.shippingZone ? (
                      <p className="meta normal-case tracking-normal">
                        Доставка: {getZone(order.shippingZone).label} —{" "}
                        {order.shippingCents === null || order.shippingCents === undefined
                          ? "тариф уточнить"
                          : order.shippingCents === 0
                            ? "бесплатно"
                            : formatPrice(order.shippingCents, order.currency)}
                      </p>
                    ) : null}
                  </div>
                  <div className="lg:text-right">
                    <p className="type-display text-xl">
                      {formatPrice(order.subtotalCents + (order.shippingCents ?? 0), order.currency)}
                    </p>
                    {order.shippingCents ? (
                      <p className="meta normal-case tracking-normal">
                        товары {formatPrice(order.subtotalCents, order.currency)}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {view === "messages" ? (
        <section className="py-10">
          {messages.length === 0 ? (
            <p className="meta normal-case tracking-normal">Сообщений пока нет.</p>
          ) : (
            <ul className="divide-y divide-bone/10 border-y hairline">
              {messages.map((message) => (
                <li key={message.id} className="grid gap-3 py-5 lg:grid-cols-[0.5fr_1.5fr] lg:gap-8">
                  <div className="space-y-1">
                    <p className="text-sm uppercase tracking-[0.06em] text-bone">{message.subject}</p>
                    <p className="meta normal-case tracking-normal">{formatWhen(message.createdAt)}</p>
                    <p className="text-sm text-bone/85">
                      {message.name || "Без имени"} ·{" "}
                      <a href={`mailto:${message.email}`} className="link-underline">
                        {message.email}
                      </a>
                    </p>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-bone/85">
                    {message.body}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {view === "subscribers" ? (
        <section className="py-10">
          {subscribers.length === 0 ? (
            <p className="meta normal-case tracking-normal">Подписчиков пока нет.</p>
          ) : (
            <ul className="divide-y divide-bone/10 border-y hairline">
              {subscribers.map((subscriber) => (
                <li key={subscriber.id} className="flex flex-wrap items-baseline justify-between gap-4 py-3">
                  <span className="text-sm text-bone/85">{subscriber.email}</span>
                  <span className="meta normal-case tracking-normal">
                    {formatWhen(subscriber.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {view === "products" ? (
      <div className="grid gap-10 py-10 lg:grid-cols-[0.42fr_1fr] lg:gap-14">
        <div className="space-y-3">
          <p className="eyebrow">{products.length} товаров в базе</p>
          <ul className="divide-y divide-bone/10 border-y hairline">
            {products.map((product) => (
              <li key={product.slug}>
                <button
                  type="button"
                  onClick={() => select(product)}
                  className={`flex w-full items-center justify-between gap-4 py-3 text-left transition-colors duration-400 ${
                    selectedSlug === product.slug ? "text-bone" : "text-bone/70 hover:text-bone"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-xs uppercase tracking-[0.1em]">
                      {product.name}
                    </span>
                    <span className="meta">
                      {product.categoryLabel}
                      {product.published ? "" : " · черновик"}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="meta">{formatPrice(product.priceCents, product.currency)}</span>
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        product.modelUrl ? "bg-bone" : "bg-bone/20"
                      }`}
                      title={product.modelUrl ? "3D-модель прикреплена" : "3D-модели нет"}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="meta normal-case tracking-normal">
            Заполненная точка — у вещи есть 3D-модель. Без модели на странице товара 3D-блок
            не показывается.
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="eyebrow block">Название</span>
              <input
                className={field}
                value={form.name}
                onChange={(event) => update({ name: event.target.value })}
                placeholder="Куртка GV-10"
              />
            </label>
            <label className="space-y-2">
              <span className="eyebrow block">Slug (адрес)</span>
              <input
                className={field}
                value={form.slug}
                onChange={(event) => update({ slug: event.target.value })}
                placeholder="kurtka-gv-10"
              />
            </label>
            <label className="space-y-2">
              <span className="eyebrow block">Артикул</span>
              <input
                className={field}
                value={form.code}
                onChange={(event) => update({ code: event.target.value })}
                placeholder="GV-10"
              />
            </label>
            <label className="space-y-2">
              <span className="eyebrow block">Цена (₽)</span>
              <input
                className={field}
                inputMode="decimal"
                value={form.price}
                onChange={(event) => update({ price: event.target.value })}
                placeholder="8900"
              />
            </label>
            <label className="space-y-2">
              <span className="eyebrow block">Категория (slug)</span>
              <input
                className={field}
                value={form.category}
                onChange={(event) => update({ category: event.target.value })}
                placeholder="outerwear"
              />
            </label>
            <label className="space-y-2">
              <span className="eyebrow block">Название категории</span>
              <input
                className={field}
                value={form.categoryLabel}
                onChange={(event) => update({ categoryLabel: event.target.value })}
                placeholder="Верхняя одежда"
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="eyebrow block">Короткое описание</span>
            <textarea
              rows={3}
              className={`${field} resize-none`}
              value={form.description}
              onChange={(event) => update({ description: event.target.value })}
            />
          </label>

          <label className="block space-y-2">
            <span className="eyebrow block">Редакционный текст</span>
            <textarea
              rows={4}
              className={`${field} resize-none`}
              value={form.story}
              onChange={(event) => update({ story: event.target.value })}
            />
          </label>

          <div className="space-y-2">
            <span className="eyebrow block">Изображения товара</span>
            <AdminImageManager
              value={form.images}
              onChange={(images) => update({ images })}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="eyebrow block">Размеры — через запятую</span>
              <textarea
                rows={4}
                className={`${field} resize-none font-mono text-xs`}
                value={form.sizes}
                onChange={(event) => update({ sizes: event.target.value })}
                placeholder="S, M, L, XL"
              />
            </label>
            <label className="space-y-2">
              <span className="eyebrow block">Характеристики — «Поле: значение» в строке</span>
              <textarea
                rows={4}
                className={`${field} resize-none font-mono text-xs`}
                value={form.details}
                onChange={(event) => update({ details: event.target.value })}
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="eyebrow block">
              GLB / GLTF — оставьте пустым, если 3D-модели нет
            </span>
            <input
              className={`${field} font-mono text-xs`}
              value={form.modelUrl}
              onChange={(event) => update({ modelUrl: event.target.value })}
              placeholder="/models/piece.glb"
            />
          </label>

          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => update({ featured: event.target.checked })}
                className="h-4 w-4 accent-white"
              />
              <span className="eyebrow">На главной</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) => update({ published: event.target.checked })}
                className="h-4 w-4 accent-white"
              />
              <span className="eyebrow">Опубликован</span>
            </label>
            <label className="flex items-center gap-3">
              <span className="eyebrow">Позиция</span>
              <input
                className={`${field} w-20`}
                inputMode="numeric"
                value={form.position}
                onChange={(event) => update({ position: event.target.value })}
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t hairline pt-6">
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="flex items-center gap-6 border border-bone/25 px-5 py-4 transition-colors duration-700 ease-[var(--ease-premium)] hover:border-bone/70 hover:bg-bone hover:text-void disabled:opacity-50"
            >
              <span className="eyebrow text-bone transition-colors duration-700 group-hover:text-void">
                {selectedSlug ? "Сохранить" : "Создать товар"}
              </span>
              <span>→</span>
            </button>
            {selectedSlug ? (
              <button
                type="button"
                onClick={remove}
                disabled={busy}
                className="eyebrow border hairline px-4 py-3 text-bone/60 transition-colors duration-500 hover:border-bone/40 hover:text-bone disabled:opacity-50"
              >
                Удалить
              </button>
            ) : null}
            {status ? (
              <p className="meta text-bone/80" role="status">
                {status}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      ) : null}
    </div>
  );
}
