
"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, Plus, X, FlaskConical } from "lucide-react"
import { Modal } from "@/components/admin/modal"

interface OrderLabTestsProps {
    appointmentId: string
    patientId:     string
    patientName:   string
    onSuccess:     () => void
}

const commonTests = [
    "Full Blood Count (FBC)",
    "Blood Sugar (Fasting)",
    "Liver Function Test (LFT)",
    "Kidney Function Test (KFT)",
    "Lipid Profile",
    "Thyroid Function Test (TFT)",
    "Urinalysis",
    "Malaria Rapid Test",
    "HIV Screening",
    "Hepatitis B & C Screening",
    "Chest X-Ray",
    "ECG",
]

const inputClass = "w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent transition-all"
const labelClass = "block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5"

export function OrderLabTests({ appointmentId, patientId, patientName, onSuccess }: OrderLabTestsProps) {
    const [open, setOpen]           = useState(false)
    const [selected, setSelected]   = useState<string[]>([])
    const [custom, setCustom]       = useState("")
    const [loading, setLoading]     = useState(false)

    const toggleTest = (test: string) => {
        setSelected(prev =>
            prev.includes(test) ? prev.filter(t => t !== test) : [...prev, test]
        )
    }

    const addCustom = () => {
        if (!custom.trim()) return
        if (!selected.includes(custom.trim())) {
            setSelected(prev => [...prev, custom.trim()])
        }
        setCustom("")
    }

    const handleSubmit = async () => {
        if (!selected.length) {
            toast.error("Please select at least one test")
            return
        }

        setLoading(true)
        try {
            const res = await fetch("/api/doctor/lab-tests", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ appointmentId, patientId, testNames: selected }),
            })

            if (!res.ok) throw new Error("Failed to order lab tests")

            toast.success(`${selected.length} lab test${selected.length > 1 ? "s" : ""} ordered`)
            setSelected([])
            setOpen(false)
            onSuccess()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                title="Order lab tests"
                className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
            >
                <FlaskConical className="h-3.5 w-3.5" />
            </button>

            <Modal open={open} onClose={() => setOpen(false)} title="Order Lab Tests" size="sm">
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>Patient</label>
                        <p className="text-sm text-zinc-700 dark:text-zinc-200">{patientName}</p>
                    </div>

                    <div>
                        <label className={labelClass}>Common tests</label>
                        <div className="flex flex-wrap gap-2">
                            {commonTests.map(test => (
                                <button
                                    key={test}
                                    type="button"
                                    onClick={() => toggleTest(test)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                        selected.includes(test)
                                            ? "bg-emerald-600 text-white"
                                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                    }`}
                                >
                                    {test}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Add custom test</label>
                        <div className="flex gap-2">
                            <input
                                value={custom}
                                onChange={e => setCustom(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && addCustom()}
                                placeholder="e.g. Sickle Cell Test"
                                className={inputClass}
                            />
                            <button
                                type="button"
                                onClick={addCustom}
                                className="h-10 w-10 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {selected.length > 0 && (
                        <div>
                            <label className={labelClass}>Selected ({selected.length})</label>
                            <div className="space-y-1">
                                {selected.map(test => (
                                    <div key={test} className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                                        <span className="text-xs text-zinc-700 dark:text-zinc-200">{test}</span>
                                        <button
                                            type="button"
                                            onClick={() => toggleTest(test)}
                                            className="text-zinc-400 hover:text-red-500 transition-colors"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
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
                            disabled={loading || !selected.length}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-50 transition-colors"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Order {selected.length > 0 ? `(${selected.length})` : ""}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
