
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

const schema = z.object({
    doctorId: z.string().min(1, "Please select a doctor"),
    date:     z.string().min(1, "Please select a date"),
    time:     z.string().min(1, "Please select a time slot"),
    reason:   z.string().min(5, "Please describe your reason for the appointment"),
    notes:    z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const inputClass = "w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent transition-all"
const labelClass = "block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5"

interface AppointmentFormProps {
    patientId: string
}

export default function AppointmentForm({ patientId }: AppointmentFormProps) {
    const router = useRouter()
    const [doctors, setDoctors]     = useState<{ id: string; name: string; specialty: string }[]>([])
    const [slots, setSlots]         = useState<string[]>([])
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [selectedDoctor, setSelectedDoctor] = useState("")
    const [selectedDate, setSelectedDate]     = useState("")

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({ resolver: zodResolver(schema) })

    const watchedDoctor = watch("doctorId")
    const watchedDate   = watch("date")

    useEffect(() => {
        fetch("/api/admin/doctors?limit=100")
            .then(r => r.json())
            .then(d => setDoctors(d.doctors ?? []))
    }, [])

    useEffect(() => {
        if (!watchedDoctor || !watchedDate) {
            setSlots([])
            return
        }
        setLoadingSlots(true)
        setValue("time", "")
        fetch(`/api/doctor/slots?doctorId=${watchedDoctor}&date=${watchedDate}`)
            .then(r => r.json())
            .then(d => {
                setSlots(d.slots ?? [])
                if (!d.slots?.length) {
                    toast.error("No available slots for this date. Please choose another day.")
                }
            })
            .catch(() => setSlots([]))
            .finally(() => setLoadingSlots(false))
    }, [watchedDoctor, watchedDate, setValue])

    const onSubmit = async (data: FormValues) => {
        try {
            const dateTime = new Date(`${data.date}T${data.time}:00`)

            const res = await fetch("/api/appointments", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({
                    patientId,
                    doctorId: data.doctorId,
                    date:     dateTime.toISOString(),
                    reason:   data.reason,
                    notes:    data.notes,
                }),
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.error || "Failed to book appointment")

            toast.success("Appointment requested successfully")
            router.push(`/appointments/${patientId}/confirmation`)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Something went wrong")
        }
    }

    const today = new Date().toISOString().split("T")[0]

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
                <label className={labelClass}>Date</label>
                <input
                    {...register("date")}
                    type="date"
                    min={today}
                    className={inputClass}
                />
                {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>}
            </div>

            {watchedDoctor && watchedDate && (
                <div>
                    <label className={labelClass}>
                        Available time slots
                        {loadingSlots && <span className="ml-2 text-zinc-300 normal-case font-normal">Loading...</span>}
                    </label>
                    {loadingSlots ? (
                        <div className="flex items-center gap-2 py-3">
                            <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                            <span className="text-xs text-zinc-400">Checking availability...</span>
                        </div>
                    ) : slots.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 p-4 text-center">
                            <p className="text-xs text-zinc-400">No available slots for this date</p>
                            <p className="text-xs text-zinc-300 mt-1">Try a different date or doctor</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 gap-2">
                            {slots.map(slot => (
                                <label key={slot} className="cursor-pointer">
                                    <input
                                        type="radio"
                                        value={slot}
                                        {...register("time")}
                                        className="sr-only peer"
                                    />
                                    <div className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-center text-xs font-medium text-zinc-600 dark:text-zinc-300 peer-checked:bg-primary peer-checked:border-primary peer-checked:text-white transition-colors cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600">
                                        {slot}
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                    {errors.time && <p className="mt-1 text-xs text-red-500">{errors.time.message}</p>}
                </div>
            )}

            <div>
                <label className={labelClass}>Reason for visit</label>
                <input
                    {...register("reason")}
                    placeholder="e.g. Annual checkup, persistent headache..."
                    className={inputClass}
                />
                {errors.reason && <p className="mt-1 text-xs text-red-500">{errors.reason.message}</p>}
            </div>

            <div>
                <label className={labelClass}>
                    Additional notes <span className="normal-case text-zinc-300 font-normal">(optional)</span>
                </label>
                <textarea
                    {...register("notes")}
                    rows={3}
                    placeholder="Any additional information the doctor should know..."
                    className={inputClass}
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting || slots.length === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-primary/90 dark:hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Booking..." : "Request Appointment"}
            </button>

        </form>
    )
}
