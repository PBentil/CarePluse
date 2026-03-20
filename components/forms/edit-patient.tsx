"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import type { Patient } from "@/types"

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
})

type FormValues = z.infer<typeof schema>

const genders = ["Male", "Female", "Other"]
const idTypes = ["Ghana Card", "Health Insurance", "Passport", "Driver's License"]

const inputClass = "w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent transition-all"
const labelClass = "block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5"

interface EditPatientFormProps {
    patient: Patient
    onSuccess: () => void
}

export function EditPatientForm({ patient, onSuccess }: EditPatientFormProps) {
    const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([])
    const [fetching, setFetching] = useState(true)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({ resolver: zodResolver(schema) })

    // Fetch full patient details + doctors in parallel
    useEffect(() => {
        const load = async () => {
            setFetching(true)
            const [patientRes, doctorsRes] = await Promise.all([
                fetch(`/api/admin/patients/${patient.id}`),
                fetch("/api/admin/doctors?limit=100"),
            ])

            const full    = await patientRes.json()
            const doctors = await doctorsRes.json()

            setDoctors(doctors.doctors ?? [])

            reset({
                fullName:               full.fullName               ?? "",
                email:                  full.email                  ?? "",
                phone:                  full.phone                  ?? "",
                dateOfBirth:            full.dateOfBirth?.slice(0, 10) ?? "",
                gender:                 full.gender                 ?? "",
                address:                full.address                ?? "",
                occupation:             full.occupation             ?? "",
                emergencyContactName:   full.emergencyContactName   ?? "",
                emergencyContactNumber: full.emergencyContactNumber ?? "",
                primaryPhysician:       full.primaryPhysician       ?? "",
                insuranceProvider:      full.insuranceProvider      ?? "",
                insurancePolicyNumber:  full.insurancePolicyNumber  ?? "",
                allergies:              full.allergies              ?? "",
                currentMedication:      full.currentMedication      ?? "",
                identificationType:     full.identificationType     ?? "",
                identificationNumber:   full.identificationNumber   ?? "",
            })

            setFetching(false)
        }

        load()
    }, [patient.id, reset])

    const onSubmit = async (data: FormValues) => {
        try {
            const res = await fetch(`/api/admin/patients/${patient.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error("Failed to update patient")
            toast.success("Patient updated successfully")
            onSuccess()
        } catch (error: any) {
            toast.error(error.message || "Something went wrong")
        }
    }

    const Field = ({ label, name, type = "text", placeholder, options, error }: {
        label: string; name: keyof FormValues; type?: string
        placeholder?: string; options?: { value: string; label: string }[]; error?: string
    }) => (
        <div>
            <label className={labelClass}>{label}</label>
            {options ? (
                <select {...register(name)} className={inputClass}>
                    <option value="">Select {label.toLowerCase()}</option>
                    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            ) : (
                <input {...register(name)} type={type} placeholder={placeholder} className={inputClass} />
            )}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    )

    if (fetching) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-1.5">
                        <div className="h-3 w-24 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                        <div className="h-10 w-full rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                    </div>
                ))}
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-3">Personal</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Full Name"     name="fullName"     placeholder="Kofi Mensah"              error={errors.fullName?.message} />
                    <Field label="Email"         name="email"        type="email" placeholder="kofi@example.com" error={errors.email?.message} />
                    <Field label="Phone"         name="phone"        placeholder="+233 ..."                 error={errors.phone?.message} />
                    <Field label="Date of Birth" name="dateOfBirth"  type="date" />
                    <Field label="Gender"        name="gender"       options={genders.map((g) => ({ value: g, label: g }))} />
                    <Field label="Address"       name="address"      placeholder="123 Liberation Rd, Accra" />
                    <Field label="Occupation"    name="occupation"   placeholder="e.g. Engineer" />
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
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-3">Medical</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                        label="Primary Physician"
                        name="primaryPhysician"
                        options={doctors.map((d) => ({ value: d.name, label: d.name }))}
                    />
                    <Field label="Insurance Provider"   name="insuranceProvider"    placeholder="e.g. NHIS" />
                    <Field label="Insurance Policy No." name="insurancePolicyNumber" placeholder="POL-0012345" />
                    <Field label="Allergies"            name="allergies"            placeholder="e.g. Penicillin" />
                    <Field label="Current Medication"   name="currentMedication"    placeholder="e.g. Paracetamol 500mg" />
                </div>
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800" />

            <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-3">Identification</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="ID Type"   name="identificationType"  options={idTypes.map((i) => ({ value: i, label: i }))} />
                    <Field label="ID Number" name="identificationNumber" placeholder="GHA-XXXXXXXXX-X" />
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Saving..." : "Save Changes"}
            </button>

        </form>
    )
}