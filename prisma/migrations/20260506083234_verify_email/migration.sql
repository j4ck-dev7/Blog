-- CreateEnum
CREATE TYPE "Status" AS ENUM ('pending', 'active', 'blocked');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'pending';
