import { getExciseTaxes, upsertExciseTax } from "@/server/settings/actions";
import { DataTable } from "../data-table";
import { getServerDictionary } from "@/lib/locale";

export default async function ExciseTaxPage() {
  const taxes = await getExciseTaxes();
  const t = await getServerDictionary();
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">{t.settings.exciseTax}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t.settings.exciseTaxPageDesc}</p>
      <DataTable
        data={taxes}
        columns={[
          { key: "code", label: t.inventory.code, type: "text" as const },
          { key: "name", label: t.settings.name, type: "text" as const },
          { key: "rate", label: t.common.taxRate || "Thuế suất (%)", type: "percent" as const },
        ]}
        onUpdate={upsertExciseTax}
      />
    </div>
  );
}
