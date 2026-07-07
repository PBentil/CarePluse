
"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { PageHeader } from "@/components/admin/page-header"
import { Loader2 } from "lucide-react"

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const timeSlots = [
    "06:00", "06:30", "07:00", "07:30", "08:00", "08:30",
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00", "19:30", "20:00",
]

const durations = [15, 20, 30, 45, 60]

interface AvailabilityRecord {
    id:               string
    dayOfWeek:        number
    startTime:        string
    endTime:          string
    slotDurationMins: number
    isActive:         boolean
}

interface DayConfig {
    enabled:          boolean
    startTime:        string
    endTime:          string
    slotDurationMins: number
}

const defaultConfig = (): DayConfig => ({
    enabled:          false,
    startTime:        "09:00",
    endTime:          "17:00",
    slotDurationMins: 30,
})

const selectClass = "rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"

export default function DoctorAvailabilityPage() {
    const [schedule, setSchedule] = useState<DayConfig[]>(
        Array.from({ length: 7 }, defaultConfig)
    )
    const [loading, setLoading]   = useState(true)
    const [saving, setSaving]     = useState(false)

    const fetchAvailability = useCallback(async () => {
        setLoading(true)
        try {
            const res  = await fetch("/api/doctor/availability")
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            const newSchedule: DayConfig[] = Array.from({ length: 7 }, defaultConfig)
            data.availability.forEach((a: AvailabilityRecord) => {
                if (a.isActive) {
                    newSchedule[a.dayOfWeek] = {
                        enabled:          true,
                        startTime:        a.startTime,
                        endTime:          a.endTime,
                        slotDurationMins: a.slotDurationMins,
                    }
                }
            })
            setSchedule(newSchedule)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to load")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchAvailability() }, [fetchAvailability])

    const updateDay = (dayIndex: number, field: keyof DayConfig, value: boolean | string | number) => {
        setSchedule(prev => prev.map((day, i) =>
            i === dayIndex ? { ...day, [field]: value } : day
        ))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const saves = schedule.map(async (day, index) => {
                if (day.enabled) {
                    await fetch("/api/doctor/availability", {
                        method:  "POST",
                        headers: { "Content-Type": "application/json" },
                        body:    JSON.stringify({
                            dayOfWeek:        index,
                            startTime:        day.startTime,
                            endTime:          day.endTime,
                            slotDurationMins: day.slotDurationMins,
                        }),
                    })
                } else {
                    await fetch("/api/doctor/availability", {
                        method:  "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body:    JSON.stringify({ dayOfWeek: index }),
                    })
                }
            })

            await Promise.all(saves)
            toast.success("Availability saved")
            fetchAvailability()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to save")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader title="My Availability" />
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader title="My Availability" />
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {saving ? "Saving..." : "Save schedule"}
                </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">Weekly schedule</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Set the days and hours you are available for appointments</p>
                </div>

                <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
                    {days.map((day, index) => (
                        <div key={day} className="px-6 py-4 flex items-center gap-6">
                            <div className="w-28 flex items-center gap-3 shrink-0">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={schedule[index].enabled}
                                        onChange={e => updateDay(index, "enabled", e.target.checked)}
                                        className="peer h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 appearance-none bg-white dark:bg-zinc-800 border checked:bg-primary checked:border-primary transition-all cursor-pointer"
                                    />
                                    <svg className="absolute inset-0 h-4 w-4 pointer-events-none hidden peer-checked:block text-white" viewBox="0 0 16 16" fill="none">
                                        <path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span className={`text-sm font-medium ${schedule[index].enabled ? "text-zinc-900 dark:text-white" : "text-zinc-400"}`}>
                                    {day}
                                </span>
                            </div>

                            {schedule[index].enabled ? (
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-zinc-400">From</span>
                                        <select
                                            value={schedule[index].startTime}
                                            onChange={e => updateDay(index, "startTime", e.target.value)}
                                            className={selectClass}
                                        >
                                            {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-zinc-400">To</span>
                                        <select
                                            value={schedule[index].endTime}
                                            onChange={e => updateDay(index, "endTime", e.target.value)}
                                            className={selectClass}
                                        >
                                            {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-zinc-400">Slot</span>
                                        <select
                                            value={schedule[index].slotDurationMins}
                                            onChange={e => updateDay(index, "slotDurationMins", parseInt(e.target.value))}
                                            className={selectClass}
                                        >
                                            {durations.map(d => <option key={d} value={d}>{d} min</option>)}
                                        </select>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-xs text-zinc-300 dark:text-zinc-600">Not available</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
