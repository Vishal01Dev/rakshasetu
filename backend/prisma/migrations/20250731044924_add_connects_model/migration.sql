-- CreateEnum
CREATE TYPE "public"."CONNECT_STATUS" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."connects" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT,
    "sellerId" TEXT NOT NULL,
    "status" "public"."CONNECT_STATUS" NOT NULL DEFAULT 'PENDING',
    "message" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connects_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."connects" ADD CONSTRAINT "connects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."connects" ADD CONSTRAINT "connects_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."connects" ADD CONSTRAINT "connects_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
