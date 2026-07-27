
"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, ClipboardList } from "lucide-react"
import { Modal } from "@/components/admin/modal"
import type { Appointment } from "@/types"

interface ConsultationNotesProps {
    appointment: Appointment
    onSuccess: () => void
}

const inputClass = "w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent transition-all"
const labelClass = "block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5"

export function ConsultationNotes({ appointment, onSuccess }: ConsultationNotesProps) {
    const [open, setOpen]                   = useState(false)
    const [notes, setNotes]                 = useState((appointment as any).notes ?? "")
    const [diagnosis, setDiagnosis]         = useState((appointment as any).diagnosis ?? "")
    const [requiresLabTest, setRequiresLabTest] = useState((appointment as any).requiresLabTest ?? false)
    const [loading, setLoading]             = useState(false)

    const handleSubmit = async () => {
        if (!notes.trim()) {
            toast.error("Please add consultation notes")
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`/api/doctor/appointments/${appointment.id}`, {
                method:  "PATCH",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ action: "notes", notes, diagnosis, requiresLabTest }),
            })

            if (!res.ok) throw new Error("Failed to save notes")

            toast.success("Consultation notes saved")
            setOpen(false)
            onSuccess()
        } catch (error: any) {
            toast.error(error.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                title="Consultation notes"
                className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-primary hover:bg-primary/10 transition-colors"
            >
                <ClipboardList className="h-3.5 w-3.5" />
            </button>

            <Modal open={open} onClose={() => setOpen(false)} title="Consultation Notes" size="sm">
                <div className="space-y-4">

                    <div>
                        <label className={labelClass}>Patient</label>
                        <p className="text-sm text-zinc-700 dark:text-zinc-200">{appointment.patient.fullName}</p>
                    </div>

                    <div>
                        <label className={labelClass}>Notes</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Describe the consultation, symptoms discussed, findings..."
                            rows={4}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Diagnosis</label>
                        <textarea
                            value={diagnosis}
                            onChange={e => setDiagnosis(e.target.value)}
                            placeholder="e.g. Hypertension, Type 2 Diabetes..."
                            rows={2}
                            className={inputClass}
                        />
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={requiresLabTest}
                                onChange={e => setRequiresLabTest(e.target.checked)}
                                className="peer h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 appearance-none bg-white dark:bg-zinc-800 border checked:bg-zinc-900 dark:checked:bg-white checked:border-zinc-900 dark:checked:border-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:ring-offset-1"
                            />
                            <svg
                                className="absolute inset-0 h-4 w-4 pointer-events-none hidden peer-checked:block text-white dark:text-zinc-900"
                                viewBox="0 0 16 16"
                                fill="none"
                            >
                                <path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-sm text-zinc-600 dark:text-zinc-300">Lab tests required</span>
                    </label>

                    {requiresLabTest && (
                        <div className="rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 p-3">
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                                Lab tests will be ordered for this patient after saving these notes.
                            </p>
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={() => setOpen(false)}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !notes.trim()}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium disabled:opacity-50 transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-100"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Save notes
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
