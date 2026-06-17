import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { exerciseUi } from "@/test/interact";
import { AreasManager } from "./components-areas";

const noop = vi.fn(async () => ({ success: true }));

function AM() {
  return (
    <AreasManager
      areas={[]}
      createArea={noop}
      updateArea={noop}
      deleteArea={noop}
      createTable={noop}
      updateTable={noop}
      deleteTable={noop}
    />
  );
}

describe("AreasManager", () => {
  it("renders with no areas", () => {
    const { container } = renderWithProviders(<AM />);
    expect(container.firstChild).toBeTruthy();
  });

  it("exercises dialogs", async () => {
    renderWithProviders(<AM />);
    await exerciseUi();
  });
});
