"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

const schema = z.object({
    doctorId:  z.string().min(1, "Please select a doctor"),
    date:      z.string().min(1, "Please select a date"),
    reason:    z.string().min(5, "Please describe your reason for the appointment"),
    notes:     z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const inputClass  = "w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent transition-all"
const labelClass  = "block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5"

interface AppointmentFormProps {
    patientId: string
}

export default function AppointmentForm({ patientId }: AppointmentFormProps) {
    const router  = useRouter()
    const [doctors, setDoctors] = useState<{ id: string; name: string; specialty: string }[]>([])

    const {
        register, handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({ resolver: zodResolver(schema) })

    useEffect(() => {
        fetch("/api/admin/doctors?limit=100")
            .then((r) => r.json())
            .then((d) => setDoctors(d.doctors ?? []))
    }, [])

    const onSubmit = async (data: FormValues) => {
        try {
            const res = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, patientId }),
            })

            const result = await res.json()

            if (!res.ok) throw new Error(result.error || "Failed to book appointment")

            toast.success("Appointment requested successfully")
            router.push(`/appointments/${patientId}/confirmation`)
        } catch (error: any) {
            toast.error(error.message || "Something went wrong")
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            <div>
                <label className={labelClass}>Doctor</label>
                <select {...register("doctorId")} className={inputClass}>
                    <option value="">Select a doctor</option>
                    {doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                            {d.name} — {d.specialty}
                        </option>
                    ))}
                </select>
                {errors.doctorId && <p className="mt-1 text-xs text-red-500">{errors.doctorId.message}</p>}
            </div>

            <div>
                <label className={labelClass}>Preferred Date & Time</label>
                <input
                    {...register("date")}
                    type="datetime-local"
                    className={inputClass}
                    min={new Date().toISOString().slice(0, 16)}
                />
                {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>}
            </div>

            <div>
                <label className={labelClass}>Reason for Visit</label>
                <input
                    {...register("reason")}
                    placeholder="e.g. Annual checkup, persistent headache..."
                    className={inputClass}
                />
                {errors.reason && <p className="mt-1 text-xs text-red-500">{errors.reason.message}</p>}
            </div>

            <div>
                <label className={labelClass}>Additional Notes <span className="normal-case text-zinc-300">(optional)</span></label>
                <textarea
                    {...register("notes")}
                    rows={3}
                    placeholder="Any additional information the doctor should know..."
                    className={inputClass}
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Booking..." : "Request Appointment"}
            </button>

        </form>
    )
}