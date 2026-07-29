import { notFound } from "next/navigation";
import CasePlayer from "@/components/CasePlayer";
import { cases, publishedCases } from "@/lib/data/cases";

export function generateStaticParams() {
  return publishedCases.map((c) => ({ caseId: c.id }));
}

export default async function CasePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const clinicalCase = cases.find((c) => c.id === caseId);
  // Unpublished cases stay resolvable for history, but aren't playable.
  if (!clinicalCase || clinicalCase.published === false) notFound();

  return <CasePlayer clinicalCase={clinicalCase} />;
}
