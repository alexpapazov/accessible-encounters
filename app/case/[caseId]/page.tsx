import { notFound } from "next/navigation";
import CasePlayer from "@/components/CasePlayer";
import { cases } from "@/lib/data/cases";
import { getPersona } from "@/lib/data/personas";

export function generateStaticParams() {
  return cases.map((c) => ({ caseId: c.id }));
}

export default async function CasePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const clinicalCase = cases.find((c) => c.id === caseId);
  if (!clinicalCase) notFound();

  const persona = getPersona(clinicalCase.personaId);
  return <CasePlayer clinicalCase={clinicalCase} persona={persona} />;
}
