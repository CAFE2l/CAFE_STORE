-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "BriefingStatus" AS ENUM ('PENDING', 'CONTACTED', 'IN_NEGOTIATION', 'APPROVED', 'REJECTED', 'ARCHIVED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable project_briefings
CREATE TABLE IF NOT EXISTS "project_briefings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "company_name" TEXT,
    "service_slug" TEXT NOT NULL,
    "service_name" TEXT NOT NULL,
    "budget" TEXT,
    "deadline" TEXT,
    "project_description" TEXT NOT NULL,
    "main_goal" TEXT,
    "target_audience" TEXT,
    "references" TEXT,
    "desired_features" JSONB NOT NULL DEFAULT '[]',
    "has_domain" BOOLEAN,
    "has_hosting" BOOLEAN,
    "has_branding" BOOLEAN,
    "preferred_contact" TEXT,
    "extra_notes" TEXT,
    "landing_page_goal" TEXT,
    "landing_page_product" TEXT,
    "landing_page_needs_form" BOOLEAN,
    "landing_page_needs_whatsapp" BOOLEAN,
    "landing_page_needs_lead_capture" BOOLEAN,
    "landing_page_needs_email_marketing" BOOLEAN,
    "site_pages_count" INTEGER,
    "site_pages_list" JSONB,
    "site_needs_admin" BOOLEAN,
    "site_needs_blog" BOOLEAN,
    "site_needs_seo" BOOLEAN,
    "app_needs_login" BOOLEAN,
    "app_needs_admin" BOOLEAN,
    "app_needs_database" BOOLEAN,
    "app_needs_api" BOOLEAN,
    "app_needs_payments" BOOLEAN,
    "app_user_types_count" INTEGER,
    "app_main_features" TEXT,
    "status" "BriefingStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "project_briefings_pkey" PRIMARY KEY ("id")
);
