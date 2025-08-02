/*
  Warnings:

  - A unique constraint covering the columns `[orderUid]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderUid` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ORDER_TYPE" AS ENUM ('CUSTOM', 'PRODUCT', 'SERVICE');

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "orderUid" TEXT NOT NULL,
ADD COLUMN     "type" "public"."ORDER_TYPE" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderUid_key" ON "public"."Order"("orderUid");
