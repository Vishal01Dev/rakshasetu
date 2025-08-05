-- CreateEnum
CREATE TYPE "public"."REFUND_STATUS" AS ENUM ('NONE', 'PARTIALLY_REFUNDED', 'FULLY_REFUNDED');

-- AlterTable
ALTER TABLE "public"."EscrowTransaction" ADD COLUMN     "refundStatus" "public"."REFUND_STATUS" NOT NULL DEFAULT 'NONE';
