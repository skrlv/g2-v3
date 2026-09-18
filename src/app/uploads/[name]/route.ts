import { readUpload } from "@/lib/storage";

export const dynamic = "force-dynamic";

/** Раздача фото из UPLOADS_DIR (режим «диск»). Имена — хэш содержимого, поэтому кэш бессрочный. */
export async function GET(_request: Request, context: { params: Promise<{ name: string }> }) {
  const { name } = await context.params;
  const file = await readUpload(name);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file.data), {
    headers: {
      "content-type": file.type,
      "content-length": String(file.data.length),
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
