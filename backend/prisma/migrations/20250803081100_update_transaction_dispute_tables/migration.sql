/*
  Warnings:

  - The values [UPI] on the enum `PAYMENT_GATEWAY_METHOD` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."PAYMENT_GATEWAY_METHOD_new" AS ENUM ('RAZORPAY', 'QR', 'LINK');
ALTER TABLE "public"."EscrowTransaction" ALTER COLUMN "paymentMode" TYPE "public"."PAYMENT_GATEWAY_METHOD_new" USING ("paymentMode"::text::"public"."PAYMENT_GATEWAY_METHOD_new");
ALTER TYPE "public"."PAYMENT_GATEWAY_METHOD" RENAME TO "PAYMENT_GATEWAY_METHOD_old";
ALTER TYPE "public"."PAYMENT_GATEWAY_METHOD_new" RENAME TO "PAYMENT_GATEWAY_METHOD";
DROP TYPE "public"."PAYMENT_GATEWAY_METHOD_old";
COMMIT;
