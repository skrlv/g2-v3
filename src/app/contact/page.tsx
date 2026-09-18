import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Reveal, RevealLines } from "@/components/motion";
import { siteCopy } from "@/db/seed-data";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Связь со студией G2: заказы, размеры, опт и пресса.",
};

const CHANNELS = [
  { label: "Email", value: siteCopy.email, href: `mailto:${siteCopy.email}` },
  { label: "Telegram", value: "@geran2", href: siteCopy.telegram },
  { label: "VK", value: "vk.com/geran2", href: siteCopy.vk },
  { label: "Instagram", value: "@geran.2", href: siteCopy.instagram },
  { label: "Студия", value: "Москва — по записи", href: "" },
  { label: "Часы", value: "Пн — Пт, 10:00–19:00 МСК", href: "" },
];

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-5 pt-24 sm:px-8 lg:px-12 lg:pt-32">
      <header className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="meta">Контакты / Связь</span>
          <span className="h-px w-16 bg-bone/25" />
        </div>
        <RevealLines
          lines={["Напишите", "в студию"]}
          lineClassName="type-display text-5xl leading-[0.92] sm:text-6xl lg:text-7xl"
        />
        <Reveal delay={180}>
          <p className="max-w-xl text-sm leading-relaxed text-mist">
            Заказы, размеры, опт или пресса — один ящик, отвечают те же люди, которые
            производят вещи.
          </p>
        </Reveal>
      </header>

      <div className="mt-12 grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <Reveal className="order-2 lg:order-1">
          <ContactForm />
        </Reveal>

        <Reveal delay={120} className="order-1 space-y-10 lg:order-2">
          <dl className="divide-y divide-bone/10 border-y hairline">
            {CHANNELS.map((channel) => (
              <div key={channel.label} className="flex items-baseline justify-between gap-6 py-4">
                <dt className="meta">{channel.label}</dt>
                <dd className="text-right text-sm text-bone/90">
                  {channel.href ? (
                    <a
                      href={channel.href}
                      target={channel.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      className="link-underline"
                    >
                      {channel.value}
                    </a>
                  ) : (
                    channel.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <div className="space-y-3">
            <p className="eyebrow">Координаты</p>
            <p className="type-display text-2xl">{siteCopy.coordinates}</p>
            <p className="text-sm leading-relaxed text-mist">
              Показ в студии — только по записи. Напишите артикул и удобный слот, мы
              подтвердим время.
            </p>
          </div>
        </Reveal>
      </div>

      <div className="h-20 lg:h-28" />
    </div>
  );
}
