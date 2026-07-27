
"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Column, DataTable } from "@/components/admin/data-table"
import { PageHeader } from "@/components/admin/page-header"
import { Pagination } from "@/components/admin/pagination"
import { Modal } from "@/components/admin/modal"
import { ConfirmModal } from "@/components/admin/confirm-modal"
import type { Drug } from "@/types"

const PAGE_SIZE = 10

const inputClass = "w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent transition-all"
const labelClass = "block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5"

const categories = [
    "Antibiotics", "Analgesics", "Antihypertensives", "Antidiabetics",
    "Antihistamines", "Antimalarials", "Vitamins & Supplements",
    "Cardiovascular", "Respiratory", "Gastrointestinal", "Other"
]

const units = ["tablet", "capsule", "syrup (ml)", "injection (vial)", "cream (tube)", "drops", "sachet"]

interface DrugForm {
    name:        string
    genericName: string
    category:    string
    unit:        string
    price:       string
    inStock:     boolean
}

const emptyForm = (): DrugForm => ({
    name: "", genericName: "", category: "", unit: "tablet", price: "", inStock: true,
})

export default function AdminDrugsPage() {
    const [drugs, setDrugs]             = useState<Drug[]>([])
    const [total, setTotal]             = useState(0)
    const [page, setPage]               = useState(1)
    const [search, setSearch]           = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [loading, setLoading]         = useState(true)
    const [formOpen, setFormOpen]       = useState(false)
    const [editDrug, setEditDrug]       = useState<Drug | null>(null)
    const [deleteDrug, setDeleteDrug]   = useState<Drug | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [form, setForm]               = useState<DrugForm>(emptyForm())
    const [saving, setSaving]           = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300)
        return () => clearTimeout(t)
    }, [search])

    useEffect(() => { setPage(1) }, [debouncedSearch])

    const fetchDrugs = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page:  String(page),
                limit: String(PAGE_SIZE),
                ...(debouncedSearch && { search: debouncedSearch }),
            })
            const res  = await fetch(`/api/admin/drugs?${params}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setDrugs(data.drugs)
            setTotal(data.total)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setLoading(false)
        }
    }, [page, debouncedSearch])

    useEffect(() => { fetchDrugs() }, [fetchDrugs])

    const openAdd = () => { setEditDrug(null); setForm(emptyForm()); setFormOpen(true) }
    const openEdit = (drug: Drug) => {
        setEditDrug(drug)
        setForm({
            name:        drug.name,
            genericName: drug.genericName ?? "",
            category:    drug.category    ?? "",
            unit:        drug.unit,
            price:       String(drug.price),
            inStock:     drug.inStock,
        })
        setFormOpen(true)
    }

    const handleSave = async () => {
        if (!form.name || !form.price) {
            toast.error("Name and price are required")
            return
        }
        setSaving(true)
        try {
            const url    = editDrug ? `/api/admin/drugs/${editDrug.id}` : "/api/admin/drugs"
            const method = editDrug ? "PATCH" : "POST"
            const res    = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(form),
            })
            if (!res.ok) throw new Error("Failed to save")
            toast.success(`Drug ${editDrug ? "updated" : "added"} successfully`)
            setFormOpen(false)
            fetchDrugs()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteDrug) return
        setDeleteLoading(true)
        try {
            const res = await fetch(`/api/admin/drugs/${deleteDrug.id}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to delete")
            toast.success("Drug deleted")
            setDeleteDrug(null)
            fetchDrugs()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setDeleteLoading(false)
        }
    }

    const columns: Column<Drug>[] = [
        {
            header: "Name",
            accessor: (row) => (
                <div>
                    <p className="font-medium text-zinc-900 dark:text-white text-xs">{row.name}</p>
                    {row.genericName && <p className="text-zinc-400 text-xs">{row.genericName}</p>}
                </div>
            ),
        },
        {
            header: "Category",
            accessor: (row) => (
                <span className="text-xs text-zinc-600 dark:text-zinc-300">{row.category ?? "—"}</span>
            ),
        },
        {
            header: "Unit",
            accessor: (row) => (
                <span className="text-xs text-zinc-500">{row.unit}</span>
            ),
        },
        {
            header: "Price (GH₵)",
            accessor: (row) => (
                <span className="text-xs font-medium text-zinc-900 dark:text-white">
                    GH₵ {row.price.toFixed(2)}
                </span>
            ),
        },
        {
            header: "Stock",
            accessor: (row) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${
                    row.inStock
                        ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                        : "bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400"
                }`}>
                    {row.inStock ? "In stock" : "Out of stock"}
                </span>
            ),
        },
        {
            header: "",
            accessor: (row) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => openEdit(row)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={() => setDeleteDrug(row)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            ),
            className: "w-20",
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Drug Catalogue ${total > 0 ? `(${total})` : ""}`}
                actions={[{ label: "Add Drug", icon: Plus, onClick: openAdd }]}
            />

            <DataTable
                data={drugs}
                columns={columns}
                loading={loading}
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search by name, generic name or category..."
                emptyMessage="No drugs in catalogue"
            />

            <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />

            <Modal
                open={formOpen}
                onClose={() => setFormOpen(false)}
                title={editDrug ? "Edit Drug" : "Add Drug"}
                size="sm"
            >
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>Brand name</label>
                        <input
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="e.g. Amoxil"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Generic name</label>
                        <input
                            value={form.genericName}
                            onChange={e => setForm(f => ({ ...f, genericName: e.target.value }))}
                            placeholder="e.g. Amoxicillin"
                            className={inputClass}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Category</label>
                            <select
                                value={form.category}
                                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                className={inputClass}
                            >
                                <option value="">Select category</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Unit</label>
                            <select
                                value={form.unit}
                                onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                                className={inputClass}
                            >
                                {units.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Price (GH₵)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.price}
                            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                            placeholder="0.00"
                            className={inputClass}
                        />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={form.inStock}
                                onChange={e => setForm(f => ({ ...f, inStock: e.target.checked }))}
                                className="peer h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 appearance-none bg-white dark:bg-zinc-800 border checked:bg-zinc-900 dark:checked:bg-white checked:border-zinc-900 transition-all cursor-pointer"
                            />
                            <svg className="absolute inset-0 h-4 w-4 pointer-events-none hidden peer-checked:block text-white dark:text-zinc-900" viewBox="0 0 16 16" fill="none">
                                <path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-sm text-zinc-600 dark:text-zinc-300">In stock</span>
                    </label>
                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={() => setFormOpen(false)}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                            {saving ? "Saving..." : editDrug ? "Save changes" : "Add drug"}
                        </button>
                    </div>
                </div>
            </Modal>

            <ConfirmModal
                open={!!deleteDrug}
                onClose={() => setDeleteDrug(null)}
                onConfirm={handleDelete}
                loading={deleteLoading}
                title="Delete Drug"
                description={`Are you sure you want to remove ${deleteDrug?.name} from the catalogue?`}
                confirmLabel="Delete"
            />
        </div>
    )
}
