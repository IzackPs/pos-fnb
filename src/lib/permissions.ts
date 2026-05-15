/**
 * Permission check helpers for role-based access control.
 *
 * Permission format: "module:action" or "module.*" or "*"
 *   - "order:write" — can write (create/edit/delete) in order module
 *   - "order:read"  — can read/view order module
 *   - "order.*"     — all actions on order
 *   - "*"           — super admin (all modules, all actions)
 *
 * Scopes format: JSON array of module keys — e.g. ["order", "inventory"]
 *   - When a scope exists, the module is accessible at all.
 *   - When absent, the module is hidden entirely.
 */

type Action = "read" | "write" | "view" | "create" | "edit" | "delete";

interface ParsedPermissions {
  [moduleKey: string]: Set<string>;
}

let allPermissions: string[];
let allScopes: string[];

/** Must be called once on each request with the user's raw permission/scopes strings. */
export function initPermissions(permissions: string, scopes: string) {
  try {
    allPermissions = JSON.parse(permissions || "[]");
  } catch {
    allPermissions = [];
  }
  try {
    allScopes = JSON.parse(scopes || "[]");
  } catch {
    allScopes = [];
  }
}

/** Check if user has access to a given module. */
export function canAccessModule(moduleKey: string): boolean {
  if (allPermissions.includes("*")) return true;
  if (allScopes.includes("*")) return true;
  return allScopes.includes(moduleKey) || allPermissions.some(p => p.startsWith(moduleKey + ":") || p.startsWith(moduleKey + "."));
}

/** Check if user can perform a specific action on a module. */
export function canDo(moduleKey: string, action: Action): boolean {
  if (allPermissions.includes("*")) return true;
  // Normalize: "write" covers create/edit/delete; "read" covers view
  const actions = new Set<string>();
  if (action === "write") { actions.add("create"); actions.add("edit"); actions.add("delete"); }
  else if (action === "read") { actions.add("view"); }
  else { actions.add(action); }
  actions.add(action);

  // Check specific permissions like "order:edit", "order.*"
  for (const p of allPermissions) {
    const sep = p.includes(":") ? ":" : ".";
    const [mod, act] = p.split(sep);
    if (mod === moduleKey && (act === "*" || actions.has(act))) return true;
  }
  // Legacy check: if user has scoped access but no specific action, default to "view"
  if (action === "read" && allScopes.includes(moduleKey)) {
    // Has scope, no deny → allow read
    const hasExplicitActions = allPermissions.some(p => {
      const sep = p.includes(":") ? ":" : ".";
      return p.split(sep)[0] === moduleKey;
    });
    if (!hasExplicitActions) return true;
  }
  return false;
}

/** Get all accessible module keys. */
export function accessibleModules(): string[] {
  if (allPermissions.includes("*") || allScopes.includes("*")) {
    return ["order", "dashboard", "inventory", "cash", "reports", "settings", "kds", "karaoke"];
  }
  return allScopes.slice();
}

/** Parse raw permissions string into structured map (for UI). */
export function parsePermissions(permissions: string): ParsedPermissions {
  try {
    const arr = JSON.parse(permissions || "[]");
    const result: ParsedPermissions = {};
    for (const p of arr) {
      if (p === "*") return { "*": new Set(["*"]) };
      const sep = p.includes(":") ? ":" : ".";
      const [mod, act] = p.split(sep);
      if (!result[mod]) result[mod] = new Set();
      result[mod].add(act);
    }
    return result;
  } catch {
    return {};
  }
}
