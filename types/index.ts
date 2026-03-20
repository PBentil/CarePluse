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