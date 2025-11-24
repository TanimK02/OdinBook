-- AlterTable
ALTER TABLE "Tweet" ADD COLUMN     "parentTweetId" TEXT;

-- CreateIndex
CREATE INDEX "Tweet_parentTweetId_idx" ON "Tweet"("parentTweetId");

-- AddForeignKey
ALTER TABLE "Tweet" ADD CONSTRAINT "Tweet_parentTweetId_fkey" FOREIGN KEY ("parentTweetId") REFERENCES "Tweet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
