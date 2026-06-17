import { describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen, userEvent } from "@/test/render";

// Keep every report query pending so the components render their loading
// state without needing full data shapes. Factory is hoisted, so the pending
// helper must be defined inline.
vi.mock("@/server/reports/actions", () => {
  const pending = () => new Promise(() => {});
  return {
    getInvoiceReport: vi.fn(pending),
    getSoldItemsReport: vi.fn(pending),
    getRevenueReport: vi.fn(pending),
    getIngredientReport: vi.fn(pending),
    getWarehouseReport: vi.fn(pending),
  };
});
vi.mock("@/server/inventory/actions", () => {
  const pending = () => new Promise(() => {});
  return {
    getDailyReport: vi.fn(pending),
    getTopProducts: vi.fn(pending),
  };
});

import { ReportsClient, ReportsClientWrapper } from "./reports-client";

describe("ReportsClient", () => {
  it("renders the overview tab and wrapper", () => {
    const { container } = renderWithProviders(<ReportsClientWrapper today="2026-01-01" />);
    expect(container.firstChild).toBeTruthy();
  });

  it("switches across report tabs firing each loader", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReportsClient today="2026-01-01" />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBeGreaterThan(1);
    for (const tab of tabs) {
      await user.click(tab);
    }
    expect(tabs.length).toBe(6);
  });
});
