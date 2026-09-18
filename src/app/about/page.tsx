import type { Metadata } from "next";
import Link from "next/link";
import { Logo, SectionHeading } from "@/components/brand";
import { DroneMark } from "@/components/drone-mark";
import { ImageReveal, Parallax, Reveal, RevealLines } from "@/components/motion";
import { siteCopy } from "@/db/seed-data";

export const metadata: Metadata = {
  title: "О бренде",
  description:
    "G2 — стритвеар бренд о монохромной сдержанности, индустриальных материалах и измеримой точности.",
};

const PRINCIPLES = [
  {
    index: "01",
    title: "Вес важнее шума",
    body: "Ничего не добавляется для декора. Граммы, швы и фурнитура выбраны так, чтобы вещь держала силуэт в комнате.",
  },
  {
    index: "02",
    title: "Одна визуальная система",
    body: "Единая монохромная палитра от футера до упаковки: каждая вещь принадлежит одному архиву, а не сезону.",
  },
  {
    index: "03",
    title: "Измеримый результат",
    body: "Малые тиражи, нумерованные объекты, никакого театра рестоков. Всё выпущенное документировано — размеры, вес, происхождение.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-5 pt-24 sm:px-8 lg:px-12 lg:pt-32">
      <header className="space-y-7">
        <div className="flex items-center gap-4">
          <span className="meta">О бренде / Программа</span>
          <span className="h-px w-16 bg-bone/25" />
        </div>
        <RevealLines
          lines={["Точность.", "Скорость.", "Результат."]}
          lineClassName="type-display text-[13vw] leading-[0.92] sm:text-6xl lg:text-7xl"
          step={110}
        />
        <Reveal delay={400}>
          <p className="max-w-2xl text-sm leading-relaxed text-mist sm:text-base">
            {siteCopy.subline} {siteCopy.manifesto}
          </p>
        </Reveal>
      </header>

      <section className="mt-14 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <Parallax amount={0.05}>
          <ImageReveal
            src="/images/hero.jpg"
            alt="Съёмка G2"
            priority
            position="60% 22%"
            className="aspect-4/3 w-full bg-graphite"
          />
        </Parallax>
        <Reveal delay={140} className="space-y-6 self-center">
          <span className="eyebrow">Происхождение</span>
          <p className="text-lg leading-relaxed text-bone/90">
            G2 началась как исследование индустриальной фурнитуры и холодной
            геометрии авиационных поверхностей. Первый выпуск перевёл этот язык в
            тяжёлый футер, сухой хлопок и матовый металл.
          </p>
          <p className="text-sm leading-relaxed text-mist">
            Программа развивается между Москвой и Берлином и производится с
            семейными мастерскими в Португалии, Италии и Японии. Каждый экземпляр
            красят по готовому изделию, затем стирают до состояния, когда поверхность
            перестаёт читаться как новая.
          </p>
          <dl className="grid grid-cols-2 gap-6 border-t hairline pt-6">
            <div>
              <dt className="meta">Вещей в программе</dt>
              <dd className="type-display mt-2 text-3xl">09</dd>
            </div>
            <div>
              <dt className="meta">Мастерских</dt>
              <dd className="type-display mt-2 text-3xl">03</dd>
            </div>
          </dl>
        </Reveal>
      </section>

      <section className="mt-20 lg:mt-28">
        <SectionHeading title="Принципы" />
        <div className="mt-9 grid gap-10 lg:grid-cols-3 lg:gap-14">
          {PRINCIPLES.map((principle, index) => (
            <Reveal key={principle.index} delay={index * 110} className="space-y-4">
              <span className="meta">{principle.index}</span>
              <h3 className="type-display text-2xl sm:text-3xl">{principle.title}</h3>
              <p className="text-sm leading-relaxed text-mist">{principle.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-20 border-y hairline py-14 lg:mt-28 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <Reveal className="space-y-5">
            <span className="eyebrow">Материалы</span>
            <p className="type-display text-3xl leading-tight sm:text-4xl">
              Сырьё, крашение,
              <br />
              затем стирка.
            </p>
            <DroneMark panelLines={false} className="h-14 w-auto text-bone/40" />
          </Reveal>
          <Reveal delay={140}>
            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                "Футер петля 480 г/м², хлопок",
                "Матовый японский нейлон, проклеенные швы",
                "Сухой хлопковый канвас 340 г/м²",
                "Меринос мелкой резинки, бесшовная вязка",
                "Пуговицы из корозо, матовый металл",
                "Литой бетон, шлифованная сталь",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-4 border-b hairline pb-4 text-sm text-bone/85"
                >
                  <span className="meta mt-0.5">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <div className="flex flex-col gap-6 py-14 lg:flex-row lg:items-center lg:justify-between">
        <Link
          href="/shop"
          data-cursor="hover"
          className="group inline-flex items-center justify-between gap-10 border border-bone/25 px-6 py-5 transition-colors duration-700 ease-[var(--ease-premium)] hover:border-bone/70 hover:bg-bone hover:text-void lg:min-w-[24rem]"
        >
          <span className="eyebrow text-bone transition-colors duration-700 group-hover:text-void">
            Смотреть каталог
          </span>
          <span className="transition-transform duration-700 ease-[var(--ease-premium)] group-hover:translate-x-1.5">
            →
          </span>
        </Link>
        <div className="space-y-2">
          <Logo size="md" className="text-bone" />
          <p className="meta">{siteCopy.coordinates}</p>
        </div>
      </div>
    </div>
  );
}
