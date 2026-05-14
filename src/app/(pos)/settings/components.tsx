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
import { Pencil, Trash2, Plus, Shield } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/context";
import { getUsers, getRoles, createUser, updateUser, deleteUser, createRole, updateRole, deleteRole } from "@/server/settings/actions";

type User = Awaited<ReturnType<typeof getUsers>>[0];
type Role = Awaited<ReturnType<typeof getRoles>>[0];

export function UsersManager({ users, roles }: { users: User[]; roles: Role[] }) {
  const { t } = useI18n();
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [userForm, setUserForm] = useState({ username: "", password: "", name: "", roleId: "" });
  const [roleForm, setRoleForm] = useState({ name: "", permissions: "[\"*\"]" });

  function openNewUser() { setEditingUser(null); setUserForm({ username: "", password: "", name: "", roleId: roles[0]?.id ?? "" }); setOpenUserDialog(true); }
  function openEditUser(u: User) { setEditingUser(u); setUserForm({ username: u.username, password: "", name: u.name, roleId: u.roleId }); setOpenUserDialog(true); }
  function openNewRole() { setEditingRole(null); setRoleForm({ name: "", permissions: "" }); setOpenRoleDialog(true); }
  function openEditRole(r: Role) { setEditingRole(r); setRoleForm({ name: r.name, permissions: r.permissions }); setOpenRoleDialog(true); }

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
      if (editingRole) {
        await updateRole(editingRole.id, roleForm);
        toast.success(t.common.success);
      } else {
        await createRole(roleForm);
        toast.success(t.common.success);
      }
      setOpenRoleDialog(false);
    } catch { toast.error(t.common.error); }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">{t.settings.users}</TabsTrigger>
          <TabsTrigger value="roles">{t.settings.roles}</TabsTrigger>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {roles.map(r => (
              <Card key={r.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{r.name}</CardTitle>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditRole(r)}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { deleteRole(r.id); toast.success(t.common.success); }}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground font-mono">{r.permissions}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

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

      <Dialog open={openRoleDialog} onOpenChange={setOpenRoleDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingRole ? t.settings.editRole : t.settings.addRole}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>{t.settings.roleName || "Tên vai trò"}</Label><Input value={roleForm.name} onChange={e => setRoleForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1"><Label>{t.settings.permissions || "Quyền (JSON)"}</Label><Input value={roleForm.permissions} onChange={e => setRoleForm(f => ({ ...f, permissions: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={saveRole}>{t.common.save}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
