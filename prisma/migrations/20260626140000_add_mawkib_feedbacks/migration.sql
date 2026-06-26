-- CreateTable
CREATE TABLE "mawkib_feedbacks" (
    "id" SERIAL NOT NULL,
    "mawkibId" INTEGER NOT NULL,
    "authorUserId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "ownerReply" TEXT,
    "repliedAt" TIMESTAMP(3),
    "repliedByUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mawkib_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mawkib_feedbacks_mawkibId_createdAt_idx" ON "mawkib_feedbacks"("mawkibId", "createdAt");

-- CreateIndex
CREATE INDEX "mawkib_feedbacks_authorUserId_createdAt_idx" ON "mawkib_feedbacks"("authorUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "mawkib_feedbacks" ADD CONSTRAINT "mawkib_feedbacks_mawkibId_fkey" FOREIGN KEY ("mawkibId") REFERENCES "mawkibs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mawkib_feedbacks" ADD CONSTRAINT "mawkib_feedbacks_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mawkib_feedbacks" ADD CONSTRAINT "mawkib_feedbacks_repliedByUserId_fkey" FOREIGN KEY ("repliedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
