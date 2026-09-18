import Link from "next/link";
import { BrandMark, Logo } from "@/components/brand";
import { NewsletterForm } from "@/components/newsletter-form";
import { legalNav, siteCopy, siteNav } from "@/db/seed-data";

function TelegramIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M21.6 4.2 2.9 11.4c-.9.35-.88 1.62.03 1.94l4.2 1.45 1.6 4.9c.25.77 1.24.95 1.75.32l2.3-2.85 4.5 3.3c.62.45 1.5.11 1.66-.64l3.1-14.6c.18-.85-.68-1.55-1.44-1.02ZM9.2 14.1l8.1-5.4-6.6 6.2-.3 3-1.2-3.8Z" />
    </svg>
  );
}

function VkIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M3.1 7.3h2.6c.2 0 .35.12.4.33.35 1.5 1.05 2.9 1.9 4 .14.2.3.22.42.05.5-.7.9-1.6 1.15-2.7.06-.28.2-.42.47-.42h2.2c.28 0 .42.16.38.45-.24 1.5-.9 2.9-1.75 4.1-.14.2-.1.35.08.5 1.1.9 2.1 1.95 2.95 3.1.12.16.1.32-.1.34h-2.5c-.2 0-.34-.08-.47-.24-.7-.85-1.35-1.5-2.05-2.05-.16-.13-.3-.1-.4.1-.3.65-.5 1.3-.62 2.02-.04.2-.16.3-.37.3H8.6c-2.6 0-4.6-2.05-5.35-5.02-.35-1.4-.55-2.9-.6-4.5-.01-.2.1-.28.45-.28Zm15.9 0h-2.4c-.2 0-.32.1-.35.3-.2 1.5-.7 2.9-1.4 4.15-.1.16-.22.18-.3.03-.45-.8-.8-1.7-1.02-2.75-.05-.24-.16-.33-.4-.33h-1c-.25 0-.36.15-.3.42.3 1.5.9 2.9 1.6 4.15.12.2.08.34-.08.48l-1.6 1.35c-.2.16-.18.34.07.37h2.6c.22 0 .38-.1.55-.28.5-.55 1.1-1.1 1.6-1.7h.3c.3 0 .45.15.5.45.05.3.15.55.3.8.14.24.36.36.7.36h2.1c.25 0 .36-.14.28-.38-.6-1.85-1.7-3.05-3.1-4.2-.2-.16-.2-.3-.02-.45 1.5-1.2 2.6-2.7 3.4-4.35.1-.2.06-.34-.18-.34Z" />
    </svg>
  );
}

function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3.4" y="3.4" width="17.2" height="17.2" rx="4.6" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const MARQUEE = [
  "G2",
  "ТОЧНОСТЬ — СКОРОСТЬ — РЕЗУЛЬТАТ",
  "МОНОХРОМНАЯ ПРОГРАММА",
  "MMXXVI",
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-20 border-t hairline bg-carbon">
      <div className="overflow-hidden border-b hairline py-5">
        <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap">
          {[0, 1].map((pass) => (
            <div key={pass} className="flex items-center gap-10" aria-hidden={pass === 1}>
              {MARQUEE.map((item) => (
                <span key={`${pass}-${item}`} className="flex items-center gap-10">
                  <span className="type-display text-lg text-bone/75 sm:text-xl">{item}</span>
                  <BrandMark className="text-smoke" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[1600px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.1fr_1.3fr_1fr] lg:gap-14 lg:px-12">
        <div className="space-y-5">
          <Logo size="md" className="text-bone" />
          <p className="meta">{siteCopy.tagline}</p>
          <p className="max-w-xs text-sm leading-relaxed text-mist">{siteCopy.subline}</p>
        </div>

        <nav className="flex flex-col gap-4" aria-label="Разделы сайта">
          <p className="eyebrow">Разделы</p>
          <div className="flex flex-wrap gap-x-7 gap-y-3">
            {siteNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="link-underline eyebrow text-bone/70 transition-colors duration-500 hover:text-bone"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-7 gap-y-3">
            <Link
              href="/shop?category=outerwear"
              className="link-underline meta normal-case tracking-[0.06em] transition-colors duration-500 hover:text-bone"
            >
              Верхняя одежда
            </Link>
            <Link
              href="/shop?category=hoodies"
              className="link-underline meta normal-case tracking-[0.06em] transition-colors duration-500 hover:text-bone"
            >
              Худи
            </Link>
            <Link
              href="/shop?category=headwear"
              className="link-underline meta normal-case tracking-[0.06em] transition-colors duration-500 hover:text-bone"
            >
              Головные уборы
            </Link>
            <Link
              href="/shop?category=tees"
              className="link-underline meta normal-case tracking-[0.06em] transition-colors duration-500 hover:text-bone"
            >
              Футболки
            </Link>
          </div>
        </nav>

        <div className="space-y-6">
          <p className="eyebrow">Рассылка</p>
          <NewsletterForm />
          <div className="flex items-center gap-5">
            <a
              href={siteCopy.telegram}
              target="_blank"
              rel="noreferrer"
              aria-label="Telegram"
              className="text-bone/70 transition-colors duration-500 hover:text-bone"
            >
              <TelegramIcon className="h-5 w-5" />
            </a>
            <a
              href={siteCopy.vk}
              target="_blank"
              rel="noreferrer"
              aria-label="VK"
              className="text-bone/70 transition-colors duration-500 hover:text-bone"
            >
              <VkIcon className="h-5 w-5" />
            </a>
            <a
              href={siteCopy.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="text-bone/70 transition-colors duration-500 hover:text-bone"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a
              href={`mailto:${siteCopy.email}`}
              className="link-underline eyebrow text-bone/70 transition-colors duration-500 hover:text-bone"
            >
              Email
            </a>
          </div>
        </div>
      </div>

      {/* НИЖНЯЯ НАВИГАЦИЯ — минимальная, встроенная в тёмный дизайн */}
      <div className="border-t hairline">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            {siteNav.map((item) => (
              <Link
                key={`lower-${item.href}`}
                href={item.href}
                className="eyebrow text-bone/55 transition-colors duration-500 hover:text-bone"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            <a
              href={siteCopy.instagram}
              target="_blank"
              rel="noreferrer"
              className="eyebrow text-bone/55 transition-colors duration-500 hover:text-bone"
            >
              Instagram
            </a>
            <a
              href={`mailto:${siteCopy.email}`}
              className="eyebrow text-bone/55 transition-colors duration-500 hover:text-bone"
            >
              Email
            </a>
            {legalNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="eyebrow text-bone/55 transition-colors duration-500 hover:text-bone"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2 px-5 pb-7 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <p className="meta normal-case tracking-normal">
            © {year} {siteCopy.copyright}
          </p>
          <p className="meta normal-case tracking-normal">{siteCopy.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
