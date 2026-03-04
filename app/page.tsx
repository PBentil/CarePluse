import Image from "next/image";
import { Logo } from "@/components/logo";
import PatientForm from "@/components/forms/PatientForm";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen">
      {/* TODO: otp verification | passkey modal*/}
      <section className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <Logo />

          <PatientForm />

          <div className="flex items-center justify-between text-sm text-muted-foreground pt-10">
          <p>© {new Date().getFullYear()} CarePulse</p>

            <Link
              href="/?admin=true"
              className="text-primary hover:underline"
            >
              Admin
            </Link>
          </div>

        </div>
      </section>

      <div className="relative hidden flex-1 lg:block">
        <Image
          src="/assets/images/onboarding.png"
          alt="Doctors"
          fill
          className="object-cover"
          priority
        />
      </div>

    </div>
  );
}