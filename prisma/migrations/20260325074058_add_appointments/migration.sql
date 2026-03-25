-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "rescheduledDate" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
