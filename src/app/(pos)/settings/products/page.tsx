import { getProducts, getCategories, getVats, getExciseTaxes, getUnits, createProduct, updateProduct, deleteProduct, getIngredients, getToppingGroups, linkProductToppingGroup, unlinkProductToppingGroup } from "@/server/settings/actions";
import { ProductsManager } from "../components-products";
import { getServerDictionary } from "@/lib/locale";

export default async function ProductsPage() {
  const [products, categories, vats, exciseTaxes, units, allIngredients, toppingGroups] = await Promise.all([
    getProducts(), getCategories(), getVats(), getExciseTaxes(), getUnits(), getIngredients(), getToppingGroups(),
  ]);
  const t = await getServerDictionary();
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">{t.settings.products}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t.settings.productPageDesc}</p>
      <ProductsManager
        products={products}
        categories={categories}
        vats={vats}
        exciseTaxes={exciseTaxes}
        units={units}
        createProduct={createProduct}
        updateProduct={updateProduct}
        deleteProduct={deleteProduct}
        allIngredients={allIngredients}
        toppingGroups={toppingGroups}
        linkToppingGroup={linkProductToppingGroup}
        unlinkToppingGroup={unlinkProductToppingGroup}
      />
    </div>
  );
}
