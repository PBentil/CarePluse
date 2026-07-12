
"use client"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"

interface MobileNavProps {
    children: React.ReactNode
}

export function MobileNav({ children }: MobileNavProps) {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (open) document.body.style.overflow = "hidden"
        else document.body.style.overflow = ""
        return () => { document.body.style.overflow = "" }
    }, [open])

    return (
        <>
            {/* Hamburger button - only on mobile */}
            <button
                onClick={() => setOpen(true)}
                className="fixed top-4 left-4 z-30 h-9 w-9 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shadow-sm md:hidden"
            >
                <Menu className="h-4 w-4 text-zinc-600" />
            </button>

            {/* Overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Sidebar - always visible on desktop, slide in on mobile */}
            <div className={`fixed top-0 left-0 h-screen w-60 z-50 transition-transform duration-300 md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
                <div className="relative h-full">
                    <button
                        onClick={() => setOpen(false)}
                        className="absolute top-4 right-4 h-7 w-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors md:hidden"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    {children}
                </div>
            </div>
        </>
    )
}
