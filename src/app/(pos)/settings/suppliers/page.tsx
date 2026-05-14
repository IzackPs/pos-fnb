import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from "@/server/inventory/supplier-actions";
import { DataTable } from "../data-table";
import { getDictionary } from "@/i18n/dictionaries";

export default async function SuppliersPage() {
  const items = await getSuppliers();
  const t = getDictionary("vi");
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">{t.settings.suppliers}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t.settings.supplierPageDesc}</p>
      <DataTable
        data={items}
        columns={[
          { key: "name", label: t.settings.name, type: "text" as const },
          { key: "contact", label: t.settings.contactPerson, type: "text" as const },
          { key: "phone", label: t.settings.phone, type: "text" as const },
          { key: "email", label: t.settings.email, type: "text" as const },
          { key: "address", label: t.settings.address, type: "text" as const },
        ]}
        onCreate={createSupplier}
        onUpdate={updateSupplier}
        onDelete={deleteSupplier}
      />
    </div>
  );
}
