/*
  Warnings:

  - You are about to drop the column `article` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `articleSlug` on the `like` table. All the data in the column will be lost.
  - Added the required column `articleId` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `articleId` to the `like` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "article",
ADD COLUMN     "articleId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "like" DROP COLUMN "articleSlug",
ADD COLUMN     "articleId" TEXT NOT NULL;
