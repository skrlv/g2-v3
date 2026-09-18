"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

/**
 * Общее состояние покупки на странице товара. Выбранный размер и количество
 * делят основной блок «В корзину» и нижняя панель на телефоне — раньше панель
 * всегда клала первый размер из списка, а не выбранный. `mainVisible` — виден
 * ли основной блок: пока он на экране, панель прячется.
 */
type BuyState = {
  size: string;
  setSize: (size: string) => void;
  quantity: number;
  setQuantity: (update: (value: number) => number) => void;
  mainVisible: boolean;
  setMainVisible: (visible: boolean) => void;
};

const BuyContext = createContext<BuyState | null>(null);

export function BuyStateProvider({
  initialSize,
  children,
}: {
  initialSize: string;
  children: ReactNode;
}) {
  const [size, setSize] = useState(initialSize);
  const [quantity, setQuantityState] = useState(1);
  const [mainVisible, setMainVisible] = useState(true);

  const value: BuyState = {
    size,
    setSize,
    quantity,
    setQuantity: (update) =>
      setQuantityState((current) => Math.min(10, Math.max(1, update(current)))),
    mainVisible,
    setMainVisible,
  };

  return <BuyContext.Provider value={value}>{children}</BuyContext.Provider>;
}

export function useBuyState(): BuyState {
  const context = useContext(BuyContext);
  if (!context) {
    throw new Error("useBuyState must be used inside <BuyStateProvider>");
  }
  return context;
}
