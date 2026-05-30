-- Add nullable SKU for products. PostgreSQL allows multiple NULL values in a unique column.
ALTER TABLE "Product" ADD COLUMN "sku" TEXT;

CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
