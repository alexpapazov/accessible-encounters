import type { ClinicalCase } from "../../types";
import { routineClinicVisit } from "./routine-clinic-visit";
import { twoPatientsOneClinician } from "./two-patients-one-clinician";
import { thePlan75Consultation } from "./the-plan-75-consultation";
import { whenEveryoneSaysKeepFighting } from "./when-everyone-says-keep-fighting";

/**
 * Full registry — includes unpublished cases so historical attempts and
 * dashboard lookups still resolve. Register new cases here.
 */
export const cases: ClinicalCase[] = [
  twoPatientsOneClinician,
  whenEveryoneSaysKeepFighting,
  thePlan75Consultation,
  routineClinicVisit,
];

/** What the library shows and what is actually playable. */
export const publishedCases = cases.filter((c) => c.published !== false);

export const getCase = (id: string): ClinicalCase => {
  const c = cases.find((c) => c.id === id);
  if (!c) throw new Error(`Unknown case: ${id}`);
  return c;
};
