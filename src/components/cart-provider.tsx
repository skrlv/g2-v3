"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { STORE_CURRENCY, pathOnly } from "@/lib/catalog";
import { trackAddToCart } from "@/lib/analytics";

export type CartItem = {
  slug: string;
  name: string;
  size: string;
  quantity: number;
  priceCents: number;
  currency: string;
  image: string | null;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotalCents: number;
  currency: string;
  isOpen: boolean;
  lastAdded: string | null;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "g2.bag.v1";
const MAX_QUANTITY = 10;

export function itemKey(item: Pick<CartItem, "slug" | "size">) {
  return `${item.slug}::${item.size}`;
}

/** Корзина из localStorage: проверяем форму записей, картинки только обычными ссылками. */
function sanitize(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  const result: CartItem[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as Partial<CartItem>;
    if (typeof item.slug !== "string" || typeof item.name !== "string") continue;
    const quantity = Number(item.quantity);
    const priceCents = Number(item.priceCents);
    result.push({
      slug: item.slug,
      name: item.name,
      size: typeof item.size === "string" && item.size ? item.size : "ONE SIZE",
      quantity:
        Number.isInteger(quantity) && quantity > 0 ? Math.min(MAX_QUANTITY, quantity) : 1,
      priceCents: Number.isFinite(priceCents) ? priceCents : 0,
      currency: STORE_CURRENCY,
      image: pathOnly(item.image),
    });
  }
  return result;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Корзину из localStorage можно прочитать только после гидратации — на сервере
  // её нет, а разный HTML на сервере и клиенте ломает гидратацию.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- чтение внешнего хранилища после монтирования
      if (raw) setItems(sanitize(JSON.parse(raw)));
    } catch {
      /* ignore corrupted storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage disabled or full */
    }
  }, [items, hydrated]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    if (isOpen) window.__lenis?.stop();
    else window.__lenis?.start();
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const addItem = useCallback<CartContextValue["addItem"]>((incoming) => {
    const quantity = Math.min(MAX_QUANTITY, Math.max(1, incoming.quantity ?? 1));
    // Фото из студии (data-URL) в корзину не кладём: localStorage переполнится
    // и корзина перестанет сохраняться. Пути к файлам сохраняются как есть.
    const item: CartItem = {
      ...incoming,
      quantity,
      currency: STORE_CURRENCY,
      image: pathOnly(incoming.image),
    };
    setItems((current) => {
      const key = itemKey(item);
      const found = current.find((entry) => itemKey(entry) === key);
      if (found) {
        return current.map((entry) =>
          itemKey(entry) === key
            ? { ...entry, quantity: Math.min(MAX_QUANTITY, entry.quantity + quantity) }
            : entry,
        );
      }
      return [...current, item];
    });
    setLastAdded(itemKey(item));
    setIsOpen(true);
    window.setTimeout(() => setLastAdded(null), 2600);
    trackAddToCart({
      id: item.slug,
      name: item.name,
      price: item.priceCents / 100,
      quantity,
      variant: item.size,
    });
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((total, item) => total + item.quantity, 0);
    const subtotalCents = items.reduce(
      (total, item) => total + item.priceCents * item.quantity,
      0,
    );
    return {
      items,
      count,
      subtotalCents,
      currency: STORE_CURRENCY,
      isOpen,
      lastAdded,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      setQuantity: (key, quantity) =>
        setItems((current) =>
          quantity <= 0
            ? current.filter((item) => itemKey(item) !== key)
            : current.map((item) =>
                itemKey(item) === key
                  ? { ...item, quantity: Math.min(MAX_QUANTITY, quantity) }
                  : item,
              ),
        ),
      removeItem: (key) =>
        setItems((current) => current.filter((item) => itemKey(item) !== key)),
      clear: () => setItems([]),
    };
  }, [items, isOpen, lastAdded, addItem]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return context;
}
