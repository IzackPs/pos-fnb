"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/context";

type Column = {
  key: string;
  label: string;
  type?: "text" | "number" | "percent";
};

type ActionFn = (...args: any[]) => Promise<any>;

type Props = {
  data: any[];
  columns: Column[];
  onCreate?: ActionFn;
  onUpdate?: ActionFn;
  onDelete?: ActionFn;
};

export function DataTable({ data, columns, onCreate, onUpdate, onDelete }: Props) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function openNew() {
    setEditing(null);
    const init: Record<string, string> = {};
    columns.forEach(c => { init[c.key] = ""; });
    setForm(init);
    setOpen(true);
  }

  function openEdit(row: any) {
    setEditing(row);
    const init: Record<string, string> = {};
    columns.forEach(c => {
      let val = row[c.key];
      if (c.type === "percent") val = ((val ?? 0) * 100).toString();
      init[c.key] = val?.toString() ?? "";
    });
    setForm(init);
    setOpen(true);
  }

  function save() {
    startTransition(async () => {
      try {
        if (editing && onUpdate) {
          await onUpdate(editing.id, form);
          toast.success(t.common.success);
        } else if (onCreate) {
          await onCreate(form);
          toast.success(t.common.success);
        }
        setOpen(false);
      } catch {
        toast.error(t.common.error);
      }
    });
  }

  function handleDelete(id: string) {
    if (!onDelete) return;
    startTransition(async () => {
      try {
        await onDelete(id);
        toast.success(t.common.success);
      } catch {
        toast.error(t.common.error);
      }
    });
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        {onCreate && (
          <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> {t.common.add}</Button>
        )}
      </div>
      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map(c => (
                <th key={c.key} className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                  {c.label}
                </th>
              ))}
              <th className="w-24 px-4 py-3 text-right text-gray-400 text-xs font-medium">{t.settings.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 && (
              <tr><td colSpan={columns.length + 1} className="text-center py-12 text-gray-400">{t.common.noData}</td></tr>
            )}
            {data.map(row => (
              <tr key={row.id} className="hover:bg-amber-50/30 transition-colors">
                {columns.map((c, ci) => {
                  let val = row[c.key];
                  if (c.type === "percent") val = ((val ?? 0) * 100).toFixed(0) + "%";
                  return (
                    <td key={c.key} className={`px-4 py-3 ${ci === 0 ? "font-semibold text-gray-900" : "text-gray-500"} ${c.key === "email" ? "text-sm font-mono" : ""}`}>
                      {val || <span className="text-gray-300 italic">—</span>}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {onUpdate && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500" onClick={() => handleDelete(row.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? t.settings.edit : t.common.add}</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto py-2">
            {columns.map(c => (
              <div key={c.key} className="space-y-1">
                <label className="text-sm font-medium">{c.label}</label>
                <Input
                  value={form[c.key] ?? ""}
                  onChange={e => setForm(f => ({ ...f, [c.key]: e.target.value }))}
                  type={c.type === "number" || c.type === "percent" ? "number" : "text"}
                  step={c.type === "percent" ? "1" : undefined}
                  className="h-10 rounded-lg"
                />
              </div>
            ))}
          </div>
          <DialogFooter><Button onClick={save} disabled={pending}>{pending ? t.common.saving : t.common.save}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
