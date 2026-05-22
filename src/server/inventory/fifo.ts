"use server";

import { db } from "@/lib/db";
import type { Prisma, PrismaClient } from "@prisma/client";

type Tx = Prisma.TransactionClient;
type DbLike = Tx | PrismaClient;

export async function createOpeningBatchesForExistingStock() {
  const ingredients = await db.ingredient.findMany({
    where: { currentStock: { gt: 0 } },
    include: { batches: true },
  });

  let created = 0;
  for (const ingredient of ingredients) {
    if (ingredient.batches.length > 0) continue;
    await db.inventoryBatch.create({
      data: {
        ingredientId: ingredient.id,
        batchCode: "OPENING",
        receivedAt: ingredient.createdAt,
        quantityIn: ingredient.currentStock,
        remainingQuantity: ingredient.currentStock,
        unitCost: ingredient.costPerBaseUnit || ingredient.purchasePrice || 0,
        status: "OPEN",
      },
    });
    created++;
  }
  return { created };
}

async function offsetNegativeBatches(tx: DbLike, data: {
  ingredientId: string;
  stockInBatchId: string;
  quantity: number;
  unitCost: number;
}) {
  let available = data.quantity;
  let allocatedToNegative = 0;

  const negativeBatches = await tx.inventoryBatch.findMany({
    where: {
      ingredientId: data.ingredientId,
      remainingQuantity: { lt: 0 },
      status: "NEGATIVE",
    },
    orderBy: [
      { receivedAt: "asc" },
      { createdAt: "asc" },
      { id: "asc" },
    ],
  });

  for (const neg of negativeBatches) {
    if (available <= 1e-9) break;

    const offsetQty = Math.min(-neg.remainingQuantity, available);
    await tx.inventoryBatch.update({
      where: { id: neg.id },
      data: {
        remainingQuantity: { increment: offsetQty },
        status: Math.abs(neg.remainingQuantity + offsetQty) <= 1e-9 ? "CLOSED" : "NEGATIVE",
      },
    });

    await tx.stockOutBatch.updateMany({
      where: { negativeBatchId: neg.id, batchId: neg.id },
      data: { batchId: data.stockInBatchId, unitCost: data.unitCost, totalCost: offsetQty * data.unitCost },
    });

    available -= offsetQty;
    allocatedToNegative += offsetQty;
  }

  return { available, allocatedToNegative };
}

export async function createBatchForStockInItem(tx: DbLike, data: {
  ingredientId: string;
  stockInItemId: string;
  stockInCode: string;
  quantity: number;
  unitCost: number;
  receivedAt?: Date;
  expiryDate?: Date | null;
}) {
  const batch = await tx.inventoryBatch.create({
    data: {
      ingredientId: data.ingredientId,
      stockInItemId: data.stockInItemId,
      batchCode: data.stockInCode,
      receivedAt: data.receivedAt || new Date(),
      expiryDate: data.expiryDate || null,
      quantityIn: data.quantity,
      remainingQuantity: data.quantity,
      unitCost: data.unitCost,
      status: data.quantity > 0 ? "OPEN" : "CLOSED",
    },
  });

  const { available } = await offsetNegativeBatches(tx, {
    ingredientId: data.ingredientId,
    stockInBatchId: batch.id,
    quantity: data.quantity,
    unitCost: data.unitCost,
  });

  if (Math.abs(available - data.quantity) > 1e-9) {
    await tx.inventoryBatch.update({
      where: { id: batch.id },
      data: {
        remainingQuantity: available,
        status: available > 1e-9 ? "OPEN" : "CLOSED",
      },
    });
  }

  return batch;
}

export async function consumeFifoStock(tx: DbLike, data: {
  stockOutId: string;
  ingredientId: string;
  quantity: number;
}) {
  let need = data.quantity;
  let totalCost = 0;

  const batches = await tx.inventoryBatch.findMany({
    where: {
      ingredientId: data.ingredientId,
      remainingQuantity: { gt: 0 },
    },
    orderBy: [
      { receivedAt: "asc" },
      { createdAt: "asc" },
      { id: "asc" },
    ],
  });

  for (const batch of batches) {
    if (need <= 1e-9) break;

    const take = Math.min(batch.remainingQuantity, need);
    const total = take * batch.unitCost;
    totalCost += total;

    await tx.stockOutBatch.create({
      data: {
        stockOutId: data.stockOutId,
        batchId: batch.id,
        quantity: take,
        unitCost: batch.unitCost,
        totalCost: total,
      },
    });

    const nextRemaining = batch.remainingQuantity - take;
    await tx.inventoryBatch.update({
      where: { id: batch.id },
      data: {
        remainingQuantity: { decrement: take },
        status: nextRemaining <= 1e-9 ? "CLOSED" : "OPEN",
      },
    });

    need -= take;
  }

  if (need > 1e-9) {
    const ingredient = await tx.ingredient.findUnique({ where: { id: data.ingredientId } });
    const fallbackCost = ingredient?.costPerBaseUnit || ingredient?.purchasePrice || 0;
    const negativeBatch = await tx.inventoryBatch.create({
      data: {
        ingredientId: data.ingredientId,
        batchCode: "NEGATIVE",
        receivedAt: new Date(),
        quantityIn: 0,
        remainingQuantity: -need,
        unitCost: fallbackCost,
        status: "NEGATIVE",
      },
    });

    const total = need * fallbackCost;
    totalCost += total;
    await tx.stockOutBatch.create({
      data: {
        stockOutId: data.stockOutId,
        batchId: negativeBatch.id,
        negativeBatchId: negativeBatch.id,
        quantity: need,
        unitCost: fallbackCost,
        totalCost: total,
      },
    });
  }

  await tx.stockOut.update({
    where: { id: data.stockOutId },
    data: { totalCost },
  });

  return { totalCost };
}

export async function getInventoryBatches() {
  return db.inventoryBatch.findMany({
    include: {
      ingredient: { select: { name: true, baseUnit: true } },
      stockInItem: { include: { stockIn: { select: { code: true, supplier: true, createdAt: true } } } },
    },
    orderBy: [
      { ingredient: { name: "asc" } },
      { remainingQuantity: "desc" },
      { receivedAt: "asc" },
    ],
  });
}
