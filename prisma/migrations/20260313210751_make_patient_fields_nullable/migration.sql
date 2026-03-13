/*
  Warnings:

  - You are about to drop the column `emergencyContactName` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyContactNumber` on the `Patient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "emergencyContactName",
DROP COLUMN "emergencyContactNumber",
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "dateOfBirth" DROP NOT NULL,
ALTER COLUMN "gender" DROP NOT NULL,
ALTER COLUMN "occupation" DROP NOT NULL;
