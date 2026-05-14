/*
  Warnings:

  - You are about to drop the column `status` on the `Table` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" INTEGER NOT NULL,
    "orderNumberSuffix" TEXT,
    "tableId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "type" TEXT NOT NULL DEFAULT 'NORMAL',
    "guestCount" INTEGER NOT NULL DEFAULT 1,
    "note" TEXT,
    "parentOrderId" TEXT,
    "mergedFrom" TEXT,
    "splitFrom" TEXT,
    "openedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" DATETIME,
    "karaokeStart" DATETIME,
    "karaokeEnd" DATETIME,
    "karaokeTotal" REAL NOT NULL DEFAULT 0,
    "subtotal" REAL NOT NULL DEFAULT 0,
    "vatAmount" REAL NOT NULL DEFAULT 0,
    "exciseTaxAmount" REAL NOT NULL DEFAULT 0,
    "discountAmount" REAL NOT NULL DEFAULT 0,
    "serviceCharge" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("closedAt", "createdAt", "discountAmount", "exciseTaxAmount", "guestCount", "id", "karaokeEnd", "karaokeStart", "karaokeTotal", "mergedFrom", "note", "openedAt", "orderNumber", "parentOrderId", "serviceCharge", "status", "subtotal", "tableId", "totalAmount", "updatedAt", "userId", "vatAmount") SELECT "closedAt", "createdAt", "discountAmount", "exciseTaxAmount", "guestCount", "id", "karaokeEnd", "karaokeStart", "karaokeTotal", "mergedFrom", "note", "openedAt", "orderNumber", "parentOrderId", "serviceCharge", "status", "subtotal", "tableId", "totalAmount", "updatedAt", "userId", "vatAmount" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE TABLE "new_Table" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 4,
    "positionX" INTEGER NOT NULL DEFAULT 0,
    "positionY" INTEGER NOT NULL DEFAULT 0,
    "isKaraoke" BOOLEAN NOT NULL DEFAULT false,
    "karaokePricingId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Table_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Table_karaokePricingId_fkey" FOREIGN KEY ("karaokePricingId") REFERENCES "KaraokePricing" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Table" ("areaId", "capacity", "createdAt", "id", "isKaraoke", "karaokePricingId", "name", "positionX", "positionY") SELECT "areaId", "capacity", "createdAt", "id", "isKaraoke", "karaokePricingId", "name", "positionX", "positionY" FROM "Table";
DROP TABLE "Table";
ALTER TABLE "new_Table" RENAME TO "Table";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
