/**
 * Core data model for Accessible Clinical Encounters.
 *
 * Design principles:
 * - Cases are pure data; the engine plays them generically. New encounters
 *   are added by writing new data files, never by changing the engine.
 * - Personas are first-class: the same clinical situation can be re-cast
 *   with a different persona and play out differently.
 * - Feedback is evidence-based explanation, not right/wrong labels.
 * - reviewStatus keeps us honest about what Deaf/ASL experts have verified.
 */

/** How the patient identifies — deafness as identity, not pathology. */
export type IdentityStance =
  | "culturally-Deaf"
  | "hard-of-hearing"
  | "late-deafened"
  | "oral-deaf"
  | "DeafBlind";

export type CommunicationModality =
  | "ASL"
  | "spoken-lipreading"
  | "cued-speech"
  | "tactile-ASL"
  | "text";

export type AccessTech =
  | "interpreter"
  | "VRI"
  | "hearing-aids"
  | "cochlear-implant"
  | "none";

export interface Persona {
  id: string;
  name: string;
  age: number;
  pronouns: string;
  identityStance: IdentityStance;
  primaryModality: CommunicationModality;
  /** e.g. "ASL (first language), limited written English" */
  language: string;
  techUsed: AccessTech[];
  /** First-person background — the "patient voice" piece. */
  narrative: string;
  accessNeeds: string[];
}

/**
 * Four dimensions instead of one score: a clinician can "succeed"
 * clinically while trampling patient autonomy. Each choice moves
 * dimensions independently in the range -2..+2.
 */
export type ScoreDimension = "access" | "comprehension" | "autonomy" | "rapport";

export type Effects = Partial<Record<ScoreDimension, number>>;

/** Placeholder-friendly slot for future real ASL video or diagrams. */
export interface MediaSlot {
  type: "asl-video" | "diagram";
  /** Asset reference once media exists; absent = show described placeholder. */
  ref?: string;
  /** Plain-language description shown until real media is available. */
  description: string;
}

/**
 * Visual state hints consumed by the illustrated scene. Kept as data so
 * case authors control the scene without touching components.
 */
export interface SceneState {
  /** Who is present in the exam room. */
  present: ("patient" | "clinician" | "interpreter" | "family-member")[];
  patientMood: "neutral" | "uncertain" | "frustrated" | "engaged" | "relieved";
  /** Optional focus cue, e.g. clinician looking at interpreter vs. patient. */
  clinicianFocus?: "patient" | "interpreter" | "notes";
}

export interface Choice {
  id: string;
  label: string;
  effects: Effects;
  /**
   * Evidence-based explanation of the consequences of this choice —
   * shown after selection. Explains *why*, never just right/wrong.
   */
  feedback: string;
  /** What the patient experiences in response — the multi-viewpoint payoff. */
  patientReaction?: string;
  nextNodeId: string;
  mediaSlot?: MediaSlot;
}

export interface CaseNode {
  id: string;
  /** Short label for progress display, e.g. "First contact". */
  title: string;
  /** The situation from the clinician's point of view. */
  situation: string;
  /** Optional: what the patient is experiencing right now. */
  patientState?: string;
  scene: SceneState;
  /** Terminal nodes have no choices and mark the end of the encounter. */
  choices: Choice[];
}

export type ReviewStatus = "draft" | "expert-reviewed";

export interface Epilogue {
  /** The patient's first-person reflection on the visit. */
  patientReflection: string;
  /** Prompts for the learner to sit with — no right answers. */
  reflectionPrompts: string[];
}

export interface ClinicalCase {
  id: string;
  title: string;
  setting: string;
  personaId: string;
  difficulty: "foundational" | "intermediate" | "advanced";
  reviewStatus: ReviewStatus;
  learningObjectives: string[];
  startNodeId: string;
  nodes: CaseNode[];
  epilogue: Epilogue;
}

/** Running tally of the four dimensions during play. */
export type ScoreState = Record<ScoreDimension, number>;

export const SCORE_DIMENSIONS: { key: ScoreDimension; label: string; blurb: string }[] = [
  { key: "access", label: "Access", blurb: "Could the patient fully access communication?" },
  { key: "comprehension", label: "Comprehension", blurb: "Was mutual understanding actually verified?" },
  { key: "autonomy", label: "Autonomy", blurb: "Did the patient stay in control of their own care?" },
  { key: "rapport", label: "Rapport", blurb: "Did the encounter build trust?" },
];

export const initialScores = (): ScoreState => ({
  access: 0,
  comprehension: 0,
  autonomy: 0,
  rapport: 0,
});
