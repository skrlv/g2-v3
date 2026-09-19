import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.DATABASE_URL ?? "";
  const safeHost = url.split("@")[1]?.split("/")[0] ?? null;
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, host: safeHost });
  } catch (e: any) {
    return Response.json(
      {
        ok: false,
        hasUrl: !!url,
        host: safeHost,
        sslmode: url.includes("sslmode") ? "present" : "missing",
        error: e?.message ?? String(e),
        code: e?.code ?? null,
        errno: e?.errno ?? null,
      },
      { status: 500 }
    );
  }
}