/*
  Warnings:

  - You are about to drop the `listing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."connects" DROP CONSTRAINT "connects_listingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."listing" DROP CONSTRAINT "listing_sellerId_fkey";

-- DropTable
DROP TABLE "public"."listing";

-- CreateTable
CREATE TABLE "public"."listings" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "type" "public"."LISTING_TYPE" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subCategory" TEXT,
    "price" TEXT NOT NULL,
    "status" "public"."LISTING_STATUS" NOT NULL DEFAULT 'ACTIVE',
    "tags" TEXT[],
    "metadata" JSONB,
    "media" JSONB,
    "externalLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT,
    "sellerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "media" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "listings_sellerId_idx" ON "public"."listings"("sellerId");

-- CreateIndex
CREATE INDEX "listings_status_idx" ON "public"."listings"("status");

-- CreateIndex
CREATE INDEX "listings_type_idx" ON "public"."listings"("type");

-- CreateIndex
CREATE INDEX "conversations_userId_idx" ON "public"."conversations"("userId");

-- CreateIndex
CREATE INDEX "conversations_sellerId_idx" ON "public"."conversations"("sellerId");

-- CreateIndex
CREATE INDEX "conversations_listingId_idx" ON "public"."conversations"("listingId");

-- CreateIndex
CREATE INDEX "messages_conversationId_idx" ON "public"."messages"("conversationId");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "public"."messages"("senderId");

-- CreateIndex
CREATE INDEX "connects_userId_idx" ON "public"."connects"("userId");

-- CreateIndex
CREATE INDEX "connects_sellerId_idx" ON "public"."connects"("sellerId");

-- CreateIndex
CREATE INDEX "connects_listingId_idx" ON "public"."connects"("listingId");

-- AddForeignKey
ALTER TABLE "public"."listings" ADD CONSTRAINT "listings_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."connects" ADD CONSTRAINT "connects_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
