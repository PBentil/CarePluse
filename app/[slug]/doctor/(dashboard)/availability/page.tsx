
"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { PageHeader } from "@/components/admin/page-header"
import { Loader2 } from "lucide-react"

const days    = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
const times   = ["06:00","06:30","07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00"]
const durations = [15, 20, 30, 45, 60]

interface DayConfig { enabled: boolean; startTime: string; endTime: string; slotDurationMins: number }
interface AvailabilityRecord { id: string; dayOfWeek: number; startTime: string; endTime: string; slotDurationMins: number; isActive: boolean }

const defaultConfig = (): DayConfig => ({ enabled: false, startTime: "09:00", endTime: "17:00", slotDurationMins: 30 })
const selectClass = "rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all"

export default function DoctorAvailabilityPage() {
    const { slug }   = useParams<{ slug: string }>()
    const [schedule, setSchedule] = useState<DayConfig[]>(Array.from({ length: 7 }, defaultConfig))
    const [loading, setLoading]   = useState(true)
    const [saving, setSaving]     = useState(false)

    const fetchAvailability = useCallback(async () => {
        setLoading(true)
        try {
            const res  = await fetch(`/api/${slug}/doctor/availability`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            const newSchedule: DayConfig[] = Array.from({ length: 7 }, defaultConfig)
            data.availability.forEach((a: AvailabilityRecord) => {
                if (a.isActive) newSchedule[a.dayOfWeek] = { enabled: true, startTime: a.startTime, endTime: a.endTime, slotDurationMins: a.slotDurationMins }
            })
            setSchedule(newSchedule)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setLoading(false) }
    }, [slug])

    useEffect(() => { fetchAvailability() }, [fetchAvailability])

    const update = (i: number, field: keyof DayConfig, value: boolean | string | number) =>
        setSchedule(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: value } : d))

    const handleSave = async () => {
        setSaving(true)
        try {
            await Promise.all(schedule.map(async (day, i) => {
                if (day.enabled) {
                    await fetch(`/api/${slug}/doctor/availability`, {
                        method: "POST", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ dayOfWeek: i, startTime: day.startTime, endTime: day.endTime, slotDurationMins: day.slotDurationMins }),
                    })
                } else {
                    await fetch(`/api/${slug}/doctor/availability`, {
                        method: "DELETE", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ dayOfWeek: i }),
                    })
                }
            }))
            toast.success("Availability saved")
            fetchAvailability()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setSaving(false) }
    }

    if (loading) return <div className="space-y-6"><PageHeader title="My Availability" /></div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader title="My Availability" />
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {saving ? "Saving..." : "Save schedule"}
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-100">
                    <p className="text-sm font-medium text-zinc-900">Weekly schedule</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Set days and hours you are available for appointments</p>
                </div>
                <div className="divide-y divide-zinc-50">
                    {days.map((day, i) => (
                        <div key={day} className="px-6 py-4 flex items-center gap-6">
                            <div className="w-28 flex items-center gap-3 shrink-0">
                                <div className="relative">
                                    <input type="checkbox" checked={schedule[i].enabled} onChange={e => update(i, "enabled", e.target.checked)} className="peer h-4 w-4 rounded border-zinc-300 appearance-none bg-white border checked:bg-primary checked:border-primary transition-all cursor-pointer" />
                                    <svg className="absolute inset-0 h-4 w-4 pointer-events-none hidden peer-checked:block text-white" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                                <span className={`text-sm font-medium ${schedule[i].enabled ? "text-zinc-900" : "text-zinc-400"}`}>{day}</span>
                            </div>
                            {schedule[i].enabled ? (
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-zinc-400">From</span>
                                        <select value={schedule[i].startTime} onChange={e => update(i, "startTime", e.target.value)} className={selectClass}>{times.map(t => <option key={t} value={t}>{t}</option>)}</select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-zinc-400">To</span>
                                        <select value={schedule[i].endTime} onChange={e => update(i, "endTime", e.target.value)} className={selectClass}>{times.map(t => <option key={t} value={t}>{t}</option>)}</select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-zinc-400">Slot</span>
                                        <select value={schedule[i].slotDurationMins} onChange={e => update(i, "slotDurationMins", parseInt(e.target.value))} className={selectClass}>{durations.map(d => <option key={d} value={d}>{d} min</option>)}</select>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-xs text-zinc-300">Not available</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
