import type { ClinicalCase } from "../../types";
import { routineClinicVisit } from "./routine-clinic-visit";
import { twoPatientsOneClinician } from "./two-patients-one-clinician";

/** Register new cases here — nothing else in the app needs to change. */
export const cases: ClinicalCase[] = [twoPatientsOneClinician, routineClinicVisit];

export const getCase = (id: string): ClinicalCase => {
  const c = cases.find((c) => c.id === id);
  if (!c) throw new Error(`Unknown case: ${id}`);
  return c;
};
