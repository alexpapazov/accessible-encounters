/**
 * Engine v2 — core data model for Accessible Clinical Encounters.
 *
 * Central question: what does ethical care require when time, staffing,
 * institutional pressure, uncertainty, and personal risk make every available
 * decision harmful in some way?
 *
 * Design principles (see AGENTS.md):
 * - Cases are pure data; the engine plays them generically.
 * - Eight metrics under three stakeholders; effects touch only what a choice
 *   meaningfully changes; contradictions stay visible, never averaged away.
 * - Feedback explains (immediate / delayed / institutional / ethical) —
 *   never labels right/wrong.
 * - Cases may define their own timing, thresholds, weights, and no-score rules.
 * - SceneState is the renderer-agnostic interface: every current and future
 *   graphics option renders from it, never around it.
 */

/* ------------------------------------------------------------------ */
/* Stakeholders and metrics                                            */
/* ------------------------------------------------------------------ */

export type Stakeholder = "patient" | "doctor" | "institution";

export type MetricKey =
  // PATIENT
  | "clinicalWellbeing"
  | "agencyDignity"
  | "trustRelationship"
  // DOCTOR
  | "qualityOfCare"
  | "professionalIntegrity"
  | "personalSustainability"
  // INSTITUTION
  | "operationalEfficiency"
  | "riskCompliance";

export interface MetricInfo {
  key: MetricKey;
  stakeholder: Stakeholder;
  label: string;
  meaning: string;
  whenHigh: string;
  whenLow: string;
}

export const METRICS: MetricInfo[] = [
  {
    key: "clinicalWellbeing",
    stakeholder: "patient",
    label: "Clinical well-being",
    meaning: "The patient's safety, symptoms, comfort, and health outcome",
    whenHigh: "Stabilization, symptom relief, harm prevention, comfort, goal-aligned care",
    whenLow: "Deterioration, pain, distress, injury, hospitalization, preventable death",
  },
  {
    key: "agencyDignity",
    stakeholder: "patient",
    label: "Agency and dignity",
    meaning: "The patient's control, informed choice, privacy, and respectful treatment",
    whenHigh: "Informed consent, respected refusal, protected privacy, shared decisions",
    whenLow: "Coercion, humiliation, unwanted treatment, exclusion from decisions",
  },
  {
    key: "trustRelationship",
    stakeholder: "patient",
    label: "Trust and therapeutic relationship",
    meaning: "Whether the patient feels believed and remains willing to engage in care",
    whenHigh: "Honest disclosure, questions, follow-up, openness to appropriate care",
    whenLow: "Withholding information, conflict, disengagement, refusal to return",
  },
  {
    key: "qualityOfCare",
    stakeholder: "doctor",
    label: "Quality of care",
    meaning: "The clinician's reasoning, communication, prioritization, and execution",
    whenHigh: "Sound assessment, clear communication, effective triage and coordination",
    whenLow: "Missed signs, poor prioritization, errors, delays, fragmented care",
  },
  {
    key: "professionalIntegrity",
    stakeholder: "doctor",
    label: "Professional integrity",
    meaning:
      "Whether the clinician views their actions as ethically and professionally defensible",
    whenHigh: "Honesty, advocacy, respect for autonomy, resistance to harmful pressure",
    whenLow: "Guilt, moral distress, moral injury, complicity in harm",
  },
  {
    key: "personalSustainability",
    stakeholder: "doctor",
    label: "Personal sustainability",
    meaning:
      "Whether workload, fatigue, trauma, and support allow continued safe practice",
    whenHigh: "Manageable workload, adequate support, shared responsibility, recovery time",
    whenLow: "Exhaustion, burnout, impaired focus, fatigue-related errors, quitting",
  },
  {
    key: "operationalEfficiency",
    stakeholder: "institution",
    label: "Operational efficiency",
    meaning: "Use of time, staff, beds, supplies, and money",
    whenHigh: "Efficient delegation, timely throughput, controlled costs, limited delays",
    whenLow: "Overcrowding, long waits, staffing strain, excess costs, resource depletion",
  },
  {
    key: "riskCompliance",
    stakeholder: "institution",
    label: "Risk and compliance",
    meaning: "Legal, regulatory, policy, safety, and reputational exposure",
    whenHigh: "Proper documentation, lawful care, policy adherence, reduced liability",
    whenLow: "Complaints, lawsuits, investigations, penalties, reputational damage",
  },
];

export const STAKEHOLDERS: { key: Stakeholder; label: string }[] = [
  { key: "patient", label: "PATIENT" },
  { key: "doctor", label: "DOCTOR" },
  { key: "institution", label: "INSTITUTION" },
];

export const metricsFor = (s: Stakeholder): MetricInfo[] =>
  METRICS.filter((m) => m.stakeholder === s);

/** Per-choice metric changes; include only metrics the choice meaningfully moves. */
export type Effects = Partial<Record<MetricKey, number>>;

/**
 * Patient-scoped effects, keyed by patient character id.
 *
 * Cases with more than one patient must attribute their PATIENT metrics
 * (clinical well-being, agency and dignity, trust) here rather than in
 * `effects`, so each patient is scored on their own. Otherwise treating one
 * patient well can mathematically cancel out harm to the other, and a death
 * can be hidden behind a positive total.
 */
export type PatientEffects = Record<string, Effects>;

export type MetricState = Record<MetricKey, number>;

export const initialMetrics = (): MetricState => ({
  clinicalWellbeing: 0,
  agencyDignity: 0,
  trustRelationship: 0,
  qualityOfCare: 0,
  professionalIntegrity: 0,
  personalSustainability: 0,
  operationalEfficiency: 0,
  riskCompliance: 0,
});

/* ------------------------------------------------------------------ */
/* Characters and scene (renderer-agnostic)                            */
/* ------------------------------------------------------------------ */

export type CharacterRole =
  | "patient"
  | "clinician"
  | "interpreter"
  | "family-member"
  | "staff"
  | "security"
  | "supervisor";

/** Visual archetype hint for renderers; keeps case data renderer-agnostic. */
export type CharacterArchetype =
  | "maya"
  | "clinician"
  | "vri-interpreter"
  | "adult-f"
  | "adult-m"
  | "elder"
  | "nurse"
  | "security"
  | "supervisor"
  | "gurney-patient"
  /** Same bed, a man: short dark hair, beard, warmer skin, green blanket. */
  | "gurney-patient-m";

export interface Character {
  id: string;
  name: string;
  role: CharacterRole;
  archetype: CharacterArchetype;
  /** First-person background — the "patient voice" piece (About panel). */
  bio?: string;
  accessNeeds?: string[];
}

export type Mood =
  | "neutral"
  | "uncertain"
  | "frustrated"
  | "engaged"
  | "relieved"
  | "fearful"
  | "agitated"
  | "exhausted";

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export interface SpeechBubble {
  characterId: string;
  text: string;
}

export interface SceneState {
  /** Character ids present, in left-to-right render order. */
  present: string[];
  moods?: Record<string, Mood>;
  /** Which character the clinician-player is focused on (renderer gaze hint). */
  focus?: string;
  /** Speech bubbles, rendered in order. Never used to depict signing. */
  bubbles?: SpeechBubble[];
  /** Render the exam-room wall clock showing the scenario clock. */
  wallClock?: boolean;
  setting?: "clinic" | "ed";
}

/* ------------------------------------------------------------------ */
/* Conditions (branching on state, clock, and history)                 */
/* ------------------------------------------------------------------ */

export type Condition =
  | { metricAtLeast: [MetricKey, number] }
  | { metricBelow: [MetricKey, number] }
  /** Totals across a stakeholder's metrics, used to gate worst-case endings. */
  | { stakeholderAtLeast: [Stakeholder, number] }
  | { stakeholderBelow: [Stakeholder, number] }
  /** One named patient's own metric, in multi-patient cases. */
  | { patientMetricAtLeast: [string, MetricKey, number] }
  | { patientMetricBelow: [string, MetricKey, number] }
  /** One named patient's own PATIENT total. */
  | { patientTotalBelow: [string, number] }
  | { clockAtLeast: number } // scenario minutes
  | { clockBelow: number }
  | { chose: string } // choice id anywhere in path
  | { visited: string } // node id
  | { timedOut: string } // node id was decided by timeout
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition };

export interface NextRule {
  when?: Condition; // omitted = unconditional (must be last)
  nodeId: string;
  /** Shown in attempt review: "why this branch fired." */
  reason?: string;
}

/* ------------------------------------------------------------------ */
/* Feedback (four-part; never right/wrong)                             */
/* ------------------------------------------------------------------ */

export interface DelayedOutcome {
  id: string;
  text: string;
  /** When it surfaces. */
  deliver:
    | { onDayBreakToDay: number }
    | { atNodeId: string }
    | { afterScenarioMinutes: number };
  /** Metric changes applied at delivery time, if any. */
  effects?: Effects;
  /** Multi-patient cases: patient metrics attributed at delivery time. */
  patientEffects?: PatientEffects;
}

export interface DecisionFeedback {
  /** What happens in the next minutes/hours. */
  immediate: string;
  /** Consequences that surface later (queued; land at day-breaks or nodes). */
  delayed?: DelayedOutcome[];
  /** How supervisors, administrators, police, or coworkers respond. */
  institutional?: string;
  /** Which values were protected and which compromised. */
  ethical: string;
}

/* ------------------------------------------------------------------ */
/* Choices and nodes                                                   */
/* ------------------------------------------------------------------ */

export interface Choice {
  id: string;
  /** What the player selects. For dialogue choices, the line itself. */
  label: string;
  /** Present = this is a dialogue choice: the chosen line is spoken aloud. */
  dialogue?: { speakerId: string };
  /** Doctor and institution metrics, plus patient metrics in single-patient cases. */
  effects: Effects;
  /** Multi-patient cases: patient metrics attributed to each patient. */
  patientEffects?: PatientEffects;
  feedback: DecisionFeedback;
  /** Scenario minutes this action consumes. */
  timeCost?: number;
  /** Exactly one per timed node (unless the node has an inactionOutcome). */
  timeSaver?: boolean;
  /** First matching rule wins; final rule must be unconditional. */
  next: NextRule[];
  mediaSlot?: MediaSlot;
}

export interface PerspectiveText {
  characterId: string;
  text: string;
}

export interface DayBreak {
  /** Connective narration; delayed outcomes due for this day also land here. */
  narration: string;
}

export interface InactionOutcome {
  /** Narration of what happens when nobody decides. Nobody gets helped. */
  text: string;
  effects: Effects;
  patientEffects?: PatientEffects;
  feedback: DecisionFeedback;
  next: NextRule[];
}

export interface CaseNode {
  id: string;
  title: string;
  situation: string;
  /** Optional viewpoints of characters (supports multiple patients). */
  perspectives?: PerspectiveText[];
  scene: SceneState;
  day?: number;
  timeOfDay?: TimeOfDay;
  /** Shown as a full-screen calendar interstitial when entering this node on a new day. */
  dayBreak?: DayBreak;
  /** Lightweight "Later that afternoon" caption for same-day jumps. */
  inlineCaption?: string;
  /** Timed mode: seconds allowed at this node. Absent = untimed even in timed mode. */
  timerSeconds?: number;
  /** Timed mode: reduced information (what a rushed clinician actually absorbs). */
  timedOverrides?: { situation?: string; hidePerspectives?: boolean };
  /** Timed mode: bespoke timeout result replacing the time-saver auto-fire. */
  inactionOutcome?: InactionOutcome;
  /** Terminal nodes have no choices; they may carry an outcome summary. */
  choices: Choice[];
  /** Short outcome label for history cards (terminal nodes). */
  outcomeSummary?: string;
}

export interface MediaSlot {
  type: "asl-video" | "diagram";
  ref?: string;
  description: string;
}

/* ------------------------------------------------------------------ */
/* Case                                                                */
/* ------------------------------------------------------------------ */

export type CaseMode = "deliberative" | "timed";

export interface EfficiencyMilestone {
  id: string;
  label: string;
  /** Fires when this choice is taken; tiers award by scenario clock. */
  onChoiceId: string;
  tiers: { byMinute: number; delta: number }[];
}

export interface CaseTiming {
  /** Timed mode: real seconds of hesitation per scenario minute (e.g. 10). */
  hesitationSecondsPerScenarioMinute?: number;
  /** Decision-speed bonus default: answer within N seconds → op-efficiency delta. */
  decisionSpeed?: { withinSeconds: number; delta: number }[];
  milestones?: EfficiencyMilestone[];
  /** Timed mode: leaving the page ends (vs pauses) the attempt. */
  leavingEndsAttempt?: boolean;
}

export interface ReadingConnection {
  source: string;
  connection: string;
}

export type ReviewStatus = "draft" | "expert-reviewed";

export interface Epilogue {
  /**
   * Reflections from characters, in their own voice. Entries may carry a
   * condition; for each character, the first entry whose condition passes
   * (or that has none) is shown — e.g. integrity-dependent clinician voices.
   */
  reflections: { characterId: string; text: string; when?: Condition }[];
  reflectionPrompts: string[];
}

export interface ClinicalCase {
  id: string;
  caseVersion: number;
  title: string;
  setting: string;
  difficulty: "foundational" | "intermediate" | "advanced";
  reviewStatus: ReviewStatus;
  /**
   * False = hidden from the library and not playable, but still resolvable so
   * past attempts keep rendering in history. Defaults to true when omitted.
   */
  published?: boolean;
  modes: CaseMode[];
  /** "none" = no metric scoring shown (e.g. cochlear implant case). */
  scoring: "standard" | "none";
  characters: Character[];
  learningObjectives: string[];
  timing?: CaseTiming;
  startNodeId: string;
  nodes: CaseNode[];
  epilogue: Epilogue;
  /** Course readings this case connects with — its own section, never per-choice. */
  readingConnections: ReadingConnection[];
}

/* ------------------------------------------------------------------ */
/* Attempt shape (client now; database rows in Phase 2)                */
/* ------------------------------------------------------------------ */

export interface PathStep {
  nodeId: string;
  /** Choice id, or how the node resolved without an active choice. */
  resolution: { choiceId: string; timedOut: boolean } | { inaction: true };
  decisionMs: number;
  scenarioClockAfter: number;
  effectsApplied: Effects;
  /** Present in multi-patient cases so per-patient scores can be rebuilt from a saved path. */
  patientEffectsApplied?: PatientEffects;
  /** From the NextRule that fired, when it had a reason. */
  branchReason?: string;
}

export type AttemptStatus = "in-progress" | "completed" | "abandoned";

export interface AttemptRecord {
  caseId: string;
  caseVersion: number;
  mode: CaseMode;
  status: AttemptStatus;
  path: PathStep[];
  finalMetrics: MetricState;
  startedAtIso: string;
  completedAtIso?: string;
  /** Branch replays (Phase 5). */
  parentAttemptId?: string;
  branchNodeId?: string;
}
