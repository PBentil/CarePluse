"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { Logo } from "@/components/logo"

export default function VideoCallPage() {
    const { roomName } = useParams()
    const iframeRef    = useRef<HTMLIFrameElement>(null)
    const [loading, setLoading] = useState(true)

    const roomUrl = `https://${process.env.NEXT_PUBLIC_DAILY_DOMAIN}.daily.co/${roomName}`

    useEffect(() => {
        if (iframeRef.current) {
            iframeRef.current.onload = () => setLoading(false)
        }
    }, [])

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col">
            <header className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                <Logo />
                <span className="text-xs text-zinc-500">Secure video consultation</span>
            </header>

            <div className="flex-1 relative">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-3">
                            <div className="h-8 w-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin mx-auto" />
                            <p className="text-sm text-zinc-400">Setting up your call...</p>
                        </div>
                    </div>
                )}
                <iframe
                    ref={iframeRef}
                    src={roomUrl}
                    allow="camera; microphone; fullscreen; speaker; display-capture"
                    className="w-full h-full absolute inset-0"
                    style={{ border: "none", minHeight: "calc(100vh - 65px)" }}
                />
            </div>
        </div>
    )
}