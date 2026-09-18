import { ProductCard } from "@/components/product-card";
import { toCardProduct, type Product } from "@/lib/products";

export function ProductGrid({
  products,
  columns = 4,
  priorityCount = 0,
}: {
  products: Product[];
  columns?: 3 | 4;
  priorityCount?: number;
}) {
  if (!products.length) {
    return (
      <div className="border hairline px-6 py-20 text-center">
        <p className="eyebrow">Ничего не найдено</p>
        <p className="eyebrow-lg mt-5 text-bone">Этот фильтр ничего не вернул</p>
        <p className="mt-3 text-sm text-mist">
          Сбросьте фильтры, чтобы увидеть весь каталог.
        </p>
      </div>
    );
  }

  const columnClass =
    columns === 3
      ? "grid-cols-1 xs:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <div className={`grid gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-12 ${columnClass}`}>
      {products.map((product, index) => (
        <ProductCard
          key={product.slug}
          product={toCardProduct(product)}
          index={index}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
