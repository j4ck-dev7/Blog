/*
  Warnings:

  - You are about to drop the column `subscriptionExpiresAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionPlan` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "subscriptionExpiresAt",
DROP COLUMN "subscriptionPlan";

-- DropEnum
DROP TYPE "SubscriptionPlan";
