"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Trash2, Plus, Shield, ShoppingBag, ClipboardList, DollarSign, BarChart3, Settings2, LayoutDashboard, Tv, Music, Users, X, Check, Eye } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/context";
import { getUsers, getRoles, createUser, updateUser, deleteUser, createRole, updateRole, deleteRole } from "@/server/settings/actions";

type User = Awaited<ReturnType<typeof getUsers>>[0];
type Role = Awaited<ReturnType<typeof getRoles>>[0];

// ======= PERMISSION MATRIX =======
type ActionKey = "view" | "create" | "edit" | "delete";

interface ModuleDef {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

const MODULES: ModuleDef[] = [
  { key: "order", label: "Bán hàng", icon: ShoppingBag, color: "blue" },
  { key: "dashboard", label: "Tổng quan", icon: LayoutDashboard, color: "emerald" },
  { key: "inventory", label: "Kho", icon: ClipboardList, color: "amber" },
  { key: "cash", label: "Thu chi", icon: DollarSign, color: "green" },
  { key: "reports", label: "Báo cáo", icon: BarChart3, color: "purple" },
  { key: "settings", label: "Cài đặt", icon: Settings2, color: "gray" },
  { key: "kds", label: "Màn bếp", icon: Tv, color: "red" },
  { key: "karaoke", label: "Karaoke", icon: Music, color: "pink" },
];

const ACTIONS: { key: ActionKey; label: string; short: string }[] = [
  { key: "view", label: "Xem", short: "X" },
  { key: "create", label: "Thêm", short: "T" },
  { key: "edit", label: "Sửa", short: "S" },
  { key: "delete", label: "Xóa", short: "Xo" },
];

// Parse permissions string → { module: ActionKey[] }
function parsePermissions(permissions: string): Record<string, ActionKey[]> {
  try {
    const arr = JSON.parse(permissions || "[]") as string[];
    if (!Array.isArray(arr)) return {};
    const result: Record<string, ActionKey[]> = {};
    for (const p of arr) {
      if (p === "*") {
        for (const m of MODULES) result[m.key] = ["view", "create", "edit", "delete"];
        return result;
      }
      const dot = p.lastIndexOf(".");
      const colon = p.lastIndexOf(":");
      const sep = Math.max(dot, colon);
      if (sep < 0) continue;
      const moduleKey = p.substring(0, sep);
      const action = p.substring(sep + 1);
      if (action === "*") { result[moduleKey] = ["view", "create", "edit", "delete"]; }
      else if (["view", "create", "edit", "delete"].includes(action)) {
        if (!result[moduleKey]) result[moduleKey] = [];
        if (!result[moduleKey].includes(action as ActionKey)) result[moduleKey].push(action as ActionKey);
      }
    }
    return result;
  } catch { return {}; }
}

// Serialize back to JSON string
function serializePermissions(perms: Record<string, ActionKey[]>): string {
  const arr: string[] = [];
  const allModules = MODULES.map(m => m.key);
  const hasAll = allModules.every(m => {
    const a = perms[m];
    return a && a.length === 4;
  });
  if (hasAll) return JSON.stringify(["*"]);
  for (const [moduleKey, actions] of Object.entries(perms)) {
    if (!actions || actions.length === 0) continue;
    if (actions.length === 4) { arr.push(`${moduleKey}.*`); }
    else { for (const a of actions) arr.push(`${moduleKey}:${a}`); }
  }
  return JSON.stringify(arr);
}

function parseScopes(scopes: string): string[] {
  try { const arr = JSON.parse(scopes || "[]"); return Array.isArray(arr) ? arr : []; }
  catch { return []; }
}

function serializeScopes(modules: string[]): string {
  return JSON.stringify(modules);
}

export function UsersManager({ users, roles }: { users: User[]; roles: Role[] }) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("users");
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [userForm, setUserForm] = useState({ username: "", password: "", name: "", roleId: "" });
  const [roleForm, setRoleForm] = useState({ name: "", permissions: "[]", scopes: "[]" });
  const [rolePerms, setRolePerms] = useState<Record<string, ActionKey[]>>({});

  function openNewUser() { setEditingUser(null); setUserForm({ username: "", password: "", name: "", roleId: roles[0]?.id ?? "" }); setOpenUserDialog(true); }
  function openEditUser(u: User) { setEditingUser(u); setUserForm({ username: u.username, password: "", name: u.name, roleId: u.roleId }); setOpenUserDialog(true); }
  function openNewRole() { setEditingRole(null); setRoleForm({ name: "", permissions: "[]", scopes: "[]" }); setRolePerms({}); setOpenRoleDialog(true); }
  function openEditRole(r: Role) {
    setEditingRole(r);
    setRoleForm({ name: r.name, permissions: r.permissions, scopes: r.scopes || "[]" });
    setRolePerms(parsePermissions(r.permissions));
    setOpenRoleDialog(true);
  }

  function toggleModuleAction(moduleKey: string, action: ActionKey) {
    setRolePerms(prev => {
      const next = { ...prev };
      if (!next[moduleKey]) next[moduleKey] = [];
      const idx = next[moduleKey].indexOf(action);
      if (idx >= 0) { next[moduleKey] = next[moduleKey].filter(a => a !== action); if (next[moduleKey].length === 0) delete next[moduleKey]; }
      else { next[moduleKey] = [...next[moduleKey], action]; }
      return next;
    });
  }

  function moduleAll(moduleKey: string) {
    setRolePerms(prev => ({ ...prev, [moduleKey]: ["view", "create", "edit", "delete"] }));
  }
  function moduleNone(moduleKey: string) {
    setRolePerms(prev => { const next = { ...prev }; delete next[moduleKey]; return next; });
  }
  function selectAll() {
    const all: Record<string, ActionKey[]> = {};
    MODULES.forEach(m => all[m.key] = ["view", "create", "edit", "delete"]);
    setRolePerms(all);
  }
  function viewOnly() {
    const all: Record<string, ActionKey[]> = {};
    MODULES.forEach(m => all[m.key] = ["view"]);
    setRolePerms(all);
  }
  function clearAll() { setRolePerms({}); }

  const selectedScopes = Object.keys(rolePerms);

  async function saveUser() {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, { name: userForm.name, roleId: userForm.roleId, ...(userForm.password ? { password: userForm.password } : {}) });
        toast.success(t.common.success);
      } else {
        await createUser(userForm as any);
        toast.success(t.common.success);
      }
      setOpenUserDialog(false);
    } catch { toast.error(t.common.error); }
  }

  async function saveRole() {
    try {
      const data = {
        name: roleForm.name,
        permissions: serializePermissions(rolePerms),
        scopes: serializeScopes(selectedScopes),
      };
      if (editingRole) await updateRole(editingRole.id, data);
      else await createRole(data);
      toast.success(t.common.success);
      setOpenRoleDialog(false);
    } catch { toast.error(t.common.error); }
  }

  function getModuleIcon(key: string) {
    return MODULES.find(m => m.key === key)?.icon || Shield;
  }
  function getModuleColor(key: string) {
    return MODULES.find(m => m.key === key)?.color || "gray";
  }
  function getModuleLabel(key: string) {
    return MODULES.find(m => m.key === key)?.label || key;
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" />{t.settings.users}</TabsTrigger>
          <TabsTrigger value="roles"><Shield className="h-4 w-4 mr-1" />{t.settings.roles}</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4 pt-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">{t.settings.userList}</h3>
            <Button size="sm" onClick={openNewUser}><Plus className="h-4 w-4 mr-1" /> {t.common.add}</Button>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>{t.settings.name}</TableHead><TableHead>{t.settings.account}</TableHead><TableHead>{t.settings.roles}</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.username}</TableCell>
                  <TableCell><Badge variant="outline">{u.role.name}</Badge></TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditUser(u)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { deleteUser(u.id); toast.success(t.common.success); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4 pt-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">{t.settings.roleList}</h3>
            <Button size="sm" onClick={openNewRole}><Shield className="h-4 w-4 mr-1" /> {t.settings.add}</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {roles.map(r => {
              const perms = parsePermissions(r.permissions);
              const scopes = parseScopes(r.scopes || "[]");
              const userCount = users.filter(u => u.roleId === r.id).length;
              return (
                <Card key={r.id} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => openEditRole(r)}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">{r.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{userCount} người dùng</p>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEditRole(r); }}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteRole(r.id); toast.success(t.common.success); }}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {perms["*"] || Object.keys(perms).length === MODULES.length * 4 ? (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">Toàn quyền</Badge>
                    ) : scopes.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {scopes.map(s => {
                          const mod = MODULES.find(m => m.key === s);
                          const IconComponent = getModuleIcon(s);
                          const actions = perms[s];
                          const isFull = actions && actions.length === 4;
                          const colorMap: Record<string, string> = { blue: "bg-blue-100 text-blue-700", emerald: "bg-emerald-100 text-emerald-700", amber: "bg-amber-100 text-amber-700", green: "bg-green-100 text-green-700", purple: "bg-purple-100 text-purple-700", gray: "bg-gray-100 text-gray-700", red: "bg-red-100 text-red-700", pink: "bg-pink-100 text-pink-700" };
                          return (
                            <span key={s} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${colorMap[s] || "bg-gray-100 text-gray-700"}`}>
                              <IconComponent className="h-3 w-3" />
                              {mod?.label || s}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Chưa có quyền nào</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* ====== USER DIALOG ====== */}
      <Dialog open={openUserDialog} onOpenChange={setOpenUserDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingUser ? t.settings.editUser : t.settings.addUser}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>{t.settings.fullName || "Họ tên"}</Label><Input value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1"><Label>{t.settings.username || "Tên đăng nhập"}</Label><Input value={userForm.username} onChange={e => setUserForm(f => ({ ...f, username: e.target.value }))} disabled={!!editingUser} /></div>
            <div className="space-y-1"><Label>{editingUser ? t.settings.newPassword : t.settings.password || "Mật khẩu"}</Label><Input type="password" value={userForm.password} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))} /></div>
            <div className="space-y-1"><Label>{t.settings.roles}</Label>
              <Select value={userForm.roleId} onValueChange={v => setUserForm(f => ({ ...f, roleId: v ?? "" }))}>
                <SelectTrigger><SelectValue placeholder={t.settings.selectRole || "Chọn vai trò"}>{roles.find(r => r.id === userForm.roleId)?.name}</SelectValue></SelectTrigger>
                <SelectContent>{roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={saveUser}>{t.common.save}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====== ROLE DIALOG — PERMISSION MATRIX ====== */}
      <Dialog open={openRoleDialog} onOpenChange={setOpenRoleDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRole ? t.settings.editRole : t.settings.addRole}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Role Name */}
            <div className="space-y-1">
              <Label>{t.settings.roleName || "Tên vai trò"}</Label>
              <Input
                value={roleForm.name}
                onChange={e => setRoleForm(f => ({ ...f, name: e.target.value }))}
                placeholder="VD: Thu Ngân"
                className="font-semibold"
              />
            </div>

            {/* Quick presets */}
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={selectAll} className="gap-1 text-xs h-8 bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100">
                <Check className="h-3 w-3" /> Toàn quyền
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={viewOnly} className="gap-1 text-xs h-8 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                <Eye className="h-3 w-3" /> Chỉ xem
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={clearAll} className="gap-1 text-xs h-8 bg-red-50 border-red-200 text-red-700 hover:bg-red-100">
                <X className="h-3 w-3" /> Bỏ hết
              </Button>
            </div>

            {/* Permission Matrix */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Header row */}
              <div className="grid grid-cols-[1.6fr_repeat(4,1fr)_40px] bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600">
                <div className="p-3">Module</div>
                {ACTIONS.map(a => (
                  <div key={a.key} className="p-3 text-center">{a.label}</div>
                ))}
                <div className="p-3"></div>
              </div>
              {/* Module rows */}
              {MODULES.map(mod => {
                const modPerms = rolePerms[mod.key] || [];
                const isFull = modPerms.length === 4;
                const hasSome = modPerms.length > 0;
                const IconComponent = mod.icon;
                return (
                  <div key={mod.key} className={`grid grid-cols-[1.6fr_repeat(4,1fr)_40px] border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${hasSome ? "" : "opacity-60"}`}>
                    <div className="p-3 flex items-center gap-2">
                      <IconComponent className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">{mod.label}</span>
                    </div>
                    {ACTIONS.map(a => {
                      const checked = modPerms.includes(a.key);
                      return (
                        <div key={a.key} className="p-3 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => toggleModuleAction(mod.key, a.key)}
                            className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-all border-2 ${
                              checked
                                ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                                : "border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-500 bg-white"
                            }`}
                          >
                            {checked ? <Check className="h-3 w-3" /> : a.short}
                          </button>
                        </div>
                      );
                    })}
                    <div className="p-3 flex items-center justify-center">
                      {isFull ? (
                        <button type="button" onClick={() => moduleNone(mod.key)} className="text-red-400 hover:text-red-600 p-0.5 rounded" title="Bỏ chọn module này">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button type="button" onClick={() => moduleAll(mod.key)} className="text-amber-400 hover:text-amber-600 p-0.5 rounded" title="Chọn toàn bộ module này">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="text-xs text-muted-foreground">
              {selectedScopes.length === 0 ? (
                <span className="text-gray-400 italic">Chưa chọn quyền nào</span>
              ) : (
                <span>
                  Đã chọn <strong className="text-gray-700">{selectedScopes.length}</strong> module:{" "}
                  {selectedScopes.map(s => getModuleLabel(s)).join(", ")}
                </span>
              )}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={saveRole} disabled={!roleForm.name}>{t.common.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
