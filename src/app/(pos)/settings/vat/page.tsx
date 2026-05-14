import { getVats, upsertVat } from "@/server/settings/actions";
import { DataTable } from "../data-table";
import { getServerDictionary } from "@/lib/locale";

export default async function VatPage() {
  const vats = await getVats();
  const t = await getServerDictionary();
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">{t.settings.vat}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t.settings.vatPageDesc}</p>
      <DataTable
        data={vats}
        columns={[
          { key: "code", label: t.inventory.code, type: "text" as const },
          { key: "name", label: t.settings.name, type: "text" as const },
          { key: "rate", label: t.common.taxRate || "Rate (%)", type: "percent" as const },
        ]}
        onUpdate={upsertVat}
      />
    </div>
  );
}
