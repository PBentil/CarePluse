
"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { Video, CheckCircle2, XCircle, CalendarClock, ClipboardList, FlaskConical, Pill, Loader2 } from "lucide-react"
import { Column, DataTable } from "@/components/admin/data-table"
import { PageHeader } from "@/components/admin/page-header"
import { Pagination } from "@/components/admin/pagination"
import { Modal } from "@/components/admin/modal"

interface Appointment {
    id: string; date: string; reason: string; status: string; notes?: string; diagnosis?: string
    videoRoomName?: string; rejectionReason?: string; rescheduledDate?: string
    patientId: string
    patient: { fullName: string; email: string; phone: string }
}

const PAGE_SIZE = 10
const statusStyles: Record<string, string> = {
    pending:     "bg-amber-50 text-amber-600",
    confirmed:   "bg-emerald-50 text-emerald-600",
    rejected:    "bg-red-50 text-red-500",
    rescheduled: "bg-blue-50 text-blue-600",
}
const filters = [
    { label: "All", value: "" }, { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" }, { label: "Rescheduled", value: "rescheduled" },
    { label: "Rejected", value: "rejected" },
]
const inputClass = "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
const labelClass = "block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5"
const commonTests = ["Full Blood Count (FBC)","Blood Sugar (Fasting)","Liver Function Test","Kidney Function Test","Lipid Profile","Thyroid Function Test","Urinalysis","Malaria Rapid Test","HIV Screening","Chest X-Ray","ECG"]
const frequencies = ["Once daily","Twice daily","Three times daily","Every 8 hours","Every 12 hours","As needed"]
const durations   = ["3 days","5 days","7 days","10 days","14 days","1 month","3 months","Ongoing"]

export default function DoctorAppointmentsPage() {
    const { slug } = useParams<{ slug: string }>()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [total, setTotal]               = useState(0)
    const [page, setPage]                 = useState(1)
    const [statusFilter, setStatusFilter] = useState("")
    const [loading, setLoading]           = useState(true)
    const [actionAppt, setActionAppt]     = useState<Appointment | null>(null)
    const [actionType, setActionType]     = useState<"confirm"|"reject"|"reschedule"|"notes"|"labs"|"rx"|null>(null)
    const [saving, setSaving]             = useState(false)

    const [rejectionReason, setRejectionReason]   = useState("")
    const [rescheduledDate, setRescheduledDate]   = useState("")
    const [notes, setNotes]                       = useState("")
    const [diagnosis, setDiagnosis]               = useState("")
    const [selectedTests, setSelectedTests]       = useState<string[]>([])
    const [rxItems, setRxItems]                   = useState([{ drugName: "", dosage: "", frequency: "", duration: "", price: 0, notes: "" }])

    useEffect(() => { setPage(1) }, [statusFilter])

    const fetchAppointments = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), ...(statusFilter && { status: statusFilter }) })
            const res  = await fetch(`/api/${slug}/doctor/appointments?${params}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setAppointments(data.appointments); setTotal(data.total)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setLoading(false) }
    }, [slug, page, statusFilter])

    useEffect(() => { fetchAppointments() }, [fetchAppointments])

    const openAction = (appt: Appointment, type: typeof actionType) => {
        setActionAppt(appt); setActionType(type)
        setNotes(appt.notes ?? ""); setDiagnosis(appt.diagnosis ?? "")
        setRejectionReason(""); setRescheduledDate(""); setSelectedTests([]); setRxItems([{ drugName: "", dosage: "", frequency: "", duration: "", price: 0, notes: "" }])
    }

    const handleAction = async () => {
        if (!actionAppt || !actionType) return
        setSaving(true)
        try {
            let body: any = { action: actionType }
            if (actionType === "reject")     body.rejectionReason = rejectionReason
            if (actionType === "reschedule") body.rescheduledDate = rescheduledDate
            if (actionType === "notes")      body = { action: "notes", notes, diagnosis }
            if (actionType === "labs") {
                await fetch(`/api/${slug}/doctor/lab-tests`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ appointmentId: actionAppt.id, patientId: actionAppt.patientId, testNames: selectedTests }),
                })
                toast.success(`${selectedTests.length} lab test(s) ordered`)
                setActionAppt(null); setActionType(null)
                return
            }
            if (actionType === "rx") {
                await fetch(`/api/${slug}/doctor/prescriptions`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ appointmentId: actionAppt.id, patientId: actionAppt.patientId, diagnosis, items: rxItems.filter(i => i.drugName) }),
                })
                toast.success("Prescription issued")
                setActionAppt(null); setActionType(null)
                return
            }

            const res = await fetch(`/api/${slug}/doctor/appointments/${actionAppt.id}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })
            if (!res.ok) throw new Error("Action failed")
            toast.success("Done")
            setActionAppt(null); setActionType(null)
            fetchAppointments()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setSaving(false) }
    }

    const columns: Column<Appointment>[] = [
        {
            header: "Patient",
            accessor: (row) => (
                <div>
                    <p className="font-medium text-zinc-900 text-xs">{row.patient.fullName}</p>
                    <p className="text-zinc-400 text-xs">{row.patient.phone}</p>
                </div>
            ),
        },
        {
            header: "Date",
            accessor: (row) => <span className="text-xs text-zinc-600">{new Date(row.rescheduledDate ?? row.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>,
        },
        { header: "Reason", accessor: "reason" },
        {
            header: "Status",
            accessor: (row) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize ${statusStyles[row.status] ?? ""}`}>{row.status}</span>,
        },
        {
            header: "Actions",
            accessor: (row) => (
                <div className="flex items-center gap-1">
                    {row.status === "confirmed" && row.videoRoomName && (
                        <a href={`/call/${row.videoRoomName}`} target="_blank" rel="noopener noreferrer" title="Join call" className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                            <Video className="h-3.5 w-3.5" />
                        </a>
                    )}
                    {row.status === "confirmed" && (
                        <>
                            <button onClick={() => openAction(row, "notes")} title="Notes" className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-primary hover:bg-primary/10 transition-colors"><ClipboardList className="h-3.5 w-3.5" /></button>
                            <button onClick={() => openAction(row, "labs")} title="Order lab tests" className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors"><FlaskConical className="h-3.5 w-3.5" /></button>
                            <button onClick={() => openAction(row, "rx")} title="Issue prescription" className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-purple-500 hover:bg-purple-50 transition-colors"><Pill className="h-3.5 w-3.5" /></button>
                        </>
                    )}
                    {(row.status === "pending" || row.status === "confirmed") && (
                        <button onClick={() => openAction(row, "reschedule")} title="Reschedule" className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"><CalendarClock className="h-3.5 w-3.5" /></button>
                    )}
                    {row.status === "pending" && (
                        <>
                            <button onClick={() => openAction(row, "confirm")} title="Confirm" className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors"><CheckCircle2 className="h-3.5 w-3.5" /></button>
                            <button onClick={() => openAction(row, "reject")} title="Reject" className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"><XCircle className="h-3.5 w-3.5" /></button>
                        </>
                    )}
                </div>
            ),
            className: "w-48",
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader title={`Appointments ${total > 0 ? `(${total})` : ""}`} />
            <div className="flex items-center gap-1 border-b border-zinc-100">
                {filters.map(f => (
                    <button key={f.value} onClick={() => setStatusFilter(f.value)} className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${statusFilter === f.value ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-600"}`}>{f.label}</button>
                ))}
            </div>
            <DataTable data={appointments} columns={columns} loading={loading} emptyMessage="No appointments yet" />
            <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />

            {/* Confirm modal */}
            <Modal open={actionType === "confirm"} onClose={() => setActionType(null)} title="Confirm Appointment" size="sm">
                <div className="space-y-4">
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                        <p className="text-xs font-medium text-emerald-700">{actionAppt?.patient.fullName}</p>
                        <p className="text-xs text-emerald-600">{actionAppt && new Date(actionAppt.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</p>
                    </div>
                    <p className="text-sm text-zinc-500">A video room will be created and the patient will be notified.</p>
                    <div className="flex gap-2">
                        <button onClick={() => setActionType(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors">Cancel</button>
                        <button onClick={handleAction} disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-50 transition-colors">
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Confirm & create room
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Reject modal */}
            <Modal open={actionType === "reject"} onClose={() => setActionType(null)} title="Reject Appointment" size="sm">
                <div className="space-y-4">
                    <div><label className={labelClass}>Reason</label><textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} rows={3} className={inputClass} placeholder="e.g. Unavailable on this date..." /></div>
                    <div className="flex gap-2">
                        <button onClick={() => setActionType(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors">Cancel</button>
                        <button onClick={handleAction} disabled={saving || !rejectionReason.trim()} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50 transition-colors">
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Reject
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Reschedule modal */}
            <Modal open={actionType === "reschedule"} onClose={() => setActionType(null)} title="Reschedule Appointment" size="sm">
                <div className="space-y-4">
                    <div><label className={labelClass}>New date & time</label><input type="datetime-local" value={rescheduledDate} onChange={e => setRescheduledDate(e.target.value)} className={inputClass} min={new Date().toISOString().slice(0, 16)} /></div>
                    <div className="flex gap-2">
                        <button onClick={() => setActionType(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors">Cancel</button>
                        <button onClick={handleAction} disabled={saving || !rescheduledDate} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium disabled:opacity-50 transition-colors">
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Reschedule
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Notes modal */}
            <Modal open={actionType === "notes"} onClose={() => setActionType(null)} title="Consultation Notes" size="sm">
                <div className="space-y-4">
                    <div><label className={labelClass}>Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className={inputClass} placeholder="Consultation notes..." /></div>
                    <div><label className={labelClass}>Diagnosis</label><textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} rows={2} className={inputClass} placeholder="e.g. Hypertension..." /></div>
                    <div className="flex gap-2">
                        <button onClick={() => setActionType(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors">Cancel</button>
                        <button onClick={handleAction} disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-medium disabled:opacity-50 transition-colors">
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save notes
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Lab tests modal */}
            <Modal open={actionType === "labs"} onClose={() => setActionType(null)} title="Order Lab Tests" size="sm">
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {commonTests.map(test => (
                            <button key={test} type="button" onClick={() => setSelectedTests(prev => prev.includes(test) ? prev.filter(t => t !== test) : [...prev, test])}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedTests.includes(test) ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}>
                                {test}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setActionType(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors">Cancel</button>
                        <button onClick={handleAction} disabled={saving || !selectedTests.length} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-50 transition-colors">
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Order ({selectedTests.length})
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Prescription modal */}
            <Modal open={actionType === "rx"} onClose={() => setActionType(null)} title="Issue Prescription" size="xl">
                <div className="space-y-4">
                    {rxItems.map((item, i) => (
                        <div key={i} className="rounded-xl border border-zinc-100 p-4 grid grid-cols-3 gap-3">
                            <div><label className={labelClass}>Drug</label><input value={item.drugName} onChange={e => setRxItems(prev => prev.map((it, idx) => idx === i ? { ...it, drugName: e.target.value } : it))} className={inputClass} placeholder="e.g. Amoxil" /></div>
                            <div><label className={labelClass}>Dosage</label><input value={item.dosage} onChange={e => setRxItems(prev => prev.map((it, idx) => idx === i ? { ...it, dosage: e.target.value } : it))} className={inputClass} placeholder="500mg" /></div>
                            <div><label className={labelClass}>Price (GH₵)</label><input type="number" value={item.price} onChange={e => setRxItems(prev => prev.map((it, idx) => idx === i ? { ...it, price: parseFloat(e.target.value) || 0 } : it))} className={inputClass} /></div>
                            <div><label className={labelClass}>Frequency</label><select value={item.frequency} onChange={e => setRxItems(prev => prev.map((it, idx) => idx === i ? { ...it, frequency: e.target.value } : it))} className={inputClass}><option value="">Select</option>{frequencies.map(f => <option key={f} value={f}>{f}</option>)}</select></div>
                            <div><label className={labelClass}>Duration</label><select value={item.duration} onChange={e => setRxItems(prev => prev.map((it, idx) => idx === i ? { ...it, duration: e.target.value } : it))} className={inputClass}><option value="">Select</option>{durations.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                            <div className="flex items-end"><button onClick={() => setRxItems(prev => prev.filter((_, idx) => idx !== i))} className="text-xs text-red-500 hover:underline">Remove</button></div>
                        </div>
                    ))}
                    <button onClick={() => setRxItems(prev => [...prev, { drugName: "", dosage: "", frequency: "", duration: "", price: 0, notes: "" }])} className="w-full px-4 py-2 rounded-xl border border-dashed border-zinc-200 text-sm text-zinc-400 hover:text-zinc-600 hover:border-zinc-300 transition-colors">+ Add drug</button>
                    <div className="flex gap-2">
                        <button onClick={() => setActionType(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors">Cancel</button>
                        <button onClick={handleAction} disabled={saving || !rxItems.some(i => i.drugName)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium disabled:opacity-50 transition-colors">
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Issue prescription
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
