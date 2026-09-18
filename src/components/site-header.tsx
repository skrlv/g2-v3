"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand";
import { useCart } from "@/components/cart-provider";
import { legalNav, siteCopy, siteNav } from "@/db/seed-data";

function BagIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M4.2 6.4 H15.8 L14.9 18 H5.1 Z" />
      <path d="M7.3 6.4 V5.1 A2.7 2.7 0 0 1 12.7 5.1 V6.4" />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { count, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Маршрут сменился — меню закрывается прямо при рендере, без лишнего эффекта.
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const lenis = window.__lenis;
    lenis?.stop();
    return () => lenis?.start();
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,backdrop-filter,border-color] duration-700 ease-[var(--ease-premium)] ${
          scrolled || menuOpen
            ? "border-bone/10 bg-void/85 backdrop-blur-md"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:h-20 sm:px-8 lg:px-12">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-3"
            aria-label="G2 — на главную"
          >
            <Logo size="nav" className="text-bone transition-transform duration-700 ease-[var(--ease-premium)] group-hover:-translate-y-0.5" />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Разделы">
            {siteNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-active={isActive(item.href) ? "true" : "false"}
                aria-current={isActive(item.href) ? "page" : undefined}
                className="link-underline eyebrow text-bone/70 transition-colors duration-500 hover:text-bone data-[active=true]:text-bone"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 sm:gap-5">
            <button
              type="button"
              onClick={openCart}
              data-cursor="hover"
              className="group flex items-center gap-2 text-bone"
              aria-label="Открыть корзину"
            >
              <BagIcon className="h-[1.15rem] w-[1.15rem] transition-colors duration-500 group-hover:text-bone" />
              <span className="meta flex h-5 min-w-5 items-center justify-center border border-bone/25 px-1 text-[0.5625rem] text-bone">
                {String(count).padStart(2, "0")}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-6 w-6 flex-col justify-center gap-1.5 lg:hidden"
              aria-label="Меню"
              aria-expanded={menuOpen}
            >
              <span
                className={`h-px w-full bg-bone transition-transform duration-500 ease-[var(--ease-premium)] ${
                  menuOpen ? "translate-y-[3.5px] rotate-45" : ""
                }`}
              />
              <span
                className={`h-px w-full bg-bone transition-transform duration-500 ease-[var(--ease-premium)] ${
                  menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* МОБИЛЬНАЯ НАВИГАЦИЯ — упрощённая: пять разделов и правовые ссылки */}
      <div
        className={`fixed inset-0 z-40 flex flex-col justify-between bg-void px-5 pb-10 pt-24 transition-opacity duration-700 ease-[var(--ease-premium)] lg:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="flex flex-col border-t hairline pt-4" aria-label="Мобильное меню">
          {siteNav.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              tabIndex={menuOpen ? 0 : -1}
              aria-current={isActive(item.href) ? "page" : undefined}
              className="type-display flex items-baseline gap-4 border-b hairline py-4 text-3xl transition-[opacity,transform] duration-700 ease-[var(--ease-premium)] sm:text-4xl"
              style={{
                transform: menuOpen ? "none" : "translateY(18px)",
                transitionDelay: `${80 + index * 55}ms`,
                opacity: menuOpen ? 1 : 0,
              }}
            >
              <span className="meta">0{index + 1}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-6">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href={siteCopy.instagram} target="_blank" rel="noreferrer" tabIndex={menuOpen ? 0 : -1} className="eyebrow text-bone/70">
              Instagram
            </a>
            <a href={siteCopy.telegram} target="_blank" rel="noreferrer" tabIndex={menuOpen ? 0 : -1} className="eyebrow text-bone/70">
              Telegram
            </a>
            <a href={`mailto:${siteCopy.email}`} tabIndex={menuOpen ? 0 : -1} className="eyebrow text-bone/70">
              Email
            </a>
            {legalNav.map((item) => (
              <Link key={item.href} href={item.href} tabIndex={menuOpen ? 0 : -1} className="eyebrow text-bone/70">
                {item.label}
              </Link>
            ))}
          </div>
          <p className="meta">{siteCopy.coordinates}</p>
        </div>
      </div>
    </>
  );
}
