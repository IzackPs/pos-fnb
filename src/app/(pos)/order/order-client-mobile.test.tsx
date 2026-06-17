import { describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen, userEvent } from "@/test/render";
import { exerciseUi } from "@/test/interact";

const orderDetail = {
  id: "o1", type: "NORMAL", status: "OPEN",
  subtotal: 100000, vatAmount: 8000, exciseTaxAmount: 0, serviceCharge: 5000, discountAmount: 1000, totalAmount: 112000,
  items: [
    { id: "i1", status: "PENDING", quantity: 2, unitPrice: 25000, product: { name: "Coffee", slug: "coffee" }, toppings: [] },
  ],
};

vi.mock("@/server/order/actions", () => ({
  openTable: vi.fn(async () => ({ id: "o1" })),
  getOrder: vi.fn(async () => orderDetail),
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
}));

// Force the mobile layout branch.
vi.mock("@/components/shared/device-provider", () => ({
  DeviceProvider: ({ children }: { children: React.ReactNode }) => children,
  useDeviceInfo: () => ({ isMobile: true, isTablet: false, isDesktop: false }),
}));

import { OrderClient } from "./order-client";

const area = {
  id: "area-1", name: "Main", type: "RESTAURANT",
  tables: [{ id: "t1", name: "T1", capacity: 4, isKaraoke: false, orders: [] }],
};

const categories = [
  {
    id: "c1", name: "Drinks",
    products: [
      // Product with a topping group → opens the topping selection dialog.
      {
        id: "p1", name: "Coffee", price: 25000, unit: { name: "cup" },
        toppingGroups: [
          { toppingGroup: { id: "tg1", name: "Extras", type: "MULTIPLE", toppings: [{ id: "tp1", name: "Milk", price: 2000 }] } },
        ],
      },
    ],
  },
];

describe("OrderClient (mobile)", () => {
  it("opens an order on mobile and exercises the mobile views", async () => {
    const user = userEvent.setup();
    renderWithProviders(<OrderClient areas={[area] as never} categories={categories as never} />);

    await user.click(screen.getByText("T1"));
    expect(await screen.findByText("Coffee")).toBeTruthy();

    await exerciseUi(2);
  });
});
