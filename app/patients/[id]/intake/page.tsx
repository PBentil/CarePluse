import PatientIntakeForm from "@/components/forms/PatientIntakeForm"
import { Logo } from "@/components/logo";
import Image from "next/image"

export default async function IntakePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    fullName?: string;
    email?: string;
    phone?: string;
  }>;
}) {
  const { id } = await params;
  const query = await searchParams;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">

      {/* Top nav bar */}
      <header className="sticky top-0 z-10 border-b border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm px-6 py-4">
        <Logo />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[calc(100vh-65px)]">

        {/* Form side — takes 3/5 columns */}
        <div className="lg:col-span-3 flex justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-2xl">

            {/* Welcome text above form */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                Patient Intake Form
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Please fill in your details below. All information is kept strictly confidential.
              </p>
            </div>

            <PatientIntakeForm
              patientId={id}
              defaultValues={{
                fullName: query.fullName || "",
                email: query.email || "",
                phone: query.phone || "",
              }}
            />
          </div>
        </div>

        {/* Image side — takes 2/5 columns, sticky so it doesn't scroll */}
        <div className="hidden lg:block lg:col-span-2 relative">
          <div className="sticky top-[65px] h-[calc(100vh-65px)]">

            {/* Overlay gradient for depth */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            <Image
              src="/assets/images/medical-form.png"
              alt="Healthcare professional"
              fill
              className="object-cover"
              priority
            />

            {/* Caption card sitting above gradient */}
            <div className="absolute bottom-8 left-6 right-6 z-20">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-5 text-white">
                <p className="text-sm font-medium opacity-80 uppercase tracking-widest mb-1">
                  CarePulse
                </p>
                <p className="text-lg font-semibold leading-snug">
                  Your health journey starts here.
                </p>
                <p className="text-sm opacity-70 mt-1">
                  Secure, private, and always in your hands.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}