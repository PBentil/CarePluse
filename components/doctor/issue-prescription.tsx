
"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { Loader2, Plus, X, Pill, Search } from "lucide-react"
import { Modal } from "@/components/admin/modal"
import type { Drug } from "@/types"

interface PrescriptionItem {
    drugId:    string
    drugName:  string
    dosage:    string
    frequency: string
    duration:  string
    price:     number
    notes:     string
}

interface IssuePrescriptionProps {
    appointmentId: string
    patientId:     string
    patientName:   string
    diagnosis?:    string
    onSuccess:     () => void
}

const inputClass = "w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent transition-all"
const labelClass = "block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5"

const frequencies = ["Once daily", "Twice daily", "Three times daily", "Every 8 hours", "Every 12 hours", "As needed"]
const durations   = ["3 days", "5 days", "7 days", "10 days", "14 days", "1 month", "3 months", "Ongoing"]

const emptyItem = (): PrescriptionItem => ({
    drugId: "", drugName: "", dosage: "", frequency: "", duration: "", price: 0, notes: "",
})

function DrugSearch({ onSelect }: { onSelect: (drug: Drug) => void }) {
    const [query, setQuery]     = useState("")
    const [results, setResults] = useState<Drug[]>([])
    const [open, setOpen]       = useState(false)
    const ref                   = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!query.trim()) { setResults([]); return }
        const t = setTimeout(async () => {
            const res  = await fetch(`/api/doctor/drugs?search=${encodeURIComponent(query)}`)
            const data = await res.json()
            setResults(data.drugs ?? [])
            setOpen(true)
        }, 300)
        return () => clearTimeout(t)
    }, [query])

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    return (
        <div ref={ref} className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search drug catalogue..."
                    className="pl-8 pr-4 py-2.5 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                />
            </div>
            {open && results.length > 0 && (
                <div className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-lg overflow-hidden">
                    {results.map(drug => (
                        <button
                            key={drug.id}
                            type="button"
                            onClick={() => { onSelect(drug); setQuery(""); setOpen(false) }}
                            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-50 dark:border-zinc-800 last:border-0"
                        >
                            <div>
                                <p className="text-sm font-medium text-zinc-900 dark:text-white">{drug.name}</p>
                                {drug.genericName && <p className="text-xs text-zinc-400">{drug.genericName}</p>}
                            </div>
                            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300 shrink-0 ml-4">
                                GH₵ {drug.price.toFixed(2)}
                            </p>
                        </button>
                    ))}
                </div>
            )}
            {open && query && results.length === 0 && (
                <div className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 p-4 text-center">
                    <p className="text-xs text-zinc-400">No drugs found for "{query}"</p>
                </div>
            )}
        </div>
    )
}

export function IssuePrescription({ appointmentId, patientId, patientName, diagnosis, onSuccess }: IssuePrescriptionProps) {
    const [open, setOpen]       = useState(false)
    const [items, setItems]     = useState<PrescriptionItem[]>([])
    const [notes, setNotes]     = useState("")
    const [loading, setLoading] = useState(false)

    const addDrug = (drug: Drug) => {
        if (items.find(i => i.drugId === drug.id)) {
            toast.error("Drug already added")
            return
        }
        setItems(prev => [...prev, {
            drugId:    drug.id,
            drugName:  drug.name,
            dosage:    "",
            frequency: "",
            duration:  "",
            price:     drug.price,
            notes:     "",
        }])
    }

    const updateItem = (index: number, field: keyof PrescriptionItem, value: string | number) => {
        setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
    }

    const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index))

    const total = items.reduce((sum, item) => sum + (item.price || 0), 0)

    const handleSubmit = async () => {
        const validItems = items.filter(i => i.drugName && i.dosage && i.frequency && i.duration)
        if (!validItems.length) {
            toast.error("Add at least one drug with all details filled in")
            return
        }

        setLoading(true)
        try {
            const res = await fetch("/api/doctor/prescriptions", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ appointmentId, patientId, diagnosis, notes, items: validItems }),
            })

            if (!res.ok) throw new Error("Failed to issue prescription")

            toast.success("Prescription issued successfully")
            setItems([])
            setNotes("")
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
                title="Issue prescription"
                className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors"
            >
                <Pill className="h-3.5 w-3.5" />
            </button>

            <Modal open={open} onClose={() => setOpen(false)} title="Issue Prescription" size="xl">
                <div className="space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">{patientName}</p>
                            {diagnosis && <p className="text-xs text-zinc-400 mt-0.5">{diagnosis}</p>}
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-zinc-400">Total</p>
                            <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                                GH₵ {total.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <DrugSearch onSelect={addDrug} />

                    {items.length === 0 && (
                        <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 p-6 text-center">
                            <Pill className="h-6 w-6 text-zinc-300 mx-auto mb-2" />
                            <p className="text-xs text-zinc-400">Search and select drugs from the catalogue above</p>
                        </div>
                    )}

                    {items.length > 0 && (
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={item.drugId} className="rounded-xl border border-zinc-100 dark:border-zinc-800 p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-white">{item.drugName}</p>
                                            <p className="text-xs text-zinc-400">GH₵ {item.price.toFixed(2)} per {items[index].drugName}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="text-zinc-300 hover:text-red-500 transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className={labelClass}>Dosage</label>
                                            <input
                                                value={item.dosage}
                                                onChange={e => updateItem(index, "dosage", e.target.value)}
                                                placeholder="e.g. 500mg"
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Frequency</label>
                                            <select
                                                value={item.frequency}
                                                onChange={e => updateItem(index, "frequency", e.target.value)}
                                                className={inputClass}
                                            >
                                                <option value="">Select</option>
                                                {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Duration</label>
                                            <select
                                                value={item.duration}
                                                onChange={e => updateItem(index, "duration", e.target.value)}
                                                className={inputClass}
                                            >
                                                <option value="">Select</option>
                                                {durations.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Notes</label>
                                        <input
                                            value={item.notes}
                                            onChange={e => updateItem(index, "notes", e.target.value)}
                                            placeholder="e.g. Take after meals"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div>
                        <label className={labelClass}>Additional notes</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Any additional instructions for the patient..."
                            rows={2}
                            className={inputClass}
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={() => setOpen(false)}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !items.length}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium disabled:opacity-50 transition-colors"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Issue prescription
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
