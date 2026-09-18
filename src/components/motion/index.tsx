"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Picture } from "@/components/picture";

function useInView<T extends HTMLElement>(options?: {
  threshold?: number;
  once?: boolean;
}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const once = options?.once ?? true;
  const threshold = options?.threshold ?? 0.16;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      const frame = window.requestAnimationFrame(() => setInView(true));
      return () => window.cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [once, threshold]);

  return { ref, inView };
}

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  threshold?: number;
};

/** Slow fade + rise on scroll. Used for almost every block on the site. */
export function Reveal({ children, className, delay = 0, y, threshold }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold });
  const style = {
    "--reveal-delay": `${delay}ms`,
    ...(y !== undefined ? { "--reveal-y": `${y}px` } : {}),
  } as CSSProperties;

  return (
    <div
      ref={ref}
      data-reveal=""
      className={`${className ?? ""} ${inView ? "is-visible" : ""}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
}

/** Masked line-by-line text reveal, used for headlines. */
export function RevealLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  step = 130,
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  step?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.1 });

  return (
    <div ref={ref} className={className} data-lines-root="">
      {lines.map((line, index) => (
        <span
          key={`${line}-${index}`}
          data-reveal-line=""
          className={`${lineClassName ?? ""} ${inView ? "is-visible" : ""}`.trim()}
          style={{ "--reveal-delay": `${delay + index * step}ms` } as CSSProperties}
        >
          <span className="block">{line}</span>
        </span>
      ))}
    </div>
  );
}

/**
 * Images arrive with a soft clip-path wipe instead of a hard pop-in.
 * Картинка — next/image с `fill`, поэтому контейнер задаёт размер (aspect-*, h-full)
 * и получает `relative`; `sizes` — подсказка srcset (по умолчанию половина экрана на lg).
 */
export function ImageReveal({
  src,
  alt,
  className,
  imageClassName,
  delay = 0,
  priority = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  position = "center",
}: {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  delay?: number;
  priority?: boolean;
  sizes?: string;
  position?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.08 });

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
      <Picture
        src={src}
        alt={alt}
        sizes={sizes}
        priority={priority}
        style={{ "--reveal-delay": `${delay}ms`, objectPosition: position } as CSSProperties}
        className={`object-cover ${imageClassName ?? ""} ${inView ? "is-visible" : ""}`}
        imgProps={{ "data-reveal-image": "" } as Record<string, string>}
      />
    </div>
  );
}

/** Subtle parallax. Amount stays small (0.04 – 0.12) to keep it expensive-feeling. */
export function Parallax({
  children,
  className,
  amount = 0.08,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
}) {
  const holder = useRef<HTMLDivElement | null>(null);
  const inner = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = holder.current;
    const target = inner.current;
    if (!node || !target) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let visible = false;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const viewport = window.innerHeight;
      const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport;
      const shift = Math.max(-1, Math.min(1, progress)) * amount * -100;
      target.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      if (!visible || frame) return;
      frame = window.requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) onScroll();
      },
      { threshold: 0 },
    );

    observer.observe(node);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [amount]);

  return (
    <div ref={holder} className={className}>
      <div ref={inner} className="h-full w-full will-change-transform">
        {children}
      </div>
    </div>
  );
}

/** Tiny scroll-linked counter used in the hero (coordinates / index). */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  return progress;
}

/** Reading progress bar — one hairline, top of the viewport. */
export function ScrollProgressBar() {
  const progress = useScrollProgress();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-px bg-transparent">
      <div
        className="h-px origin-left bg-bone/60 transition-transform duration-200 ease-out"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
