-- CreateEnum
CREATE TYPE "public"."RELEASE_STATUS" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."EscrowTransaction" ADD COLUMN     "releaseStatus" "public"."RELEASE_STATUS" NOT NULL DEFAULT 'PENDING';
