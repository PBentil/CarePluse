"use client"

import { HeartPulse } from "lucide-react"

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
        <HeartPulse className="h-5 w-5 text-primary-foreground" />
      </div>

      <span className="text-xl font-semibold tracking-tight">
        Care<span className="text-primary">Pulse</span>
      </span>
    </div>
  )
}