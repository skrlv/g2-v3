import Link from "next/link";
import { SectionHeading } from "@/components/brand";
import { AddToCart, StickyBuyBar, type BuyableProduct } from "@/components/add-to-cart";
import { BuyStateProvider } from "@/components/buy-state";
import { ImageReveal, Parallax, Reveal } from "@/components/motion";
import { ProductGallery } from "@/components/product-gallery";
import { ProductGrid } from "@/components/product-grid";
import { ThreeDViewer } from "@/components/three-d-viewer";
import { formatPrice } from "@/lib/format";
import { resolveModelUrl, type Product } from "@/lib/products";

function toBuyable(product: Product): BuyableProduct {
  return {
    slug: product.slug,
    name: product.name,
    priceCents: product.priceCents,
    currency: product.currency,
    image: product.images[0] ?? null,
    sizes: product.sizes.length ? product.sizes : ["ONE SIZE"],
  };
}

export function ProductPage({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const buyable = toBuyable(product);
  const modelUrl = resolveModelUrl(product);

  return (
    <BuyStateProvider initialSize={buyable.sizes[0] ?? "ONE SIZE"}>
      <article className="mx-auto w-full max-w-[1600px] px-5 pt-24 sm:px-8 lg:px-12 lg:pt-32">
        <nav className="flex flex-wrap items-center gap-3" aria-label="Хлебные крошки">
          <Link href="/shop" className="meta text-bone/60 transition-colors duration-500 hover:text-bone">
            Каталог
          </Link>
          <span className="meta">/</span>
          <Link
            href={`/shop?category=${product.category}`}
            className="meta text-bone/60 transition-colors duration-500 hover:text-bone"
          >
            {product.categoryLabel}
          </Link>
          <span className="meta">/</span>
          <span className="meta text-bone/80">{product.code || product.name}</span>
        </nav>

        <div className="mt-7 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          <div className="space-y-9">
            <header className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <span className="eyebrow">{product.categoryLabel}</span>
                <span className="meta">{product.code || "G2"}</span>
              </div>
              <h1 className="type-display text-3xl sm:text-4xl lg:text-5xl">{product.name}</h1>
              <p className="type-display text-2xl text-bone/90">
                {formatPrice(product.priceCents, product.currency)}
              </p>
              <p className="max-w-xl text-sm leading-relaxed text-mist">
                {product.description}
              </p>
            </header>

            <AddToCart product={buyable} />

            <div className="divide-y divide-bone/10 border-y hairline">
              <details className="group py-4" open>
                <summary className="flex cursor-pointer items-center justify-between">
                  <span className="eyebrow">Характеристики</span>
                  <span className="text-bone/50 transition-transform duration-500 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <dl className="mt-4 space-y-3">
                  {product.details.map((detail) => (
                    <div key={detail.label} className="flex justify-between gap-6">
                      <dt className="meta">{detail.label}</dt>
                      <dd className="max-w-[62%] text-right text-sm text-bone/85">
                        {detail.value}
                      </dd>
                    </div>
                  ))}
                  <div className="flex justify-between gap-6">
                    <dt className="meta">Размеры</dt>
                    <dd className="max-w-[62%] text-right text-sm text-bone/85">
                      {product.sizes.join(" · ")}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-6">
                    <dt className="meta">Артикул</dt>
                    <dd className="text-right text-sm text-bone/85">{product.code || "—"}</dd>
                  </div>
                </dl>
              </details>
              <details className="group py-4">
                <summary className="flex cursor-pointer items-center justify-between">
                  <span className="eyebrow">Доставка и возврат</span>
                  <span className="text-bone/50 transition-transform duration-500 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-mist">
                  Отправляем по России и миру со студии за 2–4 рабочих дня, бесплатно от
                  25 000 ₽. Возврат — 14 дней на неношеные вещи с бирками. Заказные и
                  нумерованные объекты возврату не подлежат.{" "}
                  <Link href="/delivery" className="link-underline text-bone/80">
                    Условия доставки
                  </Link>
                </p>
              </details>
            </div>
          </div>
        </div>

        {/* 3D-просмотр — только у вещей, к которым прикреплена модель */}
        {modelUrl ? (
          <section className="mt-20 lg:mt-28">
            <SectionHeading
              title="3D-объект"
              action={<span className="meta hidden sm:block">Трёхмерный просмотр</span>}
            />
            <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
              <ThreeDViewer
                modelUrl={modelUrl}
                fallbackImage={product.images[0] ?? "/images/texture.jpg"}
                alt={product.name}
                aspect="aspect-4/5 sm:aspect-16/11 lg:aspect-4/5"
                className="border hairline"
              />
              <Reveal delay={120} className="flex flex-col justify-between gap-8">
                <div className="space-y-5">
                  <p className="eyebrow">Трёхмерная модель</p>
                  <p className="type-display text-2xl sm:text-3xl">Поверните вещь в пространстве.</p>
                  <p className="max-w-md text-sm leading-relaxed text-mist">
                    Потяните, чтобы вращать, колесо — для масштаба. Геометрия всегда
                    остаётся в центре кадра.
                  </p>
                </div>
              </Reveal>
            </div>
          </section>
        ) : null}

        {product.story ? (
          <section className="mt-20 grid gap-10 lg:mt-28 lg:grid-cols-2 lg:items-center lg:gap-16">
            <Parallax amount={0.07} className="hidden lg:block">
              <ImageReveal
                src={product.images[1] ?? product.images[0] ?? "/images/texture.jpg"}
                alt={`${product.name} — деталь`}
                className="aspect-4/3 w-full bg-graphite"
              />
            </Parallax>
            <Reveal className="space-y-6">
              <span className="eyebrow">Заметки</span>
              <p className="text-xl leading-relaxed text-bone/90 sm:text-2xl">{product.story}</p>
            </Reveal>
          </section>
        ) : null}

        {related.length ? (
          <section className="mt-20 lg:mt-28">
            <SectionHeading
              title="Рядом в каталоге"
              action={
                <Link
                  href="/shop"
                  className="link-underline eyebrow whitespace-nowrap text-bone/70 transition-colors duration-500 hover:text-bone"
                >
                  Все товары →
                </Link>
              }
            />
            <div className="mt-8 lg:mt-10">
              <ProductGrid products={related} columns={3} />
            </div>
          </section>
        ) : null}

        <div className="h-14 lg:h-20" />
        <StickyBuyBar product={buyable} />
      </article>
    </BuyStateProvider>
  );
}
