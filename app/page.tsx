import Image from "next/image";
import { Logo } from "@/components/logo";
import PatientForm from "@/components/forms/PatientForm";
import Link from "next/link"
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 grid grid-cols-1 lg:grid-cols-5">
      <section className="lg:col-span-3 flex flex-col min-h-screen">
        <header className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-800">
          <Logo />
        </header>

        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md space-y-8">

            <div>
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                Welcome to CarePulse
              </h1>
              <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                Let&#39;s start with some basic information to get you set up.
              </p>
            </div>

            <PatientForm />

          </div>
        </div>

        <footer className="px-8 py-5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-sm text-zinc-400 dark:text-zinc-500">
          <p>© {new Date().getFullYear()} CarePulse</p>
          <div className="flex items-center gap-4">
            <Link
                href="/patient/login"
                className="text-primary hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Patient portal →
            </Link>
            <Link
                href="/doctor/login"
                className="text-primary hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Doctor portal →
            </Link>
            <Link
                href="/admin/login"
                className="text-primary hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Admin portal →
            </Link>
          </div>
        </footer>

      </section>

      <div className="hidden lg:block lg:col-span-2 relative">
        <div className="sticky top-0 h-screen">

          <div className="absolute inset-0 z-10 bg-linear-to-t from-black/50 via-black/10 to-transparent" />

          <Image
            src="/assets/images/onboarding.png"
            alt="Doctors"
            fill
            className="object-cover"
            priority
          />

          <div className="absolute bottom-8 left-6 right-6 z-20">
            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-5 text-white">
              <p className="text-xs font-medium uppercase tracking-widest opacity-70 mb-1">
                Trusted Care
              </p>
              <p className="text-lg font-semibold leading-snug">
                Quality healthcare, closer than ever.
              </p>
              <p className="text-sm opacity-60 mt-1">
                Register in minutes and connect with top physicians.
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}