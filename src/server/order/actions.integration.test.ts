import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { db } from "@/lib/db";
import { autoDeductStockForOrder } from "@/server/recipe/actions";
import { createPrintJob } from "@/server/reports/print-actions";
import {
  addItem,
  cancelItem,
  checkoutOrder,
  getCategoriesWithProducts,
  getAreasWithTables,
  getOrder,
  openTable,
  removeItem,
  sendOrder,
  splitItemsEvenly,
  updateItemQuantity,
} from "./actions";

// End-to-end coverage of the `order` module against a real Postgres database.
// Mirrors the POS sales lifecycle: open table -> add items -> send to kitchen ->
// checkout (payment + cash flow). Asserts persisted DB state, not just return
// values, so the server actions are validated as an integrated unit.
//
// Requires a seeded DB (DATABASE_URL). See vitest.integration.config.ts header.

// Dedicated area/tables created here so we never collide with seeded data or
// other tests, and cleanup is a simple "delete everything under this area".
const AREA_ID = "area-integration-test";
const TABLE_A_ID = "t-integration-A";
const TABLE_B_ID = "t-integration-B";

// Seeded products with known, stable tax setup (see prisma/seed.ts).
let icedTeaId: string; // price 5000, VAT 8%, no excise
let localBeerId: string; // price 20000, VAT 10%, excise 65%
let adminUserId: string;

async function cleanupOrders() {
  const orders = await db.order.findMany({
    where: { tableId: { in: [TABLE_A_ID, TABLE_B_ID] } },
    select: { id: true },
  });
  const orderIds = orders.map((o) => o.id);
  if (orderIds.length === 0) return;

  await db.payment.deleteMany({ where: { orderId: { in: orderIds } } });
  await db.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
  // cashFlow.referenceId stores the order id (no FK), clean it too.
  await db.cashFlow.deleteMany({ where: { referenceId: { in: orderIds } } });
  await db.order.deleteMany({ where: { id: { in: orderIds } } });
}

beforeAll(async () => {
  const icedTea = await db.product.findUniqueOrThrow({ where: { slug: "iced-tea" } });
  const localBeer = await db.product.findUniqueOrThrow({ where: { slug: "local-beer" } });
  const admin = await db.user.findUniqueOrThrow({ where: { username: "admin" } });
  icedTeaId = icedTea.id;
  localBeerId = localBeer.id;
  adminUserId = admin.id;

  await db.area.upsert({
    where: { id: AREA_ID },
    update: { type: "RESTAURANT" },
    create: { id: AREA_ID, name: "Integration Test Area", type: "RESTAURANT", sortOrder: 999 },
  });
  await db.table.upsert({
    where: { id: TABLE_A_ID },
    update: {},
    create: { id: TABLE_A_ID, name: "INT-A", areaId: AREA_ID, capacity: 4 },
  });
  await db.table.upsert({
    where: { id: TABLE_B_ID },
    update: {},
    create: { id: TABLE_B_ID, name: "INT-B", areaId: AREA_ID, capacity: 4 },
  });
});

afterEach(async () => {
  await cleanupOrders();
});

afterAll(async () => {
  await cleanupOrders();
  await db.table.deleteMany({ where: { id: { in: [TABLE_A_ID, TABLE_B_ID] } } });
  await db.area.deleteMany({ where: { id: AREA_ID } });
  await db.$disconnect();
});

describe("order module (integration, real Postgres)", () => {
  it("loads the order menu from seeded categories/products", async () => {
    const categories = await getCategoriesWithProducts();
    const products = categories.flatMap((c) => c.products);
    expect(products.some((p) => p.id === icedTeaId)).toBe(true);
    // Only available products are offered for ordering.
    expect(products.every((p) => p.isAvailable)).toBe(true);
  });

  it("exposes the test area/table in the floor view", async () => {
    const areas = await getAreasWithTables();
    const area = areas.find((a) => a.id === AREA_ID);
    expect(area).toBeDefined();
    expect(area!.tables.some((t) => t.id === TABLE_A_ID)).toBe(true);
  });

  it("opens a table, creating one OPEN order with a sequential number", async () => {
    const order = await openTable(TABLE_A_ID, 3);
    expect(order.status).toBe("OPEN");
    expect(order.guestCount).toBe(3);
    expect(order.orderNumber).toBeGreaterThan(0);

    const persisted = await db.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(persisted.tableId).toBe(TABLE_A_ID);
    expect(persisted.totalAmount).toBe(0);
  });

  it("is idempotent: re-opening a busy table returns the same order", async () => {
    const first = await openTable(TABLE_A_ID, 2);
    const second = await openTable(TABLE_A_ID, 2);
    expect(second.id).toBe(first.id);

    const openCount = await db.order.count({
      where: { tableId: TABLE_A_ID, status: { in: ["OPEN", "SENT"] } },
    });
    expect(openCount).toBe(1);
  });

  it("adds an item and recomputes subtotal, VAT and total from tax rates", async () => {
    const order = await openTable(TABLE_A_ID, 1);
    await addItem(order.id, icedTeaId, 2); // 5000 x 2, VAT 8%, no excise

    const updated = await db.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(updated.subtotal).toBe(10000);
    expect(updated.vatAmount).toBeCloseTo(800, 5);
    expect(updated.exciseTaxAmount).toBe(0);
    // total is the documented invariant: subtotal + taxes - discount + service.
    expect(updated.totalAmount).toBeCloseTo(
      updated.subtotal + updated.vatAmount + updated.exciseTaxAmount - updated.discountAmount + updated.serviceCharge,
      5,
    );
  });

  it("accumulates excise tax for excisable products (beer)", async () => {
    const order = await openTable(TABLE_A_ID, 1);
    await addItem(order.id, localBeerId, 1); // 20000, VAT 10%, excise 65%

    const updated = await db.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(updated.subtotal).toBe(20000);
    expect(updated.vatAmount).toBeCloseTo(2000, 5);
    expect(updated.exciseTaxAmount).toBeCloseTo(13000, 5);
  });

  it("updates quantity and recomputes totals", async () => {
    const order = await openTable(TABLE_A_ID, 1);
    const item = await addItem(order.id, icedTeaId, 1);
    await updateItemQuantity(item.id, 5);

    const updated = await db.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(updated.subtotal).toBe(25000);
  });

  it("removes an item and drops it from the order total", async () => {
    const order = await openTable(TABLE_A_ID, 1);
    const a = await addItem(order.id, icedTeaId, 2);
    await addItem(order.id, localBeerId, 1);
    await removeItem(a.id);

    const remaining = await db.orderItem.findMany({ where: { orderId: order.id } });
    expect(remaining.map((i) => i.id)).not.toContain(a.id);

    const updated = await db.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(updated.subtotal).toBe(20000); // only the beer remains
  });

  it("cancels an item without deleting it and excludes it from totals", async () => {
    const order = await openTable(TABLE_A_ID, 1);
    const item = await addItem(order.id, icedTeaId, 2);
    await cancelItem(item.id, adminUserId, "customer changed mind");

    const cancelled = await db.orderItem.findUniqueOrThrow({ where: { id: item.id } });
    expect(cancelled.status).toBe("CANCELLED");
    expect(cancelled.cancelledBy).toBe(adminUserId);

    const updated = await db.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(updated.subtotal).toBe(0); // cancelled items are not billed
  });

  it("sends the order to the kitchen, flipping order and item status to SENT", async () => {
    const order = await openTable(TABLE_A_ID, 1);
    await addItem(order.id, icedTeaId, 1);
    await sendOrder(order.id, AREA_ID);

    const sent = await db.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { items: true },
    });
    expect(sent.status).toBe("SENT");
    expect(sent.items.every((i) => i.status === "SENT")).toBe(true);
    expect(createPrintJob).toHaveBeenCalled();
  });

  it("getOrder returns the fully hydrated order graph", async () => {
    const order = await openTable(TABLE_A_ID, 2);
    await addItem(order.id, icedTeaId, 1);

    const full = await getOrder(order.id);
    expect(full).not.toBeNull();
    expect(full!.table.area.id).toBe(AREA_ID);
    expect(full!.items).toHaveLength(1);
    expect(full!.items[0].product.id).toBe(icedTeaId);
  });

  it("checks out a NORMAL order: records payment, marks PAID and posts cash flow income", async () => {
    const order = await openTable(TABLE_A_ID, 2);
    await addItem(order.id, icedTeaId, 2);
    await sendOrder(order.id, AREA_ID);

    const beforeCheckout = await db.order.findUniqueOrThrow({ where: { id: order.id } });
    const total = beforeCheckout.totalAmount;

    await checkoutOrder(order.id, [{ method: "CASH", amount: total }], adminUserId);

    const paid = await db.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { payments: true },
    });
    expect(paid.status).toBe("PAID");
    expect(paid.closedAt).not.toBeNull();
    expect(paid.userId).toBe(adminUserId);
    expect(paid.payments).toHaveLength(1);
    expect(paid.payments[0].method).toBe("CASH");
    expect(paid.payments[0].amount).toBeCloseTo(total, 5);
    expect(paid.payments[0].status).toBe("COMPLETED");

    const income = await db.cashFlow.findFirst({ where: { referenceId: order.id } });
    expect(income).not.toBeNull();
    expect(income!.type).toBe("INCOME");
    expect(income!.categoryId).toBe("inc-sales");
    expect(income!.amount).toBeCloseTo(total, 5);

    // Inventory module is enabled in the seed -> stock deduction is invoked
    // (mocked here, but the order module correctly delegates to it).
    expect(autoDeductStockForOrder).toHaveBeenCalledWith(order.id);
  });

  it("does NOT post cash flow income for a COMP (complimentary) order", async () => {
    const order = await openTable(TABLE_A_ID, 1, "COMP");
    expect(order.type).toBe("COMP");
    await addItem(order.id, icedTeaId, 1);

    await checkoutOrder(order.id, [{ method: "COMP", amount: 0 }], adminUserId);

    const paid = await db.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(paid.status).toBe("PAID");

    const income = await db.cashFlow.findFirst({ where: { referenceId: order.id } });
    expect(income).toBeNull();
  });

  it("splits items evenly onto a free table in the same area", async () => {
    const order = await openTable(TABLE_A_ID, 4);
    await addItem(order.id, icedTeaId, 4); // qty 4 -> 2 stay, 2 move

    const newOrder = await splitItemsEvenly(order.id, await firstItemIds(order.id));

    expect(newOrder.tableId).toBe(TABLE_B_ID);
    expect(newOrder.parentOrderId).toBe(order.id);

    const original = await db.order.findUniqueOrThrow({ where: { id: order.id } });
    const split = await db.order.findUniqueOrThrow({ where: { id: newOrder.id } });
    // 2 servings each at 5000 -> subtotal 10000 on both sides.
    expect(original.subtotal).toBe(10000);
    expect(split.subtotal).toBe(10000);
  });
});

async function firstItemIds(orderId: string): Promise<string[]> {
  const items = await db.orderItem.findMany({ where: { orderId }, select: { id: true } });
  return items.map((i) => i.id);
}
