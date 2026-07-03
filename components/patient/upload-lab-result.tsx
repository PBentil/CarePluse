
"use client"

import { useState, useRef } from "react"
import { toast } from "sonner"
import { Loader2, Upload, Plus, X } from "lucide-react"
import { Modal } from "@/components/admin/modal"
import type { LabTest } from "@/types"

interface UploadLabResultProps {
    labTest?:  LabTest
    onSuccess: () => void
}

const inputClass = "w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent transition-all"
const labelClass = "block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5"

export function UploadLabResult({ labTest, onSuccess }: UploadLabResultProps) {
    const [open, setOpen]               = useState(false)
    const [file, setFile]               = useState<File | null>(null)
    const [testName, setTestName]       = useState("")
    const [resultNotes, setResultNotes] = useState("")
    const [loading, setLoading]         = useState(false)
    const fileRef                       = useRef<HTMLInputElement>(null)

    const handleSubmit = async () => {
        if (!file) {
            toast.error("Please select a file")
            return
        }
        if (!labTest && !testName.trim()) {
            toast.error("Please enter the test name")
            return
        }

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("resultNotes", resultNotes)

            if (labTest) {
                formData.append("labTestId", labTest.id)
            } else {
                formData.append("testName", testName)
            }

            const res = await fetch("/api/patient/lab-tests/upload", {
                method: "POST",
                body:   formData,
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Upload failed")

            toast.success("Results uploaded successfully")
            setOpen(false)
            setFile(null)
            setTestName("")
            setResultNotes("")
            onSuccess()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {labTest ? (
                <button
                    onClick={() => setOpen(true)}
                    className="text-xs text-primary hover:underline"
                >
                    Upload results
                </button>
            ) : (
                <button
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Upload my results
                </button>
            )}

            <Modal
                open={open}
                onClose={() => { setOpen(false); setFile(null) }}
                title={labTest ? `Upload results — ${labTest.testName}` : "Upload lab results"}
                size="sm"
            >
                <div className="space-y-4">
                    {!labTest && (
                        <div>
                            <label className={labelClass}>Test name</label>
                            <input
                                value={testName}
                                onChange={e => setTestName(e.target.value)}
                                placeholder="e.g. Full Blood Count"
                                className={inputClass}
                            />
                        </div>
                    )}

                    <div>
                        <label className={labelClass}>Result file (PDF or image)</label>
                        <div
                            onClick={() => fileRef.current?.click()}
                            className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                                file
                                    ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950"
                                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                            }`}
                        >
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={e => setFile(e.target.files?.[0] ?? null)}
                            />
                            {file ? (
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={e => { e.stopPropagation(); setFile(null) }}
                                        className="text-zinc-400 hover:text-red-500"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <Upload className="h-6 w-6 text-zinc-300 mx-auto" />
                                    <p className="text-xs text-zinc-400">Click to select a PDF or image</p>
                                    <p className="text-xs text-zinc-300">Max 10MB</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Notes (optional)</label>
                        <textarea
                            value={resultNotes}
                            onChange={e => setResultNotes(e.target.value)}
                            placeholder="Any notes about these results..."
                            rows={3}
                            className={inputClass}
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={() => { setOpen(false); setFile(null) }}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !file}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-medium disabled:opacity-50 transition-colors"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {loading ? "Uploading..." : "Upload"}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
