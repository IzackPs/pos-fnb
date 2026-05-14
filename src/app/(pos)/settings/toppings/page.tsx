import { getToppingGroups, createToppingGroup, updateToppingGroup, deleteToppingGroup, createTopping, updateTopping, deleteTopping, getCategories, getProducts, linkProductToppingGroup, unlinkProductToppingGroup } from "@/server/settings/actions";
import { ToppingsManager } from "../components-toppings";
import { getServerDictionary } from "@/lib/locale";

export default async function ToppingsPage() {
  const [groups, categories, products] = await Promise.all([
    getToppingGroups(), getCategories(), getProducts(),
  ]);
  const t = await getServerDictionary();
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">{t.settings.toppings}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t.settings.toppingPageDesc}</p>
      <ToppingsManager
        groups={groups}
        createGroup={createToppingGroup}
        updateGroup={updateToppingGroup}
        deleteGroup={deleteToppingGroup}
        createTopping={createTopping}
        updateTopping={updateTopping}
        deleteTopping={deleteTopping}
        categories={categories}
        products={products}
        linkToppingGroup={linkProductToppingGroup}
        unlinkToppingGroup={unlinkProductToppingGroup}
      />
    </div>
  );
}
