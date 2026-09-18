/**
 * Простой лимит запросов на адрес клиента, в памяти процесса.
 * На serverless-хостинге счёт ведётся отдельно в каждом экземпляре — этого
 * хватает против ручного спама и простых скриптов, но не заменяет защиту на
 * уровне хостинга (Vercel WAF, Cloudflare).
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5000;

function prune(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/** true — запрос можно пропустить; false — лимит на это окно исчерпан. */
export function allowRequest(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (buckets.size > MAX_BUCKETS) prune(now);
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/** Адрес клиента за прокси хостинга (Vercel, Railway, nginx). */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
