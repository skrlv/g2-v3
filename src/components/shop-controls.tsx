"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { SORT_OPTIONS } from "@/lib/catalog";
import type { Category, SortValue } from "@/lib/catalog";

export function ShopControls({
  categories,
  activeCategory,
  activeSort,
  count,
}: {
  categories: Category[];
  activeCategory: string;
  activeSort: SortValue;
  count: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function push(next: { category?: string; sort?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.category !== undefined) {
      if (next.category === "all") params.delete("category");
      else params.set("category", next.category);
    }
    if (next.sort !== undefined) {
      if (next.sort === "editorial") params.delete("sort");
      else params.set("sort", next.sort);
    }
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/shop?${query}` : "/shop", { scroll: false });
    });
  }

  return (
    <div className="sticky top-16 z-30 -mx-5 border-y hairline bg-void/85 px-5 py-3 backdrop-blur-md sm:-mx-8 sm:px-8 lg:static lg:mx-0 lg:border-y-0 lg:border-b lg:bg-transparent lg:px-0 lg:backdrop-blur-none">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar -mx-1 flex items-center gap-1 overflow-x-auto px-1">
          <button
            type="button"
            onClick={() => push({ category: "all" })}
            className={`shrink-0 border px-3 py-2 text-[0.625rem] uppercase tracking-[0.22em] transition-colors duration-500 ${
              activeCategory === "all"
                ? "border-bone/70 bg-bone text-void"
                : "border-bone/15 text-bone/70 hover:border-bone/40 hover:text-bone"
            }`}
          >
            Все
          </button>
          {categories.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => push({ category: category.slug })}
              className={`shrink-0 border px-3 py-2 text-[0.625rem] uppercase tracking-[0.22em] transition-colors duration-500 ${
                activeCategory === category.slug
                  ? "border-bone/70 bg-bone text-void"
                  : "border-bone/15 text-bone/70 hover:border-bone/40 hover:text-bone"
              }`}
            >
              {category.label}
              <span className="ml-2 text-[0.5625rem] opacity-60">
                {String(category.count).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="meta whitespace-nowrap">
            {String(count).padStart(2, "0")} вещей
            {pending ? " · обновление" : ""}
          </span>
          <label className="flex items-center gap-3">
            <span className="eyebrow hidden sm:block">Сортировка</span>
            <select
              value={activeSort}
              onChange={(event) => push({ sort: event.target.value })}
              className="border hairline bg-transparent px-3 py-2 text-[0.625rem] uppercase tracking-[0.2em] text-bone focus:border-bone/40 focus:outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-carbon">
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
