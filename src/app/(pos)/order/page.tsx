import { getActiveAreasWithTables, getCategoriesWithProducts } from "@/server/order/actions";
import { OrderClient } from "./order-client";

export default async function OrderPage() {
  const [areas, categories] = await Promise.all([
    getActiveAreasWithTables(),
    getCategoriesWithProducts(),
  ]);
  return <OrderClient areas={areas} categories={categories} />;
}
