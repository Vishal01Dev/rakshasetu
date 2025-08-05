-- CreateEnum
CREATE TYPE "public"."FEE_TYPE" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateTable
CREATE TABLE "public"."PlatformSetting" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "feeType" "public"."FEE_TYPE" NOT NULL DEFAULT 'PERCENTAGE',
    "feeValue" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("id")
);
