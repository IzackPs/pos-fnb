import { describe, expect, it, vi } from "vitest";

vi.mock("next-auth", () => ({
  default: vi.fn(() => ({
    auth: (handler: (req: unknown) => Response) => handler,
  })),
}));

vi.mock("./lib/auth.config", () => ({
  default: {},
}));

import middleware from "./middleware";

function request(pathname: string, user?: { permissions?: string; scopes?: string }) {
  const url = `https://pos.test${pathname}`;
  return {
    auth: user ? { user } : null,
    nextUrl: new URL(url),
    url,
  };
}

function locationOf(response: Response) {
  return response.headers.get("location");
}

describe("middleware", () => {
  it("allows public routes without authentication", () => {
    const response = middleware(request("/login") as never);

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects unauthenticated users to login", () => {
    const response = middleware(request("/order") as never);

    expect(locationOf(response)).toBe("https://pos.test/login");
  });

  it("allows wildcard permissions", () => {
    const response = middleware(request("/settings", { permissions: "[\"*\"]", scopes: "[]" }) as never);

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("allows module scopes and redirects blocked modules to the first allowed scope", () => {
    const allowed = middleware(request("/inventory/items", { permissions: "[]", scopes: "[\"inventory\"]" }) as never);
    const blocked = middleware(request("/reports", { permissions: "[]", scopes: "[\"inventory\"]" }) as never);

    expect(allowed.headers.get("x-middleware-next")).toBe("1");
    expect(locationOf(blocked)).toBe("https://pos.test/inventory");
  });

  it("falls back to order when the authenticated user has no module scopes", () => {
    const response = middleware(request("/cash", { permissions: "not-json", scopes: "not-json" }) as never);

    expect(locationOf(response)).toBe("https://pos.test/order");
  });
});
