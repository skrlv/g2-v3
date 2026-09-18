import { NextResponse, type NextRequest } from "next/server";

/**
 * Прокси-слой Next.js (бывший middleware): закрывает студию и всё, что меняет
 * каталог, паролем ADMIN_PASSWORD
 * (HTTP Basic Auth: в браузере появится окно входа, логин любой).
 *
 * Что закрыто: /admin, /api/admin/*, /api/seed, /api/upload, любые изменения
 * /api/products и список с черновиками (/api/products?all=true).
 * Корзина, заказы, сообщения и публичный каталог открыты всегда.
 *
 * Без пароля на проде студия отвечает «выключена», а не открывается всем;
 * при локальной разработке (NODE_ENV !== production) всё открыто.
 */
const PROTECTED_PREFIXES = ["/admin", "/api/admin", "/api/seed", "/api/upload"];
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function isProtected(request: NextRequest): boolean {
  const { pathname, searchParams } = request.nextUrl;
  const method = request.method.toUpperCase();

  if (PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true;

  if (pathname.startsWith("/api/products")) {
    if (!SAFE_METHODS.has(method)) return true;
    if (searchParams.get("all") === "true") return true;
  }
  return false;
}

/** Пароль из заголовка Basic: UTF-8 (кириллица в пароле работает), мусор → "". */
function passwordFromHeader(header: string | null): string {
  if (!header || !header.startsWith("Basic ")) return "";
  try {
    const binary = atob(header.slice(6).trim());
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    const separator = decoded.indexOf(":");
    return separator === -1 ? decoded : decoded.slice(separator + 1);
  } catch {
    return "";
  }
}

/** Сравнение за одинаковое время независимо от того, где строки расходятся. */
function safeEqual(a: string, b: string): boolean {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  let diff = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i += 1) {
    diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  }
  return diff === 0;
}

/** Запрос на изменение пришёл с чужого сайта — браузер сам подставил бы пароль (CSRF). */
function isCrossSite(request: NextRequest): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site === "same-origin" || site === "none") return false;
  if (site) return true;

  // Старые браузеры без Sec-Fetch-Site: сверяем Origin с хостом.
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

function unauthorized(request: NextRequest): NextResponse {
  const headers = { "WWW-Authenticate": 'Basic realm="G2 Studio", charset="UTF-8"' };
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401, headers });
  }
  return new NextResponse("Студия защищена паролем", { status: 401, headers });
}

export function proxy(request: NextRequest) {
  if (!isProtected(request)) return NextResponse.next();

  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse(
        "Студия выключена: на сервере не задана переменная ADMIN_PASSWORD.",
        { status: 503 },
      );
    }
    return NextResponse.next();
  }

  if (!SAFE_METHODS.has(request.method.toUpperCase()) && isCrossSite(request)) {
    return NextResponse.json({ error: "Запрос с чужого сайта отклонён" }, { status: 403 });
  }

  const given = passwordFromHeader(request.headers.get("authorization"));
  if (given && safeEqual(given, password)) return NextResponse.next();

  return unauthorized(request);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/admin",
    "/api/admin/:path*",
    "/api/seed",
    "/api/upload",
    "/api/products",
    "/api/products/:path*",
  ],
};
