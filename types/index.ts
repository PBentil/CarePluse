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

export type PrescriptionStatus = "pending" | "paid" | "dispensed"

export interface PrescriptionItem {
    id:             string
    prescriptionId: string
    drugName:       string
    dosage:         string
    frequency:      string
    duration:       string
    price:          number
    notes?:         string
}

export interface Prescription {
    id:            string
    appointmentId: string
    patientId:     string
    doctorId:      string
    diagnosis?:    string
    notes?:        string
    status:        PrescriptionStatus
    createdAt:     string
    items:         PrescriptionItem[]
    patient?:      { fullName: string; email: string; phone: string }
    doctor?:       { name: string; specialty: string }
    appointment?:  { date: string; reason: string }
}

export interface Drug {
    id:          string
    name:        string
    genericName?: string
    category?:   string
    unit:        string
    price:       number
    inStock:     boolean
    createdAt:   string
}

export type OrderStatus = "packed" | "on_the_way" | "delivered"

export interface Order {
    id:              string
    prescriptionId:  string
    patientId:       string
    deliveryAddress: string
    status:          OrderStatus
    totalAmount:     number
    paystackRef?:    string
    createdAt:       string
    updatedAt:       string
    prescription?:   Prescription
    patient?:        { fullName: string; email: string; phone: string }
}
