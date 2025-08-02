/*
  Warnings:

  - You are about to drop the column `orderUid` on the `Order` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Order_orderUid_idx";

-- DropIndex
DROP INDEX "public"."Order_orderUid_key";

-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "orderUid";
