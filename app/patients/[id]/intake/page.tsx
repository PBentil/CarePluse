import PatientIntakeForm from "@/components/forms/PatientIntakeForm"
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
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">

      <div className="flex justify-center p-10">
      <div className="w-full max-w-2xl">
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


      <div className="hidden lg:flex items-center justify-center bg-muted relative">

        <Image
          src="/assets/images/medical-form.png"
          alt="medical illustration"
          fill
          className="object-cover"
          priority
        />

      </div>

    </div>
  )
}
