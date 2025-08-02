-- CreateEnum
CREATE TYPE "LISTING_TYPE" AS ENUM ('PRODUCT', 'SERVICE');

-- CreateEnum
CREATE TYPE "LISTING_STATUS" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateTable
CREATE TABLE "listing" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "type" "LISTING_TYPE" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subCategory" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "status" "LISTING_STATUS" NOT NULL DEFAULT 'ACTIVE',
    "tags" TEXT[],
    "metadata" JSONB,
    "media" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listing_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "listing" ADD CONSTRAINT "listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
