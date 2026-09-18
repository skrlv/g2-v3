import Link from "next/link";
import { Logo, SectionHeading } from "@/components/brand";
import { DroneMark } from "@/components/drone-mark";
import { Hero } from "@/components/hero";
import { ImageReveal, Parallax, Reveal, RevealLines } from "@/components/motion";
import { ProductGrid } from "@/components/product-grid";
import { ThreeDViewer } from "@/components/three-d-viewer";
import { siteCopy } from "@/db/seed-data";
import {
  getFeaturedProducts,
  getModelPiece,
  listCategories,
  resolveModelUrl,
} from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, categories, modelPiece] = await Promise.all([
    getFeaturedProducts(4),
    listCategories(),
    getModelPiece(),
  ]);

  return (
    <>
      <Hero />

      {/* НОВЫЕ ПОСТУПЛЕНИЯ */}
      <section id="catalogue" className="scroll-mt-24 px-5 pt-14 sm:px-8 lg:px-12 lg:pt-20">
        <div className="mx-auto w-full max-w-[1600px]">
          <SectionHeading
            title="Новые поступления"
            action={
              <Link
                href="/shop"
                className="link-underline eyebrow whitespace-nowrap text-bone/70 transition-colors duration-500 hover:text-bone"
              >
                Все товары →
              </Link>
            }
          />
          <div className="mt-8 lg:mt-12">
            <ProductGrid products={featured} columns={4} priorityCount={2} />
          </div>
        </div>
      </section>

      {/* РЕДАКЦИОННЫЙ БЛОК: позиция бренда */}
      <section id="position" className="mt-20 scroll-mt-24 border-y hairline bg-carbon/60 lg:mt-28">
        <div className="mx-auto grid w-full max-w-[1600px] items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[0.85fr_1.05fr_0.85fr] lg:gap-14 lg:px-12 lg:py-20">
          <Reveal className="order-2 space-y-8 lg:order-1">
            <p className="text-lg leading-relaxed text-bone/85 sm:text-xl">
              {siteCopy.position}
            </p>
            <div className="relative inline-block">
              <DroneMark panelLines={false} className="h-24 w-auto text-bone/40 sm:h-28" />
              <span className="absolute -left-3 -top-3 h-6 w-px bg-bone/20" />
              <span className="absolute -left-3 -top-3 h-px w-6 bg-bone/20" />
            </div>
            <p className="meta">{siteCopy.season}</p>
          </Reveal>

          <Reveal delay={120} className="order-1 space-y-5 text-center lg:order-2 lg:text-left">
            <Logo size="md" className="mx-auto text-bone lg:mx-0" />
            <p className="mx-auto max-w-md text-sm leading-relaxed text-mist sm:text-base lg:mx-0">
              {siteCopy.manifesto}
            </p>
            <Link
              href="/about"
              data-cursor="hover"
              className="group mx-auto inline-flex items-center gap-7 border border-bone/25 px-5 py-4 transition-colors duration-700 ease-[var(--ease-premium)] hover:border-bone/70 hover:bg-bone hover:text-void lg:mx-0"
            >
              <span className="eyebrow text-bone transition-colors duration-700 group-hover:text-void">
                Узнать больше
              </span>
              <span className="transition-transform duration-700 ease-[var(--ease-premium)] group-hover:translate-x-1.5">
                →
              </span>
            </Link>
          </Reveal>

          <Parallax amount={0.06} className="order-3">
            <ImageReveal
              src="/images/texture.jpg"
              alt="Сырая бетонная поверхность"
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="aspect-4/3 w-full bg-graphite"
              imageClassName="opacity-80"
            />
          </Parallax>
        </div>
      </section>

      {/* КАТЕГОРИИ */}
      <section id="categories" className="mt-20 scroll-mt-24 px-5 sm:px-8 lg:mt-28 lg:px-12">
        <div className="mx-auto w-full max-w-[1600px]">
          <SectionHeading title="Категории" />
          <div className="mt-8 grid grid-cols-1 gap-x-4 gap-y-5 xs:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-10">
            {categories.map((category, index) => (
              <Reveal key={category.slug} delay={index * 60}>
                <Link
                  href={`/shop?category=${category.slug}`}
                  className="group flex items-center justify-between border-b hairline pb-3 transition-colors duration-700"
                >
                  <span className="type-display text-lg sm:text-xl">{category.label}</span>
                  <span className="meta flex items-center gap-3">
                    {String(category.count).padStart(2, "0")}
                    <span className="transition-transform duration-700 ease-[var(--ease-premium)] group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3D-ПРОСМОТР — только если у какой-то вещи есть модель */}
      {modelPiece ? (
        <section className="mt-20 px-5 sm:px-8 lg:mt-28 lg:px-12">
          <div className="mx-auto w-full max-w-[1600px]">
            <SectionHeading
              title="3D-просмотр"
              action={<span className="meta hidden sm:block">GLB / GLTF</span>}
            />
            <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-14">
              <Reveal className="space-y-6">
                <RevealLines
                  lines={["Каждая вещь", "вращается."]}
                  lineClassName="type-display text-3xl leading-[0.95] sm:text-4xl lg:text-5xl"
                />
                <p className="max-w-md text-sm leading-relaxed text-mist">
                  У «{modelPiece.name}» есть трёхмерная модель: покрутите и рассмотрите
                  обработку со всех сторон.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href={`/shop/${modelPiece.slug}`}
                    data-cursor="hover"
                    className="group inline-flex items-center gap-6 border border-bone/25 px-5 py-4 transition-colors duration-700 ease-[var(--ease-premium)] hover:border-bone/70 hover:bg-bone hover:text-void"
                  >
                    <span className="eyebrow text-bone transition-colors duration-700 group-hover:text-void">
                      Открыть {modelPiece.code || modelPiece.name}
                    </span>
                    <span className="transition-transform duration-700 ease-[var(--ease-premium)] group-hover:translate-x-1.5">
                      →
                    </span>
                  </Link>
                  <Link
                    href="/shop"
                    className="eyebrow text-bone/60 transition-colors duration-500 hover:text-bone"
                  >
                    или смотреть каталог
                  </Link>
                </div>
              </Reveal>
              <ThreeDViewer
                modelUrl={resolveModelUrl(modelPiece)}
                fallbackImage={modelPiece.images[0] ?? "/images/texture.jpg"}
                alt={modelPiece.name}
                aspect="aspect-4/5 sm:aspect-16/11 lg:aspect-square"
                className="border hairline"
              />
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-20 px-5 pb-8 sm:px-8 lg:mt-28 lg:px-12">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 border-t hairline pt-8 lg:flex-row lg:items-center lg:justify-between">
          <p className="meta">{siteCopy.coordinates}</p>
          <p className="eyebrow">{siteCopy.tagline}</p>
          <p className="meta">Студия — Москва / Берлин</p>
        </div>
      </section>
    </>
  );
}
