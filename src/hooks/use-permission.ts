"use client";

import { useSession } from "next-auth/react";

type Action = "read" | "write" | "view" | "create" | "edit" | "delete";

/**
 * Client-side permission hook.
 * Reads permissions + scopes from session.
 */
export function usePermission() {
  const { data: session } = useSession();
  const permissions: string[] = (() => {
    try { return JSON.parse(session?.user?.permissions || "[]"); }
    catch { return []; }
  })();
  const scopes: string[] = (() => {
    try { return JSON.parse(session?.user?.scopes || "[]"); }
    catch { return []; }
  })();

  function canAccessModule(moduleKey: string): boolean {
    if (permissions.includes("*") || scopes.includes("*")) return true;
    return scopes.includes(moduleKey) || permissions.some(p => {
      const sep = p.includes(":") ? ":" : ".";
      return p.split(sep)[0] === moduleKey;
    });
  }

  function canDo(moduleKey: string, action: Action): boolean {
    if (permissions.includes("*")) return true;
    const actions = new Set<string>();
    if (action === "write") { actions.add("create"); actions.add("edit"); actions.add("delete"); }
    else if (action === "read") { actions.add("view"); }
    else { actions.add(action); }
    actions.add(action);

    for (const p of permissions) {
      const sep = p.includes(":") ? ":" : ".";
      const [mod, act] = p.split(sep);
      if (mod === moduleKey && (act === "*" || actions.has(act))) return true;
    }
    if (action === "read" && scopes.includes(moduleKey)) {
      const hasExplicit = permissions.some(p => {
        const sep = p.includes(":") ? ":" : ".";
        return p.split(sep)[0] === moduleKey;
      });
      if (!hasExplicit) return true;
    }
    return false;
  }

  return {
    canAccessModule,
    canDo,
    permissions,
    scopes,
    isAdmin: permissions.includes("*"),
  };
}
