import Image, { type ImageProps } from "next/image";
import type { CSSProperties } from "react";

/**
 * Единая обёртка над next/image для фото каталога.
 * Заполняет родителя (`fill`): родитель задаёт размер и должен быть `relative`.
 *
 * Оптимизируются файлы из /public (`/images/…`), из папки загрузок (`/uploads/…`)
 * и с хоста хранилища, разрешённого в next.config (S3_PUBLIC_URL). Всё остальное —
 * data-URL из базы и чужие адреса — отдаётся как есть (`unoptimized`), иначе
 * next/image откажется от неизвестного хоста.
 */
const IMAGE_HOST = process.env.NEXT_PUBLIC_IMAGE_HOST || "";

export function isOptimizable(src: string): boolean {
  if (src.startsWith("/")) return true;
  if (!IMAGE_HOST) return false;
  try {
    return new URL(src).host === IMAGE_HOST;
  } catch {
    return false;
  }
}

type PictureProps = {
  src: string;
  alt: string;
  /** Ширины, под которые браузер выбирает файл из srcset, например "(min-width: 1024px) 33vw, 100vw". */
  sizes: string;
  className?: string;
  priority?: boolean;
  quality?: number;
  style?: CSSProperties;
  /** Прочие атрибуты img: data-атрибуты, aria-hidden, decoding. */
  imgProps?: Omit<ImageProps, "src" | "alt" | "fill" | "sizes" | "className" | "priority" | "quality" | "style">;
};

export function Picture({ src, alt, sizes, className, priority, quality, style, imgProps }: PictureProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={quality}
      unoptimized={!isOptimizable(src)}
      className={className}
      style={style}
      {...imgProps}
    />
  );
}

/** Подсказки sizes для мест, где стоят фото — чтобы не дублировать строки по компонентам. */
export const SIZES = {
  /** карточка в сетке 2 / 3 / 4 колонки */
  card: "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 360px) 50vw, 100vw",
  /** карточка в сетке «Рядом в каталоге» — 3 колонки на lg */
  cardWide: "(min-width: 1024px) 33vw, (min-width: 360px) 50vw, 100vw",
  hero: "100vw",
  /** большое фото на странице товара и в блоках «фото + текст» */
  half: "(min-width: 1024px) 50vw, 100vw",
  third: "(min-width: 1024px) 33vw, 100vw",
  thumb: "80px",
} as const;
