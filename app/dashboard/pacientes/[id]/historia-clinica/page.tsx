import { redirect } from "next/navigation";

export default async function HistoriaClinicaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  redirect(`/dashboard/pacientes/${resolvedParams.id}`);
}
