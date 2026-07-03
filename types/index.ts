 export interface Patient {
    id: string
    fullName: string
    email: string
    phone: string
    gender?: string
    createdAt: string
}

 export interface Doctor {
     id: string
     name: string
     specialty: string
     email: string
     createdAt: string
 }

 export type AppointmentStatus = "pending" | "confirmed" | "rejected" | "rescheduled"

 export interface Appointment {
     id: string
     patientId: string
     doctorId: string
     date: string
     reason: string
     notes?: string
     status: AppointmentStatus
     rejectionReason?: string
     rescheduledDate?: string
     videoRoomUrl?: string
     videoRoomName?: string
     createdAt: string
     patient: { fullName: string; email: string; phone: string }
     doctor:  { name: string; specialty: string; email: string }
 }
export type LabTestStatus = "ordered" | "processing" | "completed"

export interface LabTest {
    id:            string
    appointmentId: string
    patientId:     string
    doctorId:      string
    testName:      string
    status:        LabTestStatus
    resultUrl?:    string
    resultNotes?:  string
    orderedAt:     string
    completedAt?:  string
    patient?:      { fullName: string; email: string; phone: string }
    doctor?:       { name: string; specialty: string }
    appointment?:  { date: string; reason: string }
}
