
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { PageHeader } from "@/components/admin/page-header"

const inputClass = "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
const labelClass = "block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5"

interface Doctor { id: string; name: string; specialty: string }

export default function BookAppointmentPage() {
    const { slug }  = useParams<{ slug: string }>()
    const router    = useRouter()
    const [doctors, setDoctors]     = useState<Doctor[]>([])
    const [slots, setSlots]         = useState<string[]>([])
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [loading, setLoading]     = useState(false)
    const [form, setForm] = useState({ doctorId: "", date: "", time: "", reason: "", notes: "" })

    useEffect(() => {
        fetch(`/api/${slug}/public/doctors`)
            .then(r => r.json())
            .then(d => setDoctors(d.doctors ?? []))
    }, [slug])

    useEffect(() => {
        if (!form.doctorId || !form.date) { setSlots([]); return }
        setLoadingSlots(true)
        setForm(f => ({ ...f, time: "" }))
        fetch(`/api/${slug}/doctor/slots?doctorId=${form.doctorId}&date=${form.date}`)
            .then(r => r.json())
            .then(d => {
                setSlots(d.slots ?? [])
                if (!d.slots?.length) toast.error("No available slots for this date")
            })
            .finally(() => setLoadingSlots(false))
    }, [form.doctorId, form.date, slug])

    const handleSubmit = async () => {
        if (!form.doctorId || !form.date || !form.time || !form.reason) {
            toast.error("Please fill in all required fields"); return
        }
        setLoading(true)
        try {
            const dateTime = new Date(`${form.date}T${form.time}:00`)
            const res = await fetch(`/api/${slug}/patient/appointments`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ doctorId: form.doctorId, date: dateTime.toISOString(), reason: form.reason, notes: form.notes }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success("Appointment requested successfully!")
            router.push(`/${slug}/patient/appointments`)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setLoading(false) }
    }

    const today = new Date().toISOString().split("T")[0]

    return (
        <div className="max-w-lg space-y-6">
            <PageHeader title="Book Appointment" />

            <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-5">
                <div>
                    <label className={labelClass}>Doctor *</label>
                    <select value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))} className={inputClass}>
                        <option value="">Select a doctor</option>
                        {doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
                    </select>
                </div>

                <div>
                    <label className={labelClass}>Date *</label>
                    <input type="date" min={today} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputClass} />
                </div>

                {form.doctorId && form.date && (
                    <div>
                        <label className={labelClass}>
                            Available slots {loadingSlots && <span className="text-zinc-300 normal-case font-normal ml-1">Loading...</span>}
                        </label>
                        {loadingSlots ? (
                            <div className="flex items-center gap-2 py-3"><Loader2 className="h-4 w-4 animate-spin text-zinc-400" /><span className="text-xs text-zinc-400">Checking availability...</span></div>
                        ) : slots.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-zinc-200 p-4 text-center">
                                <p className="text-xs text-zinc-400">No available slots — try a different date</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 gap-2">
                                {slots.map(slot => (
                                    <label key={slot} className="cursor-pointer">
                                        <input type="radio" value={slot} checked={form.time === slot} onChange={() => setForm(f => ({ ...f, time: slot }))} className="sr-only peer" />
                                        <div className="px-3 py-2 rounded-xl border border-zinc-200 text-center text-xs font-medium text-zinc-600 peer-checked:bg-primary peer-checked:border-primary peer-checked:text-white transition-colors cursor-pointer hover:border-zinc-300">
                                            {slot}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div>
                    <label className={labelClass}>Reason for visit *</label>
                    <input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="e.g. Annual checkup, persistent headache..." className={inputClass} />
                </div>

                <div>
                    <label className={labelClass}>Additional notes <span className="normal-case font-normal text-zinc-300">(optional)</span></label>
                    <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Any additional information..." className={inputClass} />
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading || !form.time}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? "Booking..." : "Request Appointment"}
                </button>
            </div>
        </div>
    )
}
