-- AlterTable
ALTER TABLE "Review" ADD COLUMN "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "video_url" TEXT;

-- AlterTable
ALTER TABLE "feedbacks" ADD COLUMN "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
