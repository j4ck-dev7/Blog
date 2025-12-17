-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "post" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "articleSlug" TEXT NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "like" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "articleSlug" TEXT NOT NULL,

    CONSTRAINT "like_pkey" PRIMARY KEY ("id")
);
