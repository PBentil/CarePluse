"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const schema = z.object({
    fullName:               z.string().min(2, "Full name is required"),
    email:                  z.string().email("Enter a valid email"),
    phone:                  z.string().min(7, "Enter a valid phone number"),
    dateOfBirth:            z.string().optional(),
    gender:                 z.string().optional(),
    address:                z.string().optional(),
    occupation:             z.string().optional(),
    emergencyContactName:   z.string().optional(),
    emergencyContactNumber: z.string().optional(),
    primaryPhysician:       z.string().optional(),
    insuranceProvider:      z.string().optional(),
    insurancePolicyNumber:  z.string().optional(),
    allergies:              z.string().optional(),
    currentMedication:      z.string().optional(),
    identificationType:     z.string().optional(),
    identificationNumber:   z.string().optional(),
    consentTerms:           z.boolean().default(true),
    consentPrivacy:         z.boolean().default(true),
    consentTreatment:       z.boolean().default(true),
})

type FormValues = z.infer<typeof schema>

const doctors  = ["Dr. Kwame Mensah", "Dr. Akua Owusu", "Dr. John Doe", "Dr. Jane Smith"]
const idTypes  = ["Ghana Card", "Health Insurance", "Passport", "Driver's License"]
const genders  = ["Male", "Female", "Other"]

const inputClass = "w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent transition-all"
const labelClass = "block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5"

interface AddPatientFormProps {
    onSuccess: () => void
}

export function AddPatientForm({ onSuccess }: AddPatientFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            consentTerms:    true,
            consentPrivacy:  true,
            consentTreatment: true,
        },
    })

    const onSubmit = async (data: FormValues) => {
        try {
            const res = await fetch("/api/admin/patients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...data,
                    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : undefined,
                }),
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || "Failed to create patient")
            }

            toast.success("Patient added successfully")
            reset()
            onSuccess()
        } catch (error: any) {
            toast.error(error.message || "Something went wrong")
        }
    }

    const Field = ({
                       label, name, type = "text", placeholder, options, error,
                   }: {
        label: string
        name: keyof FormValues
        type?: string
        placeholder?: string
        options?: string[]
        error?: string
    }) => (
        <div>
            <label className={labelClass}>{label}</label>
            {options ? (
                <select {...register(name as any)} className={inputClass}>
                    <option value="">Select {label.toLowerCase()}</option>
                    {options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
            ) : (
                <input
                    {...register(name as any)}
                    type={type}
                    placeholder={placeholder}
                    className={inputClass}
                />
            )}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    )

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-3">Personal Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Full Name"   name="fullName"   placeholder="Kofi Mensah" error={errors.fullName?.message} />
                    <Field label="Email"       name="email"      type="email" placeholder="kofi@example.com" error={errors.email?.message} />
                    <Field label="Phone"       name="phone"      placeholder="+233 ..." error={errors.phone?.message} />
                    <Field label="Date of Birth" name="dateOfBirth" type="date" />
                    <Field label="Gender"      name="gender"     options={genders} />
                    <Field label="Address"     name="address"    placeholder="123 Main St" />
                    <Field label="Occupation"  name="occupation" placeholder="e.g. Engineer" />
                </div>
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800" />

            <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-3">Emergency Contact</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Contact Name"   name="emergencyContactName"   placeholder="John Mensah" />
                    <Field label="Contact Number" name="emergencyContactNumber" placeholder="+233 ..." />
                </div>
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800" />

            <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-3">Medical Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Primary Physician"      name="primaryPhysician"      options={doctors} />
                    <Field label="Insurance Provider"     name="insuranceProvider"     placeholder="e.g. NHIS" />
                    <Field label="Insurance Policy No."   name="insurancePolicyNumber" placeholder="Policy number" />
                    <Field label="Allergies"              name="allergies"             placeholder="e.g. Penicillin" />
                    <Field label="Current Medication"     name="currentMedication"     placeholder="e.g. Paracetamol" />
                </div>
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800" />

            <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-3">Identification</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="ID Type"   name="identificationType" options={idTypes} />
                    <Field label="ID Number" name="identificationNumber" placeholder="GHA-XXXXXXXXX-X" />
                </div>
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800" />

            <input type="hidden" {...register("consentTerms")}    value="true" />
            <input type="hidden" {...register("consentPrivacy")}  value="true" />
            <input type="hidden" {...register("consentTreatment")} value="true" />

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Adding patient..." : "Add Patient"}
            </button>

        </form>
    )
}