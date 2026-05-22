-- FIFO inventory: batch/layer valuation and stock-out allocation

ALTER TABLE "StockOut" ADD COLUMN "totalCost" REAL NOT NULL DEFAULT 0;

CREATE TABLE "InventoryBatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ingredientId" TEXT NOT NULL,
    "stockInItemId" TEXT,
    "batchCode" TEXT,
    "receivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" DATETIME,
    "quantityIn" REAL NOT NULL,
    "remainingQuantity" REAL NOT NULL,
    "unitCost" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryBatch_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventoryBatch_stockInItemId_fkey" FOREIGN KEY ("stockInItemId") REFERENCES "StockInIngredient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "StockOutBatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stockOutId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unitCost" REAL NOT NULL,
    "totalCost" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockOutBatch_stockOutId_fkey" FOREIGN KEY ("stockOutId") REFERENCES "StockOut" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StockOutBatch_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "InventoryBatch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "InventoryBatch_stockInItemId_key" ON "InventoryBatch"("stockInItemId");
CREATE INDEX "InventoryBatch_ingredientId_remainingQuantity_receivedAt_idx" ON "InventoryBatch"("ingredientId", "remainingQuantity", "receivedAt");
CREATE INDEX "StockOutBatch_stockOutId_idx" ON "StockOutBatch"("stockOutId");
CREATE INDEX "StockOutBatch_batchId_idx" ON "StockOutBatch"("batchId");

-- Existing production data starts FIFO from current balance.
INSERT INTO "InventoryBatch" (
    "id", "ingredientId", "batchCode", "receivedAt", "quantityIn", "remainingQuantity", "unitCost", "status", "createdAt", "updatedAt"
)
SELECT
    'opening_' || "id",
    "id",
    'OPENING',
    "createdAt",
    "currentStock",
    "currentStock",
    COALESCE(NULLIF("costPerBaseUnit", 0), "purchasePrice", 0),
    CASE WHEN "currentStock" > 0 THEN 'OPEN' ELSE 'CLOSED' END,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Ingredient"
WHERE "currentStock" > 0;
