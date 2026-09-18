"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Менеджер фото товара для студии /admin:
 *  - загрузка файлов (несколько сразу), сжатие в браузере до 1600 px / WebP;
 *  - превью, удаление, назначение обложки (первое фото);
 *  - расширенный режим — сырые пути/адреса построчно.
 * Сжатые фото уходят на /api/upload; сервер кладёт их в S3, в папку UPLOADS_DIR
 * или, если хранилище не настроено, в базу как data-URL (см. lib/storage.ts).
 */
const MODE_HINT: Record<string, string> = {
  s3: "Файлы хранятся в объектном хранилище (S3).",
  disk: "Файлы хранятся в папке UPLOADS_DIR на сервере.",
  database: "Хранилище не настроено — фото сохраняются в базе. Задайте S3_* или UPLOADS_DIR (см. DEPLOY.md).",
};
const MAX_DIMENSION = 1600;
const QUALITY = 0.82;

async function compressImage(file: File): Promise<{ blob: Blob; mime: string }> {
  if (!("createImageBitmap" in window)) {
    return { blob: file, mime: file.type };
  }
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;
  if (Math.max(width, height) > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { blob: file, mime: file.type };
  ctx.drawImage(bitmap, 0, 0, width, height);

  const toBlob = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

  let blob = await toBlob("image/webp", QUALITY);
  let mime = "image/webp";
  // Фолбэк для браузеров без WebP-кодирования
  if (!blob) {
    blob = await toBlob("image/jpeg", 0.86);
    mime = "image/jpeg";
  }
  if (!blob) return { blob: file, mime: file.type };
  // Если сжатие не помогло (например, уже маленький webp) — берём результат сжатия
  return { blob, mime };
}

function parseImages(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function AdminImageManager({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const input = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showRaw, setShowRaw] = useState(false);
  const [mode, setMode] = useState<string>("");

  useEffect(() => {
    fetch("/api/upload", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { mode?: string } | null) => {
        if (data?.mode) setMode(data.mode);
      })
      .catch(() => {});
  }, []);

  const images = parseImages(value);

  async function handleFiles(files: FileList | File[]) {
    setBusy(true);
    setError("");
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const { blob, mime } = await compressImage(file);
        const body = new FormData();
        body.append("file", new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: mime }));
        const response = await fetch("/api/upload", { method: "POST", body });
        const data = (await response.json()) as { error?: string; src?: string };
        if (!response.ok || !data.src) throw new Error(data.error ?? "Ошибка загрузки");
        uploaded.push(data.src);
      }
      onChange([...images, ...uploaded].join("\n"));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Ошибка загрузки");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  function remove(index: number) {
    onChange(images.filter((_, i) => i !== index).join("\n"));
  }

  function makeCover(index: number) {
    if (index === 0) return;
    const next = [...images];
    const [picked] = next.splice(index, 1);
    next.unshift(picked);
    onChange(next.join("\n"));
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((src, index) => (
          <div
            key={`${src.slice(0, 24)}-${index}`}
            className="group relative aspect-4/5 overflow-hidden border hairline bg-graphite"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
            <span className="meta absolute left-1.5 top-1.5 bg-void/70 px-1.5 py-0.5 text-bone/80">
              {index === 0 ? "Обложка" : String(index + 1).padStart(2, "0")}
            </span>
            <span className="absolute inset-0 flex items-center justify-center gap-2 bg-void/70 opacity-0 transition-opacity duration-400 group-hover:opacity-100">
              {index !== 0 ? (
                <button
                  type="button"
                  onClick={() => makeCover(index)}
                  className="eyebrow border border-bone/40 px-2 py-1 text-[0.55rem] text-bone"
                >
                  Обложка
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => remove(index)}
                className="eyebrow border border-bone/40 px-2 py-1 text-[0.55rem] text-bone"
              >
                Удалить
              </button>
            </span>
          </div>
        ))}

        <button
          type="button"
          onClick={() => input.current?.click()}
          className="flex aspect-4/5 flex-col items-center justify-center gap-2 border border-dashed border-bone/25 text-bone/60 transition-colors duration-500 hover:border-bone/50 hover:text-bone"
        >
          <span className="text-2xl font-light">+</span>
          <span className="meta px-2 text-center normal-case tracking-normal">
            {busy ? "Сжимаем…" : "Добавить фото"}
          </span>
        </button>
      </div>

      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) void handleFiles(event.target.files);
        }}
      />

      {error ? <p className="meta text-bone">{error}</p> : null}
      <p className="meta normal-case tracking-normal">
        Первое фото — обложка карточки. Файлы приводятся к WebP до 1600 px.
        {mode ? ` ${MODE_HINT[mode] ?? ""}` : ""}
      </p>

      <button
        type="button"
        onClick={() => setShowRaw((open) => !open)}
        className="eyebrow text-bone/50 transition-colors duration-400 hover:text-bone"
      >
        {showRaw ? "Скрыть пути" : "Расширенный режим: пути к файлам"}
      </button>
      {showRaw ? (
        <textarea
          rows={4}
          className="w-full resize-none border hairline bg-transparent px-3 py-2.5 font-mono text-xs placeholder:text-smoke focus:border-bone/40 focus:outline-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={"/images/products/piece.jpg\n/images/texture.jpg"}
        />
      ) : null}
    </div>
  );
}
