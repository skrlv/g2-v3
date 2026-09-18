import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70svh] w-full max-w-[1600px] flex-col justify-center gap-8 px-5 pt-24 sm:px-8 lg:px-12">
      <span className="meta">Ошибка / 404</span>
      <h1 className="type-display text-5xl sm:text-7xl lg:text-8xl">
        Ничего
        <br />
        нет
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-mist">
        Страница переехала или не была выпущена. Каталог на месте.
      </p>
      <div className="flex flex-wrap gap-6">
        <Link
          href="/shop"
          className="group inline-flex items-center gap-6 border border-bone/20 px-5 py-4 transition-colors duration-700 ease-[var(--ease-premium)] hover:border-bone/70 hover:bg-bone hover:text-void"
        >
          <span className="eyebrow text-bone transition-colors duration-700 group-hover:text-void">
            Каталог
          </span>
          <span className="transition-transform duration-700 ease-[var(--ease-premium)] group-hover:translate-x-1.5">
            →
          </span>
        </Link>
        <Link href="/" className="eyebrow self-center text-bone/60 hover:text-bone">
          На главную
        </Link>
      </div>
    </div>
  );
}
