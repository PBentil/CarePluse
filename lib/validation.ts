import * as z from "zod"

export const patientIntakeSchema = z.object({


  fullName: z.string().min(3, "Full name must be at least 3 characters"),

  email: z.string().email("Enter a valid email"),

  phone: z.string().min(7, "Phone number must be valid"),

  dateOfBirth: z.string().min(1, "Date of birth is required"),

  gender: z.string().min(1, "Gender is required"),

  address: z.string().min(5, "Address must be at least 5 characters"),

  occupation: z.string().min(2, "Occupation must be at least 2 characters"),

  emergencyContactName: z
    .string()
    .min(3, "Emergency contact name is required"),

  emergencyContactNumber: z
    .string()
    .min(7, "Emergency contact number must be valid"),



  primaryCarePhysician: z
    .string()
    .min(2, "Primary care physician is required"),

  insuranceProvider: z
    .string()
    .min(2, "Insurance provider is required"),

  insurancePolicyNumber: z
    .string()
    .min(2, "Insurance policy number is required"),

  allergies: z.string().optional(),

  currentMedication: z.string().optional(),



  identificationType: z
    .string()
    .min(2, "Identification type is required"),

  identificationNumber: z
    .string()
    .min(3, "Identification number is required"),

  identificationDocument: z.any().optional(),


treatmentConsent: z.boolean().refine(val => val === true, {
    message: "You must consent to treatment"
  }),
  
  disclosureConsent: z.boolean().refine(val => val === true, {
    message: "You must allow disclosure for treatment"
  }),
  
  privacyPolicy: z.boolean().refine(val => val === true, {
    message: "You must agree to the privacy policy"
  }),
})