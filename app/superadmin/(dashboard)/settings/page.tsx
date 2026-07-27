
"use client"

import { useState } from "react"
import { toast } from "sonner"
import { PageHeader } from "@/components/admin/page-header"
import { Loader2 } from "lucide-react"

const inputClass = "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
const labelClass = "block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5"

export default function SuperAdminSettingsPage() {
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword]         = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [saving, setSaving]                   = useState(false)

    const handlePasswordChange = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("All fields are required"); return
        }
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match"); return
        }
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters"); return
        }

        setSaving(true)
        try {
            const res = await fetch("/api/superadmin/settings", {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success("Password updated successfully")
            setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setSaving(false) }
    }

    return (
        <div className="space-y-8 max-w-lg">
            <PageHeader title="Settings" />

            <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-5">
                <div>
                    <h3 className="text-sm font-medium text-zinc-900">Change password</h3>
                    <p className="text-xs text-zinc-400 mt-1">Update your super admin password</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>Current password</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>New password</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Confirm new password</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" className={inputClass} />
                    </div>
                </div>

                <button
                    onClick={handlePasswordChange}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {saving ? "Updating..." : "Update password"}
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
                <div>
                    <h3 className="text-sm font-medium text-zinc-900">Platform information</h3>
                    <p className="text-xs text-zinc-400 mt-1">Current platform configuration</p>
                </div>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Platform</span>
                        <span className="font-medium text-zinc-900">CarePulse</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Admin email</span>
                        <span className="font-medium text-zinc-900">admin@carepulse.app</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Plans available</span>
                        <span className="font-medium text-zinc-900">Starter · Growth · Enterprise</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Currency</span>
                        <span className="font-medium text-zinc-900">GHS (Ghana Cedis)</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
