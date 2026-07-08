
"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast, Toaster } from "@/components/ui/sonner"
import { SubmitButton } from "@/components/submitButton"
import { Logo } from "@/components/logo"
import { Stethoscope } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CustomFormField } from "@/components/customFormField"

const formSchema = z.object({
    email:    z.string().email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
})

type LoginFormType = z.infer<typeof formSchema>

export default function DoctorLoginPage() {
    const { slug }  = useParams<{ slug: string }>()
    const router    = useRouter()
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormType>({
        resolver: zodResolver(formSchema),
    })

    const onSubmit = async (data: LoginFormType) => {
        setLoading(true)
        try {
            const res    = await fetch(`/api/${slug}/doctor/login`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(data),
            })
            const result = await res.json()
            if (!res.ok) throw new Error(result.error || "Login failed")
            toast.success(`Welcome back, Dr. ${result.doctor.name}`)
            router.push(`/${slug}/doctor/dashboard`)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Toaster />
            <div className="min-h-screen bg-zinc-50 flex flex-col">
                <header className="px-8 py-5 border-b border-zinc-100 bg-white">
                    <Logo />
                </header>
                <div className="flex flex-1 items-center justify-center px-4">
                    <div className="w-full max-w-sm space-y-6">
                        <div className="text-center space-y-3">
                            <div className="flex justify-center">
                                <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center">
                                    <Stethoscope className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-primary">Doctor Portal</h1>
                                <p className="text-sm text-zinc-500 mt-1">Sign in to manage your patients</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-zinc-100 p-6">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <CustomFormField label="Email" name="email" type="email" placeholder="dr.mensah@hospital.com" register={register} error={errors.email?.message} />
                                <CustomFormField label="Password" name="password" type="password" placeholder="••••••••" register={register} error={errors.password?.message} />
                                <div className="pt-1">
                                    <SubmitButton isLoading={loading} loadingText="Signing in...">Sign In</SubmitButton>
                                </div>
                            </form>
                        </div>
                        <p className="text-center text-xs text-zinc-400">Restricted access — authorised personnel only.</p>
                    </div>
                </div>
                <footer className="px-8 py-5 border-t border-zinc-100 text-center text-xs text-zinc-400">
                    © {new Date().getFullYear()} CarePulse
                </footer>
            </div>
        </>
    )
}
