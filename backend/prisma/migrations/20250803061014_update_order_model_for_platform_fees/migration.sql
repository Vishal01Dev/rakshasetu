/*
  Warnings:

  - Added the required column `platformFeeAmount` to the `EscrowTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platformFeePaidBy` to the `EscrowTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerReceives` to the `EscrowTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalBuyerAmount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platformFeeAmount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platformFeePaidBy` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerReceives` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PLATFORM_FEE_PAYER" AS ENUM ('BUYER', 'SELLER', 'BOTH');

-- AlterTable
ALTER TABLE "public"."EscrowTransaction" ADD COLUMN     "platformFeeAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "platformFeePaidBy" "public"."PLATFORM_FEE_PAYER" NOT NULL,
ADD COLUMN     "sellerReceives" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "finalBuyerAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "platformFeeAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "platformFeePaidBy" "public"."PLATFORM_FEE_PAYER" NOT NULL,
ADD COLUMN     "sellerReceives" DOUBLE PRECISION NOT NULL;
