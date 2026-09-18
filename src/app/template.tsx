import type { ReactNode } from "react";

/** Re-mounts on navigation, so every route change gets the same slow reveal. */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <>
      <div
        aria-hidden="true"
        className="page-curtain pointer-events-none fixed inset-0 z-[95] flex items-start justify-between bg-void px-5 pt-6 sm:px-8 lg:px-12"
      >
        <span className="meta">G2</span>
        <span className="meta">Загрузка</span>
      </div>
      <div data-page>{children}</div>
    </>
  );
}
