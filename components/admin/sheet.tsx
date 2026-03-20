"use client"

import { useEffect } from "react"
import { X } from "lucide-react"

interface SheetProps {
    open: boolean
    onClose: () => void
    title: string
    description?: string
    children: React.ReactNode
}

export function Sheet({ open, onClose, title, description, children }: SheetProps) {
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
        if (open) document.addEventListener("keydown", handleKey)
        return () => document.removeEventListener("keydown", handleKey)
    }, [open, onClose])

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : ""
        return () => { document.body.style.overflow = "" }
    }, [open])

    return (
        <>
            <div
                className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
                    open ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={onClose}
            />

            <div
                className={`fixed top-0 right-0 z-50 h-full w-full max-w-lg bg-white dark:bg-zinc-900 border-l border-zinc-100 dark:border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out ${
                    open ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex items-start justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                    <div>
                        <h2 className="text-sm font-medium text-zinc-900 dark:text-white">{title}</h2>
                        {description && (
                            <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">{description}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {children}
                </div>
            </div>
        </>
    )
}