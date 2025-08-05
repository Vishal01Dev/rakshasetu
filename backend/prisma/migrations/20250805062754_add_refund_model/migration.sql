/*
  Warnings:

  - You are about to drop the column `refundNotes` on the `EscrowTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `refundRazorpayId` on the `EscrowTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `refundReason` on the `EscrowTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `refundedAmount` on the `EscrowTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `refundedAt` on the `EscrowTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `refundedByAdminId` on the `EscrowTransaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."EscrowTransaction" DROP COLUMN "refundNotes",
DROP COLUMN "refundRazorpayId",
DROP COLUMN "refundReason",
DROP COLUMN "refundedAmount",
DROP COLUMN "refundedAt",
DROP COLUMN "refundedByAdminId";

-- CreateTable
CREATE TABLE "public"."Refund" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "refundedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refundedByAdminId" TEXT NOT NULL,
    "razorpayRefundId" TEXT,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Refund" ADD CONSTRAINT "Refund_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."EscrowTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
