/*
  Warnings:

  - You are about to drop the column `identificationDocument` on the `Patient` table. All the data in the column will be lost.
  - Made the column `address` on table `Patient` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dateOfBirth` on table `Patient` required. This step will fail if there are existing NULL values in that column.
  - Made the column `emergencyContactName` on table `Patient` required. This step will fail if there are existing NULL values in that column.
  - Made the column `emergencyContactNumber` on table `Patient` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gender` on table `Patient` required. This step will fail if there are existing NULL values in that column.
  - Made the column `occupation` on table `Patient` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Patient_email_key";

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "identificationDocument",
ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "dateOfBirth" SET NOT NULL,
ALTER COLUMN "emergencyContactName" SET NOT NULL,
ALTER COLUMN "emergencyContactNumber" SET NOT NULL,
ALTER COLUMN "gender" SET NOT NULL,
ALTER COLUMN "occupation" SET NOT NULL;
