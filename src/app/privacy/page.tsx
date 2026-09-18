import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion";
import { siteCopy } from "@/db/seed-data";

export const metadata: Metadata = {
  title: "Конфиденциальность",
  description: "Как G2 обрабатывает персональные данные с этого сайта.",
};

const SECTIONS = [
  {
    title: "Какие данные мы собираем",
    body: "Данные заказа (имя, email, адрес доставки), подписки на рассылку и сообщения из формы обратной связи. Содержимое корзины хранится локально в вашем браузере и не передаётся, пока вы не оформите заказ.",
  },
  {
    title: "Зачем мы их собираем",
    body: "Чтобы обрабатывать заказы, отвечать на запросы и присылать анонсы дропов, которые вы явно запросили. Мы никогда не продаём и не передаём персональные данные.",
  },
  {
    title: "Хранение и сроки",
    body: "Данные заказов хранятся в течение срока, установленного бухгалтерским законодательством. Адреса рассылки — до отписки. Сообщения из формы удаляются через 24 месяца.",
  },
  {
    title: "Ваши права",
    body: "Вы можете запросить доступ, исправление, выгрузку или удаление своих данных в любое время, написав на почту студии. Ответ — в течение 30 дней.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 pt-24 sm:px-8 lg:pt-32">
      <header className="space-y-6">
        <span className="meta">Правовая информация</span>
        <h1 className="type-display text-5xl sm:text-6xl">Конфиденциальность</h1>
        <p className="max-w-xl text-sm leading-relaxed text-mist">
          Минимальная политика для минимального магазина: что хранится, зачем и как
          это удалить.
        </p>
      </header>

      <div className="mt-14 divide-y divide-bone/10 border-t hairline">
        {SECTIONS.map((section, index) => (
          <Reveal
            key={section.title}
            delay={index * 60}
            className="grid gap-4 py-8 lg:grid-cols-[0.4fr_1fr] lg:gap-12"
          >
            <span className="eyebrow">{section.title}</span>
            <p className="max-w-2xl text-sm leading-relaxed text-bone/85">{section.body}</p>
          </Reveal>
        ))}
      </div>

      <div className="mt-14 space-y-6 pb-24">
        <p className="meta normal-case tracking-normal">
          Запросы по данным: {siteCopy.email}
        </p>
        <div className="flex flex-wrap gap-6">
          <Link href="/terms" className="link-underline eyebrow text-bone/70 hover:text-bone">
            Условия →
          </Link>
          <Link href="/contact" className="link-underline eyebrow text-bone/70 hover:text-bone">
            Написать в студию →
          </Link>
        </div>
      </div>
    </div>
  );
}
