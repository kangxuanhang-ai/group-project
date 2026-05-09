-- DropForeignKey
ALTER TABLE "CourseRecord" DROP CONSTRAINT "CourseRecord_userId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentRecord" DROP CONSTRAINT "PaymentRecord_userId_fkey";

-- AlterTable
ALTER TABLE "PaymentRecord" ADD COLUMN     "courseId" TEXT;

-- CreateIndex
CREATE INDEX "ErrorEntry_createdAt_idx" ON "ErrorEntry"("createdAt");

-- CreateIndex
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");

-- CreateIndex
CREATE INDEX "PerformanceEntry_createdAt_idx" ON "PerformanceEntry"("createdAt");

-- CreateIndex
CREATE INDEX "TrackEvent_createdAt_idx" ON "TrackEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseRecord" ADD CONSTRAINT "CourseRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
