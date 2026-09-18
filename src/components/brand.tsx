import type { ReactNode } from "react";

/**
 * ФИРМЕННЫЙ БЛОК G2
 * -----------------
 * Типографический знак «G2»: дисплейный гротеск (Oswald), плотный трекинг,
 * лёгкий технический наклон. Два размера:
 *
 *   <Logo />      — знак для шапки, героя, футера, «О бренде»
 *   <BrandMark /> — компактная версия для колонтитулов и бегущей строки
 *   <Wordmark />  — просто текст «G2» в фирменном начертании
 *
 * Логотип целиком задаётся текстом и CSS-утилитой `.wordmark`, поэтому
 * масштабируется без потерь и наследует цвет (`currentColor`).
 */

export function Wordmark({
  className = "",
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return <span className={`wordmark ${className}`}>{children ?? "G2"}</span>;
}

/**
 * Основной знак. `size` управляет масштабом:
 *   nav   — 26–28 px, шапка
 *   md    — ~56 px, футер / «О бренде»
 *   hero  — до 11 rem, первый экран
 */
export function Logo({
  className = "",
  size = "nav",
  tagline = false,
}: {
  className?: string;
  size?: "nav" | "md" | "hero";
  tagline?: boolean;
}) {
  const sizeClass =
    size === "hero"
      ? "text-[24vw] leading-[0.82] sm:text-[17vw] lg:text-[11rem]"
      : size === "md"
        ? "text-5xl leading-none sm:text-6xl"
        : "text-[1.7rem] leading-none sm:text-[1.85rem]";

  return (
    <span className={`inline-flex flex-col ${className}`}>
      <span className={`logo-mark ${sizeClass}`} aria-label="G2">
        <span aria-hidden="true">G</span>
        <span aria-hidden="true" className="logo-mark__two">
          2
        </span>
      </span>
      {tagline ? (
        <span className="eyebrow mt-[0.35em] text-bone/60">Точность. Скорость. Результат.</span>
      ) : null}
    </span>
  );
}

/** Компактный знак для колонтитулов, бегущей строки и мелких меток. */
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={`logo-mark text-base leading-none ${className}`} aria-label="G2">
      <span aria-hidden="true">G</span>
      <span aria-hidden="true" className="logo-mark__two">
        2
      </span>
    </span>
  );
}

export function SectionHeading({
  index,
  title,
  action,
  underline = true,
}: {
  index?: string;
  title: string;
  action?: ReactNode;
  underline?: boolean;
}) {
  return (
    <div
      className={`flex items-end justify-between gap-6 ${
        underline ? "border-b hairline pb-4" : ""
      }`}
    >
      <div className="flex items-baseline gap-4 sm:gap-6">
        {index ? <span className="meta text-bone/50">{index}</span> : null}
        <h2 className="eyebrow-lg text-bone">{title}</h2>
        {underline ? <span className="hidden h-px w-24 bg-bone/20 sm:block" /> : null}
      </div>
      {action}
    </div>
  );
}
