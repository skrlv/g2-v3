"use client";

import { scrollToTarget } from "@/components/smooth-scroll";
import type { ReactNode } from "react";

export function ScrollButton({
  target,
  children,
  className,
  offset = -70,
}: {
  target: string;
  children: ReactNode;
  className?: string;
  offset?: number;
}) {
  return (
    <button
      type="button"
      data-cursor="hover"
      onClick={() => scrollToTarget(target, offset)}
      className={className}
    >
      {children}
    </button>
  );
}
