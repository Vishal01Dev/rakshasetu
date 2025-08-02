-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "verificationCode" TEXT,
ADD COLUMN     "verificationSentAt" TIMESTAMP(3);
