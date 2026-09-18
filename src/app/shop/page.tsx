import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductGrid } from "@/components/product-grid";
import { ShopControls } from "@/components/shop-controls";
import { Reveal, RevealLines } from "@/components/motion";
import { isSortValue, listCategories, listProducts, type SortValue } from "@/lib/products";
import { siteCopy } from "@/db/seed-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Каталог",
  description:
    "Полный каталог G2: тяжёлый футер, мытый хлопок, техническая верхняя одежда и литые объекты.",
};

type SearchParams = Promise<{ category?: string; sort?: string }>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const activeSort: SortValue = isSortValue(params.sort) ? params.sort : "editorial";
  const activeCategory = params.category ?? "all";

  const [categories, products] = await Promise.all([
    listCategories(),
    listProducts({ category: activeCategory, sort: activeSort }),
  ]);

  return (
    <div className="mx-auto w-full max-w-[1600px] px-5 pt-24 sm:px-8 lg:px-12 lg:pt-32">
      <header className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="meta">Каталог / MMXXVI</span>
          <span className="h-px w-16 bg-bone/25" />
        </div>
        <RevealLines
          lines={["Каталог", "G2"]}
          lineClassName="type-display text-[13vw] leading-[0.92] sm:text-6xl lg:text-7xl"
        />
        <Reveal delay={160}>
          <p className="max-w-xl text-sm leading-relaxed text-mist">
            {categories.reduce((total, category) => total + category.count, 0)} вещей,
            одна визуальная система. Фильтруйте по категории, сортируйте по цене или
            читайте сетку в порядке студии.
          </p>
        </Reveal>
      </header>

      <div className="mt-10 lg:mt-14">
        <Suspense
          fallback={
            <div className="border-y hairline py-3">
              <span className="meta">Загрузка фильтров…</span>
            </div>
          }
        >
          <ShopControls
            categories={categories}
            activeCategory={activeCategory}
            activeSort={activeSort}
            count={products.length}
          />
        </Suspense>
      </div>

      <div className="mt-8 pb-8 lg:mt-10">
        <ProductGrid products={products} columns={4} priorityCount={4} />
      </div>

      <p className="meta pb-16">{siteCopy.coordinates}</p>
    </div>
  );
}
