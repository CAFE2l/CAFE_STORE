ALTER TABLE "Category"
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

DO $$ BEGIN
  CREATE TYPE "FeedbackStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "FeedbackPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "FeedbackSource" AS ENUM ('site', 'produto', 'pedido', 'suporte', 'outro');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE feedbacks
  ADD COLUMN IF NOT EXISTS user_id TEXT,
  ADD COLUMN IF NOT EXISTS phone VARCHAR(40),
  ADD COLUMN IF NOT EXISTS status "FeedbackStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS priority "FeedbackPriority" NOT NULL DEFAULT 'NORMAL',
  ADD COLUMN IF NOT EXISTS source "FeedbackSource" NOT NULL DEFAULT 'site',
  ADD COLUMN IF NOT EXISTS product_id TEXT,
  ADD COLUMN IF NOT EXISTS order_id TEXT;

UPDATE feedbacks
SET status = CASE WHEN is_approved = true THEN 'APPROVED'::"FeedbackStatus" ELSE status END;

DO $$ BEGIN
  ALTER TABLE feedbacks
    ADD CONSTRAINT feedbacks_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE feedbacks
    ADD CONSTRAINT feedbacks_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES "Product"(id) ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE feedbacks
    ADD CONSTRAINT feedbacks_order_id_fkey
    FOREIGN KEY (order_id) REFERENCES "Order"(id) ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_feedbacks_status_priority ON feedbacks(status, priority);
CREATE INDEX IF NOT EXISTS idx_feedbacks_user ON feedbacks(user_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_product ON feedbacks(product_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_order ON feedbacks(order_id);
