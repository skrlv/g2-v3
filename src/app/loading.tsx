/**
 * Состояние загрузки маршрута: страницы читают каталог из базы, и без этого
 * файла при переходе показывался бы пустой экран. Та же пара подписей, что и
 * на шторке перехода — глазу не за что зацепиться, кроме них.
 */
export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[60svh] w-full max-w-[1600px] items-start justify-between px-5 pt-24 sm:px-8 lg:px-12 lg:pt-32">
      <span className="meta">G2</span>
      <span className="meta" aria-live="polite">
        Загрузка
      </span>
    </div>
  );
}
