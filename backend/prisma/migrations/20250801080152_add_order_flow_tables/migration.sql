-- CreateEnum
CREATE TYPE "public"."ORDER_SOURCE" AS ENUM ('B2B', 'D2C');

-- CreateEnum
CREATE TYPE "public"."PAYMENT_METHOD" AS ENUM ('PREPAID', 'PAY_ON_DELIVERY');

-- CreateEnum
CREATE TYPE "public"."PAYMENT_STATUS" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ORDER_STATUS" AS ENUM ('CREATED', 'PAID', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."DELIVERY_STATUS" AS ENUM ('PENDING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."DISPUTE_TYPE" AS ENUM ('DELIVERY_FAILURE', 'ITEM_ISSUE', 'REFUND_REQUEST', 'FRAUD', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."TICKET_STATUS" AS ENUM ('OPEN', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."PAYMENT_GATEWAY_METHOD" AS ENUM ('RAZORPAY', 'QR', 'UPI', 'LINK');

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "source" "public"."ORDER_SOURCE" NOT NULL,
    "pluginDomain" TEXT,
    "paymentMethod" "public"."PAYMENT_METHOD" NOT NULL,
    "paymentStatus" "public"."PAYMENT_STATUS" NOT NULL DEFAULT 'PENDING',
    "status" "public"."ORDER_STATUS" NOT NULL DEFAULT 'CREATED',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "razorpayOrderId" TEXT,
    "deliveryOtp" TEXT,
    "otpVerified" BOOLEAN NOT NULL DEFAULT false,
    "courierPartner" TEXT,
    "shippingId" TEXT,
    "deliveryStatus" "public"."DELIVERY_STATUS" NOT NULL DEFAULT 'PENDING',
    "deliveredAt" TIMESTAMP(3),
    "meta" JSONB,
    "amount" DOUBLE PRECISION NOT NULL,
    "listingId" TEXT,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "customTitle" TEXT,
    "customDesc" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_meta" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "deliveryDate" TIMESTAMP(3),
    "deliveryMode" TEXT,
    "location" TEXT,
    "attachments" JSONB,
    "extraDetails" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EscrowTransaction" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "public"."PAYMENT_STATUS" NOT NULL,
    "paymentMode" "public"."PAYMENT_GATEWAY_METHOD" NOT NULL,
    "razorpayPaymentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),

    CONSTRAINT "EscrowTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DisputeTicket" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "public"."DISPUTE_TYPE" NOT NULL,
    "status" "public"."TICKET_STATUS" NOT NULL,
    "openedBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "resolution" TEXT,
    "adminNotes" TEXT,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "DisputeTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReverseDelivery" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "courierPartner" TEXT NOT NULL,
    "returnTrackingId" TEXT NOT NULL,
    "pickupScheduledAt" TIMESTAMP(3),
    "pickedUpAt" TIMESTAMP(3),
    "returnedAt" TIMESTAMP(3),
    "status" "public"."DELIVERY_STATUS" NOT NULL,

    CONSTRAINT "ReverseDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DeliveryVerification" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,

    CONSTRAINT "DeliveryVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_meta_orderId_key" ON "public"."order_meta"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "EscrowTransaction_orderId_key" ON "public"."EscrowTransaction"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "DisputeTicket_orderId_key" ON "public"."DisputeTicket"("orderId");

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_meta" ADD CONSTRAINT "order_meta_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EscrowTransaction" ADD CONSTRAINT "EscrowTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DisputeTicket" ADD CONSTRAINT "DisputeTicket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReverseDelivery" ADD CONSTRAINT "ReverseDelivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DeliveryVerification" ADD CONSTRAINT "DeliveryVerification_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
