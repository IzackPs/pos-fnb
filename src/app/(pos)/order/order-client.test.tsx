import { describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen, userEvent } from "@/test/render";
import { exerciseUi } from "@/test/interact";

const orderDetail = {
  id: "o1",
  type: "NORMAL",
  status: "OPEN",
  subtotal: 100000,
  vatAmount: 8000,
  exciseTaxAmount: 0,
  serviceCharge: 5000,
  discountAmount: 1000,
  totalAmount: 112000,
  items: [
    { id: "i1", status: "PENDING", quantity: 2, unitPrice: 25000, product: { name: "Coffee", slug: "coffee" }, toppings: [] },
    { id: "i2", status: "SENT", quantity: 1, unitPrice: 50000, product: { name: "Tea", slug: "tea" }, toppings: [{ topping: { name: "Sugar" } }] },
  ],
};

vi.mock("@/server/order/actions", () => {
  const okOrder = () => Promise.resolve({ id: "o1" });
  const detail = () => Promise.resolve(orderDetail);
  return {
    openTable: vi.fn(okOrder),
    getOrder: vi.fn(detail),
    addItem: vi.fn(async () => ({})),
    updateItemQuantity: vi.fn(async () => ({})),
    removeItem: vi.fn(async () => ({})),
    cancelItem: vi.fn(async () => ({})),
    sendOrder: vi.fn(async () => ({})),
    mergeTables: vi.fn(async () => ({})),
    splitItemsEvenly: vi.fn(async () => ({})),
    printTempBill: vi.fn(async () => ({ content: "x" })),
    checkoutOrder: vi.fn(async () => ({})),
    updateOrderGuest: vi.fn(async () => ({})),
    refreshKaraokeTime: vi.fn(async () => ({})),
  };
});

import { OrderClient, TableGridView } from "./order-client";

const area = {
  id: "area-1",
  name: "Main",
  type: "RESTAURANT",
  tables: [
    { id: "t1", name: "T1", capacity: 4, isKaraoke: false, orders: [] },
    { id: "t2", name: "T2", capacity: 2, isKaraoke: false, orders: [{ id: "o1", status: "OPEN", orderNumber: 1, type: "NORMAL", openedAt: new Date(), guestCount: 2, totalAmount: 50000 }] },
  ],
};

const categories = [
  {
    id: "c1",
    name: "Drinks",
    products: [
      { id: "p1", name: "Coffee", price: 25000, unit: { name: "cup" }, toppingGroups: [] },
    ],
  },
];

describe("OrderClient", () => {
  it("renders the table grid empty", () => {
    const { container } = renderWithProviders(<OrderClient areas={[]} categories={[]} />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders free and occupied tables", () => {
    const { container } = renderWithProviders(<OrderClient areas={[area] as never} categories={categories as never} />);
    expect(container.textContent).toContain("T1");
    expect(container.textContent).toContain("T2");
  });

  it("opens a table and renders the order panel, then exercises actions", async () => {
    const user = userEvent.setup();
    renderWithProviders(<OrderClient areas={[area] as never} categories={categories as never} />);

    // Click the first free table to open an order.
    const t1 = screen.getByText("T1");
    await user.click(t1);

    // Order panel renders the ordered items once getOrder resolves.
    // "Tea" only appears in the order panel (not the product catalog).
    expect(await screen.findByText("Tea")).toBeTruthy();

    await exerciseUi(2);
  });

  it("TableGridView renders standalone", () => {
    const { container } = renderWithProviders(
      <TableGridView
        areas={[area] as never}
        activeAreaId="area-1"
        setActiveAreaId={() => {}}
        onOpenTable={() => {}}
        onSelectOrder={() => {}}
        onMergeTables={async () => {}}
        onSplitTable={() => {}}
      />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
