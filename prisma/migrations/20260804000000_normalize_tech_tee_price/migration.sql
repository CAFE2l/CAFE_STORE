-- Keep the persisted catalogue aligned with the public support price.  The
-- cart API also rehydrates old cart snapshots from this canonical value.
UPDATE "Product"
SET
  "price" = 12.90,
  "oldPrice" = 24.90
WHERE "slug" = 'tech-tee-dry-pro-cafe-store';
