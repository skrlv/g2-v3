"use client";

import { scrollToTarget } from "@/components/smooth-scroll";

export type IndexedSection = {
  /** id секции на странице, без «#» */
  id: string;
  label: string;
};

/**
 * Индекс разделов в низу героя: штрих + номер + подпись.
 * Раньше здесь стояли четыре декоративные линии, которые читались как
 * индикатор слайдера, но ничего не делали. Теперь каждая — ссылка на раздел
 * главной, прокрутка через Lenis (или нативная, если он выключен).
 */
export function SectionIndex({
  sections,
  className = "",
}: {
  sections: IndexedSection[];
  className?: string;
}) {
  return (
    <nav className={`flex flex-wrap items-center gap-x-7 gap-y-3 ${className}`} aria-label="Разделы страницы">
      {sections.map((section, index) => (
        <button
          key={section.id}
          type="button"
          data-cursor="hover"
          onClick={() => scrollToTarget(`#${section.id}`, -80)}
          className="group flex items-center gap-3 text-left"
        >
          <span
            className={`h-px transition-[width,background-color] duration-700 ease-[var(--ease-premium)] group-hover:w-12 group-hover:bg-bone/85 ${
              index === 0 ? "w-12 bg-bone/85" : "w-7 bg-bone/35"
            }`}
          />
          <span className="meta text-bone/55 transition-colors duration-500 group-hover:text-bone">
            0{index + 1}
          </span>
          <span className="meta hidden text-bone/75 transition-colors duration-500 group-hover:text-bone sm:block">
            {section.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
