import type { Metadata } from "next";
import type { ReactNode } from "react";

/** Студия не индексируется: страница клиентская, поэтому метаданные задаются здесь. */
export const metadata: Metadata = {
  title: "Студия",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
