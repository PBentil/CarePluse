
"use client"
import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Column, DataTable } from "@/components/admin/data-table"
import { PageHeader } from "@/components/admin/page-header"
import { Pagination } from "@/components/admin/pagination"
import { Modal } from "@/components/admin/modal"
import { ConfirmModal } from "@/components/admin/confirm-modal"

interface Doctor {
    id: string; name: string; specialty: string; email: string; isActive: boolean; createdAt: string
}

const PAGE_SIZE = 10
const inputClass = "w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
const labelClass = "block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5"
const specializations = ["General Practitioner","Cardiologist","Dermatologist","Neurologist","Pediatrician","Psychiatrist","Orthopedic Surgeon","Gynecologist","Oncologist","Radiologist"]

export default function HospitalDoctorsPage() {
    const { slug } = useParams<{ slug: string }>()
    const [doctors, setDoctors]         = useState<Doctor[]>([])
    const [total, setTotal]             = useState(0)
    const [page, setPage]               = useState(1)
    const [search, setSearch]           = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [loading, setLoading]         = useState(true)
    const [formOpen, setFormOpen]       = useState(false)
    const [editDoctor, setEditDoctor]   = useState<Doctor | null>(null)
    const [deleteDoctor, setDeleteDoctor] = useState<Doctor | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [saving, setSaving]           = useState(false)
    const [form, setForm]               = useState({ name: "", specialty: "", email: "", password: "" })

    useEffect(() => { const t = setTimeout(() => setDebouncedSearch(search), 300); return () => clearTimeout(t) }, [search])
    useEffect(() => { setPage(1) }, [debouncedSearch])

    const fetchDoctors = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), ...(debouncedSearch && { search: debouncedSearch }) })
            const res  = await fetch(`/api/${slug}/admin/doctors?${params}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setDoctors(data.doctors)
            setTotal(data.total)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setLoading(false) }
    }, [slug, page, debouncedSearch])

    useEffect(() => { fetchDoctors() }, [fetchDoctors])

    const openAdd  = () => { setEditDoctor(null); setForm({ name: "", specialty: "", email: "", password: "" }); setFormOpen(true) }
    const openEdit = (d: Doctor) => { setEditDoctor(d); setForm({ name: d.name, specialty: d.specialty, email: d.email, password: "" }); setFormOpen(true) }

    const handleSave = async () => {
        if (!form.name || !form.email) { toast.error("Name and email are required"); return }
        if (!editDoctor && !form.password) { toast.error("Password is required"); return }
        setSaving(true)
        try {
            const url    = editDoctor ? `/api/${slug}/admin/doctors/${editDoctor.id}` : `/api/${slug}/admin/doctors`
            const method = editDoctor ? "PATCH" : "POST"
            const payload = { ...form }
            if (editDoctor && !payload.password) delete (payload as any).password
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
            if (!res.ok) throw new Error((await res.json()).error)
            toast.success(`Doctor ${editDoctor ? "updated" : "added"}`)
            setFormOpen(false)
            fetchDoctors()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setSaving(false) }
    }

    const handleDelete = async () => {
        if (!deleteDoctor) return
        setDeleteLoading(true)
        try {
            await fetch(`/api/${slug}/admin/doctors/${deleteDoctor.id}`, { method: "DELETE" })
            toast.success("Doctor removed")
            setDeleteDoctor(null)
            fetchDoctors()
        } catch { toast.error("Failed to delete") } finally { setDeleteLoading(false) }
    }

    const columns: Column<Doctor>[] = [
        {
            header: "Name",
            accessor: (row) => (
                <div>
                    <p className="font-medium text-zinc-900 dark:text-white text-xs">{row.name}</p>
                    <p className="text-zinc-400 text-xs">{row.email}</p>
                </div>
            ),
        },
        { header: "Specialty", accessor: "specialty" },
        {
            header: "Status",
            accessor: (row) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${row.isActive ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400" : "bg-red-50 dark:bg-red-950 text-red-500"}`}>
                    {row.isActive ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            header: "",
            accessor: (row) => (
                <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(row)} className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setDeleteDoctor(row)} className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
            ),
            className: "w-20",
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader title={`Doctors ${total > 0 ? `(${total})` : ""}`} actions={[{ label: "Add Doctor", icon: Plus, onClick: openAdd }]} />
            <DataTable data={doctors} columns={columns} loading={loading} searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search doctors..." emptyMessage="No doctors yet" />
            <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />

            <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editDoctor ? "Edit Doctor" : "Add Doctor"} size="sm">
                <div className="space-y-4">
                    <div><label className={labelClass}>Full name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Dr. Kwame Mensah" className={inputClass} /></div>
                    <div>
                        <label className={labelClass}>Specialization</label>
                        <select value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} className={inputClass}>
                            <option value="">Select specialization</option>
                            {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div><label className={labelClass}>Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="dr.mensah@hospital.com" className={inputClass} /></div>
                    <div><label className={labelClass}>Password {editDoctor && <span className="normal-case font-normal text-zinc-400">(leave blank to keep)</span>}</label><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 8 characters" className={inputClass} /></div>
                    <div className="flex gap-2 pt-2">
                        <button onClick={() => setFormOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
                        <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">{saving ? "Saving..." : editDoctor ? "Save changes" : "Add doctor"}</button>
                    </div>
                </div>
            </Modal>

            <ConfirmModal open={!!deleteDoctor} onClose={() => setDeleteDoctor(null)} onConfirm={handleDelete} loading={deleteLoading} title="Remove Doctor" description={`Remove Dr. ${deleteDoctor?.name}?`} confirmLabel="Remove" />
        </div>
    )
}
