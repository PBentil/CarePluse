import * as z from "zod"

export const patientFormSchema = z.object({
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(50, "Full name must be at most 50 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(7, "Phone number too short")
    .max(15, "Phone number too long"),
})

export type PatientFormType = z.infer<typeof patientFormSchema>