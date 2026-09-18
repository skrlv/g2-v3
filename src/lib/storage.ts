import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

/**
 * Хранилище фото из студии. Три режима, по убыванию предпочтения:
 *
 * 1. S3-совместимое хранилище — заданы S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY,
 *    S3_SECRET_KEY (+ S3_REGION, S3_PUBLIC_URL). Подходят Yandex Object Storage,
 *    Selectel, VK Cloud, Cloudflare R2, MinIO, AWS. Единственный вариант для
 *    serverless-хостинга (Vercel), где диск не сохраняется между запусками.
 * 2. Папка на диске — задан UPLOADS_DIR (в Docker — том, смонтированный в контейнер).
 *    Файлы раздаёт маршрут /uploads/<имя>.
 * 3. Ничего не задано — фото уходит в базу как data-URL, как раньше. Работает
 *    везде, но раздувает базу и ответы API и не даёт next/image оптимизировать картинку.
 *
 * Во всех режимах изображение сначала приводится к WebP не больше 1600 px по
 * большей стороне (sharp), поэтому в хранилище попадают одинаковые файлы
 * независимо от того, что прислал браузер.
 */
export type StorageMode = "s3" | "disk" | "database";

export type StoredImage = {
  src: string;
  width: number;
  height: number;
  bytes: number;
  mode: StorageMode;
};

const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 82;

function s3Config() {
  const endpoint = process.env.S3_ENDPOINT;
  const bucket = process.env.S3_BUCKET;
  const accessKeyId = process.env.S3_ACCESS_KEY;
  const secretAccessKey = process.env.S3_SECRET_KEY;
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) return null;
  const publicUrl = (process.env.S3_PUBLIC_URL || `${endpoint.replace(/\/$/, "")}/${bucket}`).replace(/\/$/, "");
  return {
    bucket,
    publicUrl,
    prefix: (process.env.S3_PREFIX || "products").replace(/^\/|\/$/g, ""),
    client: new S3Client({
      endpoint,
      region: process.env.S3_REGION || "ru-central1",
      credentials: { accessKeyId, secretAccessKey },
      // MinIO, Selectel и часть провайдеров не умеют virtual-host адресацию
      forcePathStyle: process.env.S3_PATH_STYLE !== "false",
    }),
  };
}

export function uploadsDir(): string | null {
  const dir = process.env.UPLOADS_DIR;
  return dir ? path.resolve(dir) : null;
}

export function storageMode(): StorageMode {
  if (s3Config()) return "s3";
  if (uploadsDir()) return "disk";
  return "database";
}

/** WebP ≤1600 px из любого растрового изображения. SVG и анимации не принимаем. */
async function normalize(input: Buffer): Promise<{ data: Buffer; width: number; height: number }> {
  const image = sharp(input, { failOn: "error", animated: false }).rotate();
  const meta = await image.metadata();
  if (!meta.width || !meta.height) throw new Error("Не удалось прочитать изображение");
  const pipeline =
    Math.max(meta.width, meta.height) > MAX_DIMENSION
      ? image.resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
      : image;
  const { data, info } = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

/** Имя файла: дата + хэш содержимого — одинаковое фото не дублируется. */
function fileName(data: Buffer): string {
  const hash = createHash("sha256").update(data).digest("hex").slice(0, 16);
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `${day}-${hash}-${randomUUID().slice(0, 6)}.webp`;
}

export async function storeImage(input: Buffer): Promise<StoredImage> {
  const { data, width, height } = await normalize(input);
  const name = fileName(data);
  const s3 = s3Config();

  if (s3) {
    const key = `${s3.prefix}/${name}`;
    await s3.client.send(
      new PutObjectCommand({
        Bucket: s3.bucket,
        Key: key,
        Body: data,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
        ACL: process.env.S3_ACL === "none" ? undefined : "public-read",
      }),
    );
    return { src: `${s3.publicUrl}/${key}`, width, height, bytes: data.length, mode: "s3" };
  }

  const dir = uploadsDir();
  if (dir) {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), data);
    return { src: `/uploads/${name}`, width, height, bytes: data.length, mode: "disk" };
  }

  return {
    src: `data:image/webp;base64,${data.toString("base64")}`,
    width,
    height,
    bytes: data.length,
    mode: "database",
  };
}

/** Файл из UPLOADS_DIR для маршрута /uploads/<имя>; null — нет такого или имя подозрительное. */
export async function readUpload(name: string): Promise<{ data: Buffer; type: string } | null> {
  const dir = uploadsDir();
  if (!dir) return null;
  if (!/^[A-Za-z0-9._-]{1,120}$/.test(name) || name.startsWith(".")) return null;
  const file = path.join(dir, name);
  try {
    const info = await stat(file);
    if (!info.isFile()) return null;
    const data = await readFile(file);
    const ext = path.extname(name).toLowerCase();
    const type =
      ext === ".webp" ? "image/webp" : ext === ".png" ? "image/png" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "application/octet-stream";
    return { data, type };
  } catch {
    return null;
  }
}

/** data-URL из базы → байты, чтобы перенести старое фото в хранилище. */
export function decodeDataUrl(src: string): Buffer | null {
  const match = /^data:image\/[a-z0-9.+-]+;base64,([A-Za-z0-9+/=\s]+)$/i.exec(src.trim());
  if (!match) return null;
  try {
    return Buffer.from(match[1].replace(/\s/g, ""), "base64");
  } catch {
    return null;
  }
}
