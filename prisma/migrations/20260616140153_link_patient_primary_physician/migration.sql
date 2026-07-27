/*
  Warnings:

  - You are about to drop the column `primaryPhysician` on the `Patient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "primaryPhysician",
ADD COLUMN     "primaryPhysicianId" TEXT;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_primaryPhysicianId_fkey" FOREIGN KEY ("primaryPhysicianId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
