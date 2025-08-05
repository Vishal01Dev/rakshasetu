/*
  Warnings:

  - You are about to drop the column `releasedAt` on the `EscrowTransaction` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `DisputeTicket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."DisputeTicket" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "refundedAmount" DOUBLE PRECISION,
ADD COLUMN     "resolvedByAdminId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."EscrowTransaction" DROP COLUMN "releasedAt",
ADD COLUMN     "refundNotes" TEXT,
ADD COLUMN     "refundRazorpayId" TEXT,
ADD COLUMN     "refundReason" TEXT,
ADD COLUMN     "refundedAmount" DOUBLE PRECISION,
ADD COLUMN     "refundedByAdminId" TEXT,
ADD COLUMN     "releaseApprovedAt" TIMESTAMP(3),
ADD COLUMN     "releaseApprovedByAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "releaseApprovedByAdminId" TEXT,
ADD COLUMN     "releaseNotes" TEXT,
ADD COLUMN     "releaseRequested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "releaseRequestedAt" TIMESTAMP(3),
ADD COLUMN     "releaseRequestedByUserId" TEXT;
