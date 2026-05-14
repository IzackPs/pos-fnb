import { getPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod } from "@/server/settings/actions";
import { DataTable } from "../data-table";
import { getServerDictionary } from "@/lib/locale";

export default async function PaymentMethodsPage() {
  const methods = await getPaymentMethods();
  const t = await getServerDictionary();
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">{t.settings.paymentMethods}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t.settings.paymentMethodPageDesc}</p>
      <DataTable
        data={methods}
        columns={[
          { key: "name", label: t.settings.name, type: "text" as const },
          { key: "code", label: t.inventory.code, type: "text" as const },
          { key: "sortOrder", label: t.settings.sortOrder, type: "number" as const },
        ]}
        onCreate={createPaymentMethod}
        onUpdate={updatePaymentMethod}
        onDelete={deletePaymentMethod}
      />
    </div>
  );
}
