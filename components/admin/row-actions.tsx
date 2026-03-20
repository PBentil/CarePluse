"use client"

import { Pencil, Trash2 } from "lucide-react"

interface RowActionsProps {
    onEdit: () => void
    onDelete: () => void
}

export function RowActions({ onEdit, onDelete }: RowActionsProps) {
    return (
        <div className="flex items-center gap-1">
            <button
                onClick={onEdit}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-primary hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
                <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
                onClick={onDelete}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-primary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            >
                <Trash2 className="h-3.5 w-3.5" />
            </button>
        </div>
    )
}