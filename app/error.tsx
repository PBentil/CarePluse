
"use client"

import Link from "next/link"
import { Logo } from "@/components/logo"

export default function Error({ reset }: { reset: () => void }) {
    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-4">
            <Logo />
            <div className="text-center mt-8 space-y-3">
                <p className="text-8xl font-bold text-zinc-200">500</p>
                <h1 className="text-xl font-semibold text-zinc-900">Something went wrong</h1>
                <p className="text-sm text-zinc-500 max-w-sm">
                    An unexpected error occurred. Please try again.
                </p>
                <div className="flex items-center justify-center gap-3 pt-4">
                    <button onClick={reset} className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
                        Try again
                    </button>
                    <Link href="/" className="px-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors">
                        Back to home
                    </Link>
                </div>
            </div>
        </div>
    )
}
