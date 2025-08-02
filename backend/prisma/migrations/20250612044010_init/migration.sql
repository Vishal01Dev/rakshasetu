-- CreateEnum
CREATE TYPE "USER_TYPE" AS ENUM ('BUYER', 'SELLER');

-- CreateEnum
CREATE TYPE "USER_STATUS" AS ENUM ('ACTIVE', 'BANNED');

-- CreateEnum
CREATE TYPE "USER_VERIFICATION_STATUS" AS ENUM ('DEFAULT', 'APPROVED', 'PENDING', 'REJECTED');

-- CreateEnum
CREATE TYPE "ADMIN_STATUS" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "business" TEXT NOT NULL,
    "type" "USER_TYPE" NOT NULL DEFAULT 'BUYER',
    "mobile" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "status" "USER_STATUS" NOT NULL DEFAULT 'ACTIVE',
    "address" JSONB,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "smsVerified" BOOLEAN NOT NULL DEFAULT false,
    "kycVerified" "USER_VERIFICATION_STATUS" NOT NULL DEFAULT 'DEFAULT',
    "bankVerified" "USER_VERIFICATION_STATUS" NOT NULL DEFAULT 'DEFAULT',
    "gstVerified" "USER_VERIFICATION_STATUS" NOT NULL DEFAULT 'DEFAULT',
    "verificationCode" TEXT,
    "verificationSentAt" TIMESTAMP(3),
    "twoFactorVerified" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "twoFactorStatus" BOOLEAN NOT NULL DEFAULT false,
    "deviceId" TEXT,
    "emailVerifiedAt" TIMESTAMP(3),
    "rememberToken" TEXT,
    "refreshToken" TEXT,
    "refreshTokenExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_kyc_details" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "panNumber" TEXT,
    "dateOfBirth" TEXT,
    "fullNameAsPerPan" TEXT,
    "panVerificationStatus" "USER_VERIFICATION_STATUS" NOT NULL DEFAULT 'DEFAULT',
    "panRejectionReason" TEXT,
    "aadharNumber" TEXT,
    "fullNameAsPerAadhar" TEXT,
    "aadhaarReferenceId" TEXT,
    "aadharVerificationStatus" "USER_VERIFICATION_STATUS" NOT NULL DEFAULT 'DEFAULT',
    "aadharRejectionReason" TEXT,
    "gstNumber" TEXT,
    "gstStatus" TEXT,
    "constitution" TEXT,
    "registrationDate" TEXT,
    "businessName" TEXT,
    "businessAddress" JSONB,
    "tradeName" TEXT,
    "gstVerificationStatus" "USER_VERIFICATION_STATUS" NOT NULL DEFAULT 'DEFAULT',
    "gstRejectionReason" TEXT,
    "bankAccountNumber" TEXT,
    "bankIfscCode" TEXT,
    "fullNameAsPerBank" TEXT,
    "bankVerificationStatus" "USER_VERIFICATION_STATUS" NOT NULL DEFAULT 'DEFAULT',
    "bankRejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_kyc_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "status" "ADMIN_STATUS" NOT NULL DEFAULT 'ACTIVE',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "refreshToken" TEXT,
    "refreshTokenExpires" TIMESTAMP(3),
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "admin_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT,

    CONSTRAINT "admin_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RolePermissions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RolePermissions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_userName_key" ON "users"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_kyc_details_userId_key" ON "user_kyc_details"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "admins_userName_key" ON "admins"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_roles_name_key" ON "admin_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "admin_permissions_name_key" ON "admin_permissions"("name");

-- CreateIndex
CREATE INDEX "_RolePermissions_B_index" ON "_RolePermissions"("B");

-- AddForeignKey
ALTER TABLE "user_kyc_details" ADD CONSTRAINT "user_kyc_details_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "admin_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RolePermissions" ADD CONSTRAINT "_RolePermissions_A_fkey" FOREIGN KEY ("A") REFERENCES "admin_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RolePermissions" ADD CONSTRAINT "_RolePermissions_B_fkey" FOREIGN KEY ("B") REFERENCES "admin_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
