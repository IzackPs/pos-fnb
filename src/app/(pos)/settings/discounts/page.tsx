import { getDiscounts, createDiscount, updateDiscount, deleteDiscount, getCategories } from "@/server/settings/actions";
import { DiscountsUI } from "../discounts-ui";

export default async function DiscountsPage() {
  const [discounts, categories] = await Promise.all([getDiscounts(), getCategories()]);
  return (
    <DiscountsUI
      discounts={discounts}
      categories={categories}
      createDiscount={createDiscount}
      updateDiscount={updateDiscount}
      deleteDiscount={deleteDiscount}
    />
  );
}
