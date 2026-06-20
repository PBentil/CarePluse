-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "diagnosis" TEXT,
ADD COLUMN     "requiresLabTest" BOOLEAN NOT NULL DEFAULT false;
