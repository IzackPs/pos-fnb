import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MODULE_ROUTES: Record<string, string> = {
  "/order": "order",
  "/inventory": "inventory",
  "/cash": "cash",
  "/reports": "reports",
  "/settings": "settings",
  "/dashboard": "dashboard",
};

// Lightweight JWT decode — no DB query, just inspect cookie payload
function getTokenFromCookie(req: NextRequest): { permissions: string[]; scopes: string[] } | null {
  try {
    const cookieName = process.env.AUTH_URL?.startsWith("https")
      ? "__Secure-authjs.session-token"
      : "authjs.session-token";
    const token = req.cookies.get(cookieName)?.value;
    if (!token) return null;
    // JWT format: header.payload.signature — extract payload (second part)
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    // Check expiry
    if (payload.exp && Date.now() >= payload.exp * 1000) return null;
    return {
      permissions: (() => { try { return JSON.parse(payload.permissions || "[]"); } catch { return []; } })(),
      scopes: (() => { try { return JSON.parse(payload.scopes || "[]"); } catch { return []; } })(),
    };
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/logo.png" ||
    pathname === "/banner.png" ||
    pathname === "/manifest.json"
  ) {
    return NextResponse.next();
  }

  // Check auth via cookie JWT (no DB hit)
  const token = getTokenFromCookie(req);
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // "*" means admin — allow all
  const { permissions, scopes } = token;
  if (permissions.includes("*") || scopes.includes("*")) {
    return NextResponse.next();
  }

  // Find target module
  let targetModule = "";
  for (const [prefix, mod] of Object.entries(MODULE_ROUTES)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      targetModule = mod;
      break;
    }
  }

  // No specific module → allow
  if (!targetModule) return NextResponse.next();

  // Check scope access
  if (!scopes.includes(targetModule)) {
    const firstModule = scopes[0];
    const fallback = firstModule ? `/${firstModule}` : "/order";
    if (pathname === fallback || pathname.startsWith(fallback + "/")) return NextResponse.next();
    return NextResponse.redirect(new URL(fallback, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|logo.png|banner.png|manifest.json).*)"],
};
