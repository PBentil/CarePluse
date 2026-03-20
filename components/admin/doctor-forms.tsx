"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import type { Doctor } from "@/types"

const schema = z.object({
    name:           z.string().min(2, "Name is required"),
    specialty: z.string().min(2, "Specialization is required"),
    email:          z.string().email("Enter a valid email"),
})

type FormValues = z.infer<typeof schema>

const inputClass = "w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent transition-all"
const labelClass = "block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5"

const specializations = [
    "General Practitioner", "Cardiologist", "Dermatologist",
    "Neurologist", "Pediatrician", "Psychiatrist",
    "Orthopedic Surgeon", "Gynecologist", "Oncologist", "Radiologist",
]

interface DoctorFormProps {
    doctor?: Doctor
    onSuccess: () => void
}

export function DoctorForm({ doctor, onSuccess }: DoctorFormProps) {
    const isEdit = !!doctor

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({ resolver: zodResolver(schema) })

    useEffect(() => {
        if (doctor) {
            reset({ name: doctor.name, specialization: doctor.specialty, email: doctor.email })
        }
    }, [doctor, reset])

    const onSubmit = async (data: FormValues) => {
        try {
            const url    = isEdit ? `/api/admin/doctors/${doctor.id}` : "/api/admin/doctors"
            const method = isEdit ? "PATCH" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!res.ok) throw new Error(`Failed to ${isEdit ? "update" : "add"} doctor`)

            toast.success(`Doctor ${isEdit ? "updated" : "added"} successfully`)
            if (!isEdit) reset()
            onSuccess()
        } catch (error: any) {
            toast.error(error.message || "Something went wrong")
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div>
                <label className={labelClass}>Full Name</label>
                <input {...register("name")} placeholder="Dr. Kwame Mensah" className={inputClass} />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div>
                <label className={labelClass}>Specialization</label>
                <select {...register("specialty")} className={inputClass}>
                    <option value="">Select specialization</option>
                    {specializations.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.specialty && <p className="mt-1 text-xs text-red-500">{errors.specialty.message}</p>}
            </div>

            <div>
                <label className={labelClass}>Email</label>
                <input {...register("email")} type="email" placeholder="dr.mensah@carepulse.com" className={inputClass} />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Add Doctor"}
                </button>
            </div>

        </form>
    )
}