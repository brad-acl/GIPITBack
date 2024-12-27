/*
  Warnings:

  - You are about to drop the column `total_experience` on the `candidate_process` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "candidate_management" ADD COLUMN     "rate" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "candidate_process" DROP COLUMN "total_experience";

-- AlterTable
ALTER TABLE "candidates" ADD COLUMN     "total_experience" INTEGER DEFAULT 0;
