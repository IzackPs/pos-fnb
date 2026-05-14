import { getIngredients, createIngredient, updateIngredient, deleteIngredient } from "@/server/settings/actions";
import { DataTable } from "../data-table";
import { getDictionary } from "@/i18n/dictionaries";

export default async function IngredientsPage() {
  const items = await getIngredients();
  const t = getDictionary("vi");
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">{t.settings.ingredients}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t.settings.ingredientPageDesc}</p>
      <DataTable
        data={items}
        columns={[
          { key: "name", label: t.settings.name, type: "text" as const },
          { key: "purchaseUnit", label: t.inventory.purchaseUnit, type: "text" as const },
          { key: "baseUnit", label: t.inventory.baseUnit, type: "text" as const },
          { key: "conversionFactor", label: t.inventory.conversionFactor, type: "number" as const },
          { key: "purchasePrice", label: t.inventory.unitPrice, type: "number" as const },
          { key: "costPerBaseUnit", label: t.inventory.costPrice, type: "number" as const },
          { key: "minStock", label: t.inventory.minStock, type: "number" as const },
        ]}
        onCreate={createIngredient}
        onUpdate={updateIngredient}
        onDelete={deleteIngredient}
      />
    </div>
  );
}
