"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ========== SUPPLIER CRUD ==========

export async function getSuppliers() {
  return db.supplier.findMany({ orderBy: { name: "asc" } });
}

export async function createSupplier(data: {
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  note?: string;
}) {
  const supplier = await db.supplier.create({ data });
  revalidatePath("/settings");
  revalidatePath("/inventory");
  return supplier;
}

export async function updateSupplier(id: string, data: {
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  note?: string;
}) {
  const supplier = await db.supplier.update({ where: { id }, data });
  revalidatePath("/settings");
  revalidatePath("/inventory");
  return supplier;
}

export async function deleteSupplier(id: string) {
  await db.supplier.delete({ where: { id } });
  revalidatePath("/settings");
  revalidatePath("/inventory");
}

// ========== AUTO-FILL ==========

export async function getLastStockInBySupplier(supplierId: string) {
  // Find the most recent stock-in for this supplier
  const lastStockIn = await db.stockIn.findFirst({
    where: { supplierId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          ingredient: {
            select: {
              id: true,
              name: true,
              purchaseUnit: true,
              baseUnit: true,
              purchasePrice: true,
            },
          },
        },
      },
    },
  });

  if (!lastStockIn) return [];

  // Return unique ingredients from last stock-in with their last prices
  const seen = new Set<string>();
  const items: {
    ingredientId: string;
    ingredientName: string;
    purchaseUnit: string;
    baseUnit: string;
    unitPrice: number;
  }[] = [];

  for (const item of lastStockIn.items) {
    if (!seen.has(item.ingredientId)) {
      seen.add(item.ingredientId);
      items.push({
        ingredientId: item.ingredientId,
        ingredientName: item.ingredient.name,
        purchaseUnit: item.ingredient.purchaseUnit,
        baseUnit: item.ingredient.baseUnit,
        unitPrice: item.unitPrice,
      });
    }
  }

  return items;
}
