
"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { PageHeader } from "@/components/admin/page-header"
import { Loader2 } from "lucide-react"

const inputClass = "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
const labelClass = "block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5"

export default function DoctorSettingsPage() {
    const { slug }  = useParams<{ slug: string }>()
    const [current, setCurrent]   = useState("")
    const [newPw, setNewPw]       = useState("")
    const [confirm, setConfirm]   = useState("")
    const [saving, setSaving]     = useState(false)

    const handleSubmit = async () => {
        if (!current || !newPw || !confirm) { toast.error("All fields required"); return }
        if (newPw !== confirm) { toast.error("Passwords do not match"); return }
        if (newPw.length < 8) { toast.error("Password must be at least 8 characters"); return }
        setSaving(true)
        try {
            const res = await fetch(`/api/${slug}/doctor/change-password`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword: current, newPassword: newPw }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success("Password updated")
            setCurrent(""); setNewPw(""); setConfirm("")
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setSaving(false) }
    }

    return (
        <div className="max-w-md space-y-6">
            <PageHeader title="Settings" />
            <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
                <div>
                    <h3 className="text-sm font-medium text-zinc-900">Change password</h3>
                    <p className="text-xs text-zinc-400 mt-1">Update your login password</p>
                </div>
                <div><label className={labelClass}>Current password</label><input type="password" value={current} onChange={e => setCurrent(e.target.value)} placeholder="••••••••" className={inputClass} /></div>
                <div><label className={labelClass}>New password</label><input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min. 8 characters" className={inputClass} /></div>
                <div><label className={labelClass}>Confirm new password</label><input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat new password" className={inputClass} /></div>
                <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {saving ? "Updating..." : "Update password"}
                </button>
            </div>
        </div>
    )
}
