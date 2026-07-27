"use client"

import { Loader2, TriangleAlert } from "lucide-react"
import {Modal} from "@/components/admin/modal";

interface ConfirmModalProps {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmLabel?: string
    loading?: boolean
}

export function ConfirmModal({
                                 open,
                                 onClose,
                                 onConfirm,
                                 title,
                                 description,
                                 confirmLabel = "Delete",
                                 loading = false,
                             }: ConfirmModalProps) {
    return (
        <Modal open={open} onClose={onClose} title={title} size="sm">
    <div className="space-y-5">

    <div className="flex items-start gap-3">
    <div className="h-9 w-9 rounded-xl bg-red-50 dark:bg-red-950 flex items-center justify-center shrink-0">
    <TriangleAlert className="h-4 w-4 text-red-500" />
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed pt-1.5">
        {description}
        </p>
        </div>

        <div className="flex gap-2">
    <button
        onClick={onClose}
    className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
        Cancel
        </button>
        <button
    onClick={onConfirm}
    disabled={loading}
    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
    {confirmLabel}
    </button>
    </div>

    </div>
    </Modal>
)
}