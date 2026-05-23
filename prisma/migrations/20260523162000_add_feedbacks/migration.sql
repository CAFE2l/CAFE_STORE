CREATE TYPE "FeedbackService" AS ENUM ('landing_page', 'site', 'saas', 'pacote_completo', 'outro');

CREATE TABLE "feedbacks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "author_name" VARCHAR(100) NOT NULL,
  "author_email" VARCHAR(255) NOT NULL,
  "author_avatar_url" TEXT,
  "author_company" VARCHAR(100),
  "author_role" VARCHAR(100),
  "author_linkedin_url" TEXT,
  "service_type" "FeedbackService" NOT NULL,
  "rating" INTEGER NOT NULL,
  "title" VARCHAR(150) NOT NULL,
  "body" TEXT NOT NULL,
  "result_metric" VARCHAR(200),
  "project_url" TEXT,
  "video_url" TEXT,
  "is_verified" BOOLEAN NOT NULL DEFAULT false,
  "is_featured" BOOLEAN NOT NULL DEFAULT false,
  "is_approved" BOOLEAN NOT NULL DEFAULT false,
  "helpful_count" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "feedbacks_rating_check" CHECK ("rating" BETWEEN 1 AND 5)
);

CREATE TABLE "feedback_helpful" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "feedback_id" UUID NOT NULL,
  "fingerprint" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "feedback_helpful_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "feedback_helpful_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "feedbacks"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "feedback_helpful_feedback_id_fingerprint_key" ON "feedback_helpful"("feedback_id", "fingerprint");
CREATE INDEX "idx_feedbacks_approved" ON "feedbacks"("is_approved", "created_at" DESC);
CREATE INDEX "idx_feedbacks_service" ON "feedbacks"("service_type");
CREATE INDEX "idx_feedbacks_featured" ON "feedbacks"("is_featured") WHERE "is_featured" = true;
