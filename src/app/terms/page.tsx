import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion";
import { siteCopy } from "@/db/seed-data";

export const metadata: Metadata = {
  title: "Условия",
  description: "Условия продажи и использования каталога G2.",
};

const CLAUSES = [
  {
    title: "01 — Область применения",
    body: "Условия распространяются на все заказы, оформленные через каталог G2, и на использование сайта. Оформляя заказ, вы принимаете их полностью.",
  },
  {
    title: "02 — Заказы",
    body: "Заказ считается резервом до подтверждения студией по email. Лимитированные и нумерованные объекты продаются в порядке подтверждений; студия может отменить заказ, если товар невозможно выделить.",
  },
  {
    title: "03 — Цены и доставка",
    body: "Цены указаны в рублях и включают налоги. Стоимость доставки рассчитывается при подтверждении; по России бесплатно от 25 000 ₽. Пошлины за пределами России оплачивает получатель.",
  },
  {
    title: "04 — Возврат",
    body: "Неношеные вещи с бирками принимаются обратно в течение 14 дней с момента доставки. Заказные и нумерованные объекты, а также головные уборы возврату не подлежат по гигиеническим причинам.",
  },
  {
    title: "05 — Ответственность",
    body: "Студия отвечает за дефекты материала и производства. Ответственность за косвенные убытки, включая упущенную выгоду, исключается в пределах, допущенных законом.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 pt-24 sm:px-8 lg:pt-32">
      <header className="space-y-6">
        <span className="meta">Правовая информация</span>
        <h1 className="type-display text-5xl sm:text-6xl">Условия</h1>
        <p className="max-w-xl text-sm leading-relaxed text-mist">
          Короткая и понятная версия условий, по которым продаётся каталог.
        </p>
      </header>

      <div className="mt-14 divide-y divide-bone/10 border-t hairline">
        {CLAUSES.map((clause, index) => (
          <Reveal
            key={clause.title}
            delay={index * 60}
            className="grid gap-4 py-8 lg:grid-cols-[0.4fr_1fr] lg:gap-12"
          >
            <span className="eyebrow">{clause.title}</span>
            <p className="max-w-2xl text-sm leading-relaxed text-bone/85">{clause.body}</p>
          </Reveal>
        ))}
      </div>

      <div className="mt-14 flex flex-wrap gap-6 pb-24">
        <Link href="/privacy" className="link-underline eyebrow text-bone/70 hover:text-bone">
          Политика конфиденциальности →
        </Link>
        <Link href="/delivery" className="link-underline eyebrow text-bone/70 hover:text-bone">
          Доставка и возврат →
        </Link>
        <Link href="/shop" className="link-underline eyebrow text-bone/70 hover:text-bone">
          В каталог →
        </Link>
      </div>
      <p className="meta pb-16">© {new Date().getFullYear()} {siteCopy.copyright}</p>
    </div>
  );
}
