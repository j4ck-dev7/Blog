/*
  Warnings:

  - You are about to drop the column `articleSlug` on the `Comment` table. All the data in the column will be lost.
  - Added the required column `article` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "articleSlug",
ADD COLUMN     "article" TEXT NOT NULL;
