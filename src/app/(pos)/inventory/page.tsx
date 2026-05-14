import { getInventoryStatus, getStockIns, getStockOuts, getLowStockIngredients } from "@/server/inventory/actions";
import { getIngredients } from "@/server/settings/actions";
import { getSuppliers } from "@/server/inventory/supplier-actions";
import { InventoryClient } from "./inventory-client";

export default async function InventoryPage() {
  const [ingredients, stockIns, stockOuts, lowStock, allIngredients, suppliers] = await Promise.all([
    getInventoryStatus(), getStockIns(), getStockOuts(), getLowStockIngredients(), getIngredients(), getSuppliers(),
  ]);
  return <InventoryClient ingredients={ingredients} stockIns={stockIns} stockOuts={stockOuts} lowStock={lowStock} allIngredients={allIngredients} suppliers={suppliers} />;
}
