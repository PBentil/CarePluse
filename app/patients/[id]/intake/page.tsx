import PatientIntakeForm from "@/components/forms/PatientIntakeForm";
import Image from "next/image";

export default function IntakePage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { fullName?: string; email?: string; phone?: string };
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      <div className="flex justify-center p-10">
        <div className="w-full max-w-2xl">
          <PatientIntakeForm
            patientId={params.id}
            defaultValues={{
              fullName: searchParams.fullName || "",
              email: searchParams.email || "",
              phone: searchParams.phone || ""
            }}
          />
        </div>
      </div>

      <div className="hidden lg:block relative w-full h-full">
        <Image
          src="/assets/images/medical-form.png"
          alt="medical illustration"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}