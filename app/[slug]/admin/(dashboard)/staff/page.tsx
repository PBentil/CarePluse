
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

interface StaffMember {
    id: string; name: string; email: string; role: string; isActive: boolean; createdAt: string
}

const PAGE_SIZE = 10
const roles = ["hospital_admin", "nurse", "receptionist", "pharmacist"]
const inputClass = "w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
const labelClass = "block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5"

const roleColors: Record<string, string> = {
    hospital_admin: "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
    nurse:          "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
    receptionist:   "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
    pharmacist:     "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
}

export default function HospitalStaffPage() {
    const { slug } = useParams<{ slug: string }>()
    const [staff, setStaff]           = useState<StaffMember[]>([])
    const [total, setTotal]           = useState(0)
    const [page, setPage]             = useState(1)
    const [loading, setLoading]       = useState(true)
    const [formOpen, setFormOpen]     = useState(false)
    const [editMember, setEditMember] = useState<StaffMember | null>(null)
    const [deleteMember, setDeleteMember] = useState<StaffMember | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [saving, setSaving]         = useState(false)
    const [form, setForm]             = useState({ name: "", email: "", role: "nurse", password: "" })

    const fetchStaff = useCallback(async () => {
        setLoading(true)
        try {
            const res  = await fetch(`/api/${slug}/admin/staff?page=${page}&limit=${PAGE_SIZE}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setStaff(data.staff)
            setTotal(data.total)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setLoading(false) }
    }, [slug, page])

    useEffect(() => { fetchStaff() }, [fetchStaff])

    const openAdd  = () => { setEditMember(null); setForm({ name: "", email: "", role: "nurse", password: "" }); setFormOpen(true) }
    const openEdit = (m: StaffMember) => { setEditMember(m); setForm({ name: m.name, email: m.email, role: m.role, password: "" }); setFormOpen(true) }

    const handleSave = async () => {
        if (!form.name || !form.email) { toast.error("Name and email are required"); return }
        setSaving(true)
        try {
            const url    = editMember ? `/api/${slug}/admin/staff/${editMember.id}` : `/api/${slug}/admin/staff`
            const method = editMember ? "PATCH" : "POST"
            const res    = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
            if (!res.ok) throw new Error((await res.json()).error)
            toast.success(`Staff member ${editMember ? "updated" : "added"}`)
            setFormOpen(false)
            fetchStaff()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setSaving(false) }
    }

    const handleDelete = async () => {
        if (!deleteMember) return
        setDeleteLoading(true)
        try {
            await fetch(`/api/${slug}/admin/staff/${deleteMember.id}`, { method: "DELETE" })
            toast.success("Staff member removed")
            setDeleteMember(null)
            fetchStaff()
        } catch { toast.error("Failed to delete") } finally { setDeleteLoading(false) }
    }

    const columns: Column<StaffMember>[] = [
        {
            header: "Name",
            accessor: (row) => (
                <div>
                    <p className="font-medium text-zinc-900 dark:text-white text-xs">{row.name}</p>
                    <p className="text-zinc-400 text-xs">{row.email}</p>
                </div>
            ),
        },
        {
            header: "Role",
            accessor: (row) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize ${roleColors[row.role] ?? "bg-zinc-100 text-zinc-600"}`}>
                    {row.role.replace("_", " ")}
                </span>
            ),
        },
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
                    <button onClick={() => openEdit(row)} className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setDeleteMember(row)} className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            ),
            className: "w-20",
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader title={`Staff ${total > 0 ? `(${total})` : ""}`} actions={[{ label: "Add Staff", icon: Plus, onClick: openAdd }]} />
            <DataTable data={staff} columns={columns} loading={loading} emptyMessage="No staff members yet" />
            <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />

            <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editMember ? "Edit Staff Member" : "Add Staff Member"} size="sm">
                <div className="space-y-4">
                    <div><label className={labelClass}>Full name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ama Owusu" className={inputClass} /></div>
                    <div><label className={labelClass}>Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="ama@hospital.com" className={inputClass} /></div>
                    <div>
                        <label className={labelClass}>Role</label>
                        <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className={inputClass}>
                            {roles.map(r => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                        </select>
                    </div>
                    <div><label className={labelClass}>Password {editMember && <span className="normal-case font-normal text-zinc-400">(leave blank to keep)</span>}</label><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" className={inputClass} /></div>
                    <div className="flex gap-2 pt-2">
                        <button onClick={() => setFormOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
                        <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">{saving ? "Saving..." : editMember ? "Save changes" : "Add staff"}</button>
                    </div>
                </div>
            </Modal>

            <ConfirmModal open={!!deleteMember} onClose={() => setDeleteMember(null)} onConfirm={handleDelete} loading={deleteLoading} title="Remove Staff Member" description={`Remove ${deleteMember?.name} from the system?`} confirmLabel="Remove" />
        </div>
    )
}
