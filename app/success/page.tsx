import SuccessClient from "@/app/success/success-client";

export default async function SuccessPage({
                                            searchParams,
                                          }: {
  searchParams: Promise<{ patientId?: string; fullName?: string }>
}) {
  const { patientId, fullName } = await searchParams

  return (
      <SuccessClient
          patientId={patientId ?? ""}
          fullName={fullName ?? ""}
      />
  )
}