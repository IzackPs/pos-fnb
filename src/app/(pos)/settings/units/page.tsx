import { getUnits, createUnit, updateUnit, deleteUnit } from "@/server/settings/actions";
import { DataTable } from "../data-table";
import { getServerDictionary } from "@/lib/locale";

export default async function UnitsPage() {
  const units = await getUnits();
  const t = await getServerDictionary();
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">{t.settings.units}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t.settings.unitPageDesc}</p>
      <DataTable
        data={units}
        columns={[{ key: "name", label: t.settings.name, type: "text" as const }]}
        onCreate={createUnit}
        onUpdate={updateUnit}
        onDelete={deleteUnit}
      />
    </div>
  );
}
