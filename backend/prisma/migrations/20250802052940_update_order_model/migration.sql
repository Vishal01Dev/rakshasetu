/*
  Warnings:

  - You are about to drop the column `meta` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "meta";

-- CreateIndex
CREATE INDEX "Order_orderUid_idx" ON "public"."Order"("orderUid");
