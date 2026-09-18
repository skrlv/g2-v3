import Link from "next/link";
import { Logo, Wordmark } from "@/components/brand";
import { DroneMark } from "@/components/drone-mark";
import { ImageReveal, Parallax, Reveal } from "@/components/motion";
import { ScrollButton } from "@/components/scroll-cue";
import { SectionIndex } from "@/components/section-index";
import { siteCopy } from "@/db/seed-data";

export function Hero() {
  return (
    <section className="relative min-h-[92svh] w-full overflow-hidden border-b hairline">
      <Parallax amount={0.09} className="absolute inset-0 -top-10 h-[115%] w-full">
        <ImageReveal
          src="/images/hero.jpg"
          alt="G2 — худи оверсайз на фоне бетонной стены"
          priority
          sizes="100vw"
          position="66% 28%"
          className="h-full w-full"
          imageClassName="opacity-75"
        />
      </Parallax>
      <div className="absolute inset-0 bg-linear-to-r from-void via-void/80 to-void/25" />
      <div className="absolute inset-0 bg-linear-to-t from-void via-transparent to-void/45" />

      {/* правый измерительный столбец: трафареты, вертикальная линия, слоган */}
      <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-8 xl:flex">
        <span className="h-28 w-px bg-linear-to-b from-transparent to-bone/35" />
        <div className="flex flex-col items-end gap-3">
          {[0, 1, 2, 3].map((step) => (
            <DroneMark key={step} panelLines={false} className="h-7 w-5 text-bone/55" />
          ))}
        </div>
        <div className="mt-2 flex items-stretch gap-4">
          <span className="relative block w-px bg-bone/25">
            <span className="absolute -left-1.5 top-0 h-px w-3 bg-bone/40" />
            <span className="absolute -left-1.5 top-1/2 h-px w-3 bg-bone/40" />
            <span className="absolute -left-1.5 bottom-0 h-px w-3 bg-bone/40" />
          </span>
          <p className="max-w-[7.5rem] text-right text-sm leading-snug text-bone/85">
            Точность,
            <br />
            Скорость,
            <br />
            Результат.
          </p>
        </div>
        <span className="h-28 w-px bg-linear-to-t from-transparent to-bone/35" />
      </div>

      <div className="relative mx-auto flex min-h-[92svh] w-full max-w-[1600px] flex-col justify-between px-5 pb-8 pt-24 sm:px-8 lg:px-12 lg:pb-12 lg:pt-32">
        <div className="max-w-3xl">
          <Reveal delay={60}>
            <span className="meta text-bone/70">{siteCopy.season}</span>
          </Reveal>

          <Reveal delay={200} className="mt-5">
            <Logo size="hero" className="text-bone" />
          </Reveal>

          <Reveal delay={420} className="mt-7 max-w-lg">
            <p className="eyebrow-lg leading-relaxed text-bone/85">
              Стритвеар бренд, вдохновлённый
              <br className="hidden sm:block" /> современной военной эстетикой.
            </p>
          </Reveal>

          <Reveal delay={560} className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link
              href="/shop"
              data-cursor="hover"
              className="group inline-flex items-center gap-8 border border-bone/30 px-6 py-4 transition-colors duration-700 ease-[var(--ease-premium)] hover:border-bone/70 hover:bg-bone hover:text-void"
            >
              <span className="eyebrow text-bone transition-colors duration-700 group-hover:text-void">
                Смотреть каталог
              </span>
              <span className="transition-transform duration-700 ease-[var(--ease-premium)] group-hover:translate-x-1.5">
                →
              </span>
            </Link>
            <Link
              href="/about"
              className="link-underline eyebrow text-bone/60 transition-colors duration-500 hover:text-bone"
            >
              О бренде
            </Link>
          </Reveal>
        </div>

        <div className="mt-16 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          {/* на телефоне вместо индекса — кнопка «Вниз» ниже */}
          <Reveal delay={640} className="hidden sm:block">
            <SectionIndex
              sections={[
                { id: "catalogue", label: "Поступления" },
                { id: "position", label: "Позиция" },
                { id: "categories", label: "Категории" },
              ]}
            />
          </Reveal>

          <Reveal delay={700} className="flex items-end justify-between gap-8 lg:justify-end">
            <ScrollButton
              target="#catalogue"
              className="scroll-cue flex items-center gap-4 lg:hidden"
            >
              <span className="relative block h-10 w-px overflow-hidden bg-bone/15">
                <span className="absolute inset-0 block bg-bone/80" />
              </span>
              <span className="meta text-bone/80">Вниз</span>
            </ScrollButton>
            <p className="meta text-right text-bone/75">
              {siteCopy.coordinates.split(" ").slice(0, 2).join(" ")}
              <br />
              {siteCopy.coordinates.split(" ").slice(2).join(" ")}
            </p>
          </Reveal>
        </div>
      </div>

      <Wordmark className="pointer-events-none absolute bottom-5 right-5 hidden text-xs text-bone/25 lg:block lg:right-12">
        {siteCopy.brandLatin} / MMXXVI
      </Wordmark>
    </section>
  );
}
