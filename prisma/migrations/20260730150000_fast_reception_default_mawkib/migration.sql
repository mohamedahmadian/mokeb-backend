-- AlterTable
ALTER TABLE "user_fast_reception_patterns" ADD COLUMN "defaultMawkibId" INTEGER;

-- AddForeignKey
ALTER TABLE "user_fast_reception_patterns" ADD CONSTRAINT "user_fast_reception_patterns_defaultMawkibId_fkey" FOREIGN KEY ("defaultMawkibId") REFERENCES "mawkibs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
