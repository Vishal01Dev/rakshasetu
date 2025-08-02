/*
  Warnings:

  - Added the required column `updatedAt` to the `admin_permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `admin_roles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "admin_permissions" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "admin_roles" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
