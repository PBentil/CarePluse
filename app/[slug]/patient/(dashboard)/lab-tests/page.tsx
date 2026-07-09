
"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { Upload, ExternalLink, Plus, X } from "lucide-react"
import { Column, DataTable } from "@/components/admin/data-table"
import { PageHeader } from "@/components/admin/page-header"
import { Modal } from "@/components/admin/modal"

interface LabTest {
    id: string; testName: string; status: string; orderedAt: string; resultNotes?: string; resultUrl?: string
    doctor?: { name: string }
}

const statusStyles: Record<string, string> = {
    ordered:    "bg-amber-50 text-amber-600",
    processing: "bg-blue-50 text-blue-600",
    completed:  "bg-emerald-50 text-emerald-600",
}

const inputClass = "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
const labelClass = "block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5"

export default function PatientLabTestsPage() {
    const { slug } = useParams<{ slug: string }>()
    const [labTests, setLabTests]     = useState<LabTest[]>([])
    const [loading, setLoading]       = useState(true)
    const [selected, setSelected]     = useState<LabTest | null>(null)
    const [uploadOpen, setUploadOpen] = useState(false)
    const [file, setFile]             = useState<File | null>(null)
    const [testName, setTestName]     = useState("")
    const [resultNotes, setResultNotes] = useState("")
    const [saving, setSaving]         = useState(false)
    const fileRef                     = useRef<HTMLInputElement>(null)

    const fetchLabTests = useCallback(async () => {
        setLoading(true)
        try {
            const res  = await fetch(`/api/${slug}/patient/lab-tests`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setLabTests(data.labTests)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setLoading(false) }
    }, [slug])

    useEffect(() => { fetchLabTests() }, [fetchLabTests])

    const handleUpload = async () => {
        if (!file) { toast.error("Please select a file"); return }
        if (!selected && !testName.trim()) { toast.error("Please enter the test name"); return }
        setSaving(true)
        try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("resultNotes", resultNotes)
            if (selected) formData.append("labTestId", selected.id)
            else formData.append("testName", testName)

            const res = await fetch(`/api/${slug}/patient/lab-tests/upload`, { method: "POST", body: formData })
            if (!res.ok) throw new Error((await res.json()).error)
            toast.success("Results uploaded")
            setSelected(null); setUploadOpen(false); setFile(null); setTestName(""); setResultNotes("")
            fetchLabTests()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setSaving(false) }
    }

    const columns: Column<LabTest>[] = [
        { header: "Test", accessor: (row) => <p className="font-medium text-zinc-900 text-xs">{row.testName}</p> },
        { header: "Doctor", accessor: (row) => <span className="text-xs text-zinc-500">{row.doctor?.name ?? "Self-uploaded"}</span> },
        { header: "Date", accessor: (row) => <span className="text-xs text-zinc-500">{new Date(row.orderedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span> },
        { header: "Status", accessor: (row) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize ${statusStyles[row.status] ?? ""}`}>{row.status}</span> },
        {
            header: "Results",
            accessor: (row) => {
                if (row.status === "completed") {
                    return (
                        <div className="space-y-1">
                            {row.resultNotes && <p className="text-xs text-zinc-500">{row.resultNotes}</p>}
                            {row.resultUrl && (
                                <a href={row.resultUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                                    View file <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                    )
                }
                if (row.status === "ordered") {
                    return (
                        <button onClick={() => { setSelected(row); setUploadOpen(true) }} className="text-xs text-primary hover:underline">Upload results</button>
                    )
                }
                return <span className="text-xs text-zinc-300">Processing</span>
            },
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader title="My Lab Tests" />
                <button onClick={() => { setSelected(null); setUploadOpen(true) }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
                    <Plus className="h-4 w-4" /> Upload my results
                </button>
            </div>
            <DataTable data={labTests} columns={columns} loading={loading} emptyMessage="No lab tests yet" />

            <Modal open={uploadOpen} onClose={() => { setUploadOpen(false); setFile(null); setSelected(null) }} title={selected ? `Upload results — ${selected.testName}` : "Upload lab results"} size="sm">
                <div className="space-y-4">
                    {!selected && (
                        <div><label className={labelClass}>Test name</label><input value={testName} onChange={e => setTestName(e.target.value)} placeholder="e.g. Full Blood Count" className={inputClass} /></div>
                    )}
                    <div>
                        <label className={labelClass}>Result file (PDF or image)</label>
                        <div onClick={() => fileRef.current?.click()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${file ? "border-emerald-300 bg-emerald-50" : "border-zinc-200 hover:border-zinc-300"}`}>
                            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
                            {file ? (
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-xs text-emerald-700 font-medium">{file.name}</span>
                                    <button type="button" onClick={e => { e.stopPropagation(); setFile(null) }} className="text-zinc-400 hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <Upload className="h-6 w-6 text-zinc-300 mx-auto" />
                                    <p className="text-xs text-zinc-400">Click to upload PDF or image</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div><label className={labelClass}>Notes (optional)</label><textarea value={resultNotes} onChange={e => setResultNotes(e.target.value)} rows={3} className={inputClass} placeholder="Any notes..." /></div>
                    <div className="flex gap-2">
                        <button onClick={() => { setUploadOpen(false); setFile(null) }} className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors">Cancel</button>
                        <button onClick={handleUpload} disabled={saving || !file} className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-50 transition-colors">{saving ? "Uploading..." : "Upload"}</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
