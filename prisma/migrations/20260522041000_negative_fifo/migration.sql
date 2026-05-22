-- Allow negative FIFO stock-outs and later stock-in reconciliation.

ALTER TABLE "StockOutBatch" ADD COLUMN "negativeBatchId" TEXT;

CREATE INDEX "StockOutBatch_negativeBatchId_idx" ON "StockOutBatch"("negativeBatchId");
