import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/brand";
import { Reveal, RevealLines } from "@/components/motion";
import { siteCopy } from "@/db/seed-data";
import { formatPrice } from "@/lib/format";
import { SHIPPING_ZONES, describeZoneRate } from "@/lib/shipping";

export const metadata: Metadata = {
  title: "Доставка",
  description:
    "Сроки, стоимость и возврат заказов G2 по России и миру.",
};

/** Зоны и тарифы — из lib/shipping.ts, те же, что считает корзина. */
const ZONES = SHIPPING_ZONES.map((zone) => ({
  zone: zone.label,
  term: zone.term,
  price: describeZoneRate(zone, formatPrice),
}));

export default function DeliveryPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 pt-24 sm:px-8 lg:pt-32">
      <header className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="meta">Доставка / Возврат</span>
          <span className="h-px w-16 bg-bone/25" />
        </div>
        <RevealLines
          lines={["Доставка", "и возврат"]}
          lineClassName="type-display text-5xl leading-[0.92] sm:text-6xl"
        />
        <Reveal delay={180}>
          <p className="max-w-xl text-sm leading-relaxed text-mist">
            Отправляем со студии в течение 2–4 рабочих дней после подтверждения
            заказа. Трек-номер приходит на почту, указанную при оформлении.
          </p>
        </Reveal>
      </header>

      <section className="mt-14">
        <SectionHeading title="Сроки и стоимость" />
        <p className="meta mt-6 normal-case tracking-normal">
          Стоимость считается в корзине по выбранному региону до оформления заказа.
        </p>
        <div className="mt-2 divide-y divide-bone/10 border-b hairline">
          {ZONES.map((item, index) => (
            <Reveal
              key={item.zone}
              delay={index * 60}
              className="grid gap-2 py-5 sm:grid-cols-[1.2fr_1fr_1fr] sm:items-baseline sm:gap-8"
            >
              <span className="text-sm text-bone/90">{item.zone}</span>
              <span className="meta normal-case tracking-normal">{item.term}</span>
              <span className="meta normal-case tracking-normal sm:text-right">
                {item.price}
              </span>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className="space-y-5">
          <span className="eyebrow">Оплата</span>
          <ul className="space-y-3 text-sm leading-relaxed text-mist">
            <li>· Карта, СБП или перевод по счёту после подтверждения заказа.</li>
            <li>· Цены указаны в рублях и включают все налоги.</li>
            <li>· Пошлины за пределами России оплачивает получатель.</li>
          </ul>
        </Reveal>
        <Reveal delay={120} className="space-y-5">
          <span className="eyebrow">Возврат</span>
          <ul className="space-y-3 text-sm leading-relaxed text-mist">
            <li>· 14 дней на неношеные вещи с бирками, в исходной упаковке.</li>
            <li>· Обмен размера — бесплатно один раз на заказ.</li>
            <li>
              · Заказные и нумерованные объекты, а также головные уборы возврату не
              подлежат.
            </li>
          </ul>
          <Link
            href="/contact"
            className="link-underline eyebrow inline-block text-bone/70 hover:text-bone"
          >
            Написать в студию →
          </Link>
        </Reveal>
      </section>

      <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t hairline py-8">
        <p className="meta">{siteCopy.coordinates}</p>
        <p className="meta">{siteCopy.tagline}</p>
      </div>
    </div>
  );
}
