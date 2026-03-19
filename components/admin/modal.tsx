"use client"

import React, { useEffect } from "react"
import { X } from "lucide-react"

interface ModalProps {
    open: boolean
    onClose: () => void
    title: string
    description?: string
    children: React.ReactNode
    size?: "sm" | "md" | "lg" | "xl"
}

const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
}

export function Modal({ open, onClose, title, description, children, size = "md" }: ModalProps) {
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        if (open) document.addEventListener("keydown", handleKey)
        return () => document.removeEventListener("keydown", handleKey)
    }, [open, onClose])

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : ""
        return () => { document.body.style.overflow = "" }
    }, [open])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className={`relative z-10 w-full ${sizes[size]} mx-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xl flex flex-col max-h-[90vh]`}>

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

                <div className="overflow-y-auto flex-1 px-6 py-5">
                    {children}
                </div>

            </div>
        </div>
    )
}