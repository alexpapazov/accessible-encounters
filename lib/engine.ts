import type {
  ClinicalCase,
  Condition,
  DelayedOutcome,
  Effects,
  MetricKey,
  MetricState,
  NextRule,
  PathStep,
  PatientEffects,
} from "./types";
import { STAKEHOLDERS, initialMetrics } from "./types";
import type { Mood, SceneState, Stakeholder } from "./types";

/** Runtime state the condition system evaluates against. */
export interface EvalContext {
  metrics: MetricState;
  scenarioClock: number; // minutes
  path: PathStep[];
  /** Per-patient metrics in multi-patient cases, keyed by patient character id. */
  patients?: Record<string, MetricState>;
}

export function evalCondition(c: Condition, ctx: EvalContext): boolean {
  if ("metricAtLeast" in c) return ctx.metrics[c.metricAtLeast[0]] >= c.metricAtLeast[1];
  if ("metricBelow" in c) return ctx.metrics[c.metricBelow[0]] < c.metricBelow[1];
  if ("stakeholderAtLeast" in c)
    return stakeholderTotals(ctx.metrics)[c.stakeholderAtLeast[0]] >= c.stakeholderAtLeast[1];
  if ("stakeholderBelow" in c)
    return stakeholderTotals(ctx.metrics)[c.stakeholderBelow[0]] < c.stakeholderBelow[1];
  if ("patientMetricAtLeast" in c) {
    const [pid, key, n] = c.patientMetricAtLeast;
    return (ctx.patients?.[pid]?.[key] ?? 0) >= n;
  }
  if ("patientMetricBelow" in c) {
    const [pid, key, n] = c.patientMetricBelow;
    return (ctx.patients?.[pid]?.[key] ?? 0) < n;
  }
  if ("patientTotalBelow" in c) {
    const [pid, n] = c.patientTotalBelow;
    const m = ctx.patients?.[pid];
    return m ? stakeholderTotals(m).patient < n : false;
  }
  if ("clockAtLeast" in c) return ctx.scenarioClock >= c.clockAtLeast;
  if ("clockBelow" in c) return ctx.scenarioClock < c.clockBelow;
  if ("chose" in c)
    return ctx.path.some(
      (s) => "choiceId" in s.resolution && s.resolution.choiceId === c.chose
    );
  if ("visited" in c) return ctx.path.some((s) => s.nodeId === c.visited);
  if ("timedOut" in c)
    return ctx.path.some(
      (s) =>
        s.nodeId === c.timedOut &&
        "choiceId" in s.resolution &&
        s.resolution.timedOut
    );
  if ("all" in c) return c.all.every((x) => evalCondition(x, ctx));
  if ("any" in c) return c.any.some((x) => evalCondition(x, ctx));
  if ("not" in c) return !evalCondition(c.not, ctx);
  return false;
}

/** Resolve which NextRule fires; the last rule should be unconditional. */
export function resolveNext(rules: NextRule[], ctx: EvalContext): NextRule {
  for (const rule of rules) {
    if (!rule.when || evalCondition(rule.when, ctx)) return rule;
  }
  throw new Error("No next rule matched: case data must end rule lists with an unconditional rule");
}

/**
 * No single decision may move a metric by more than this. Authored effects are
 * written in the 1 to 3 range, but timed mode adds decision-speed and
 * milestone bonuses on top, which could otherwise stack into numbers that make
 * one choice look decisive out of all proportion.
 */
export const MAX_EFFECT_PER_DECISION = 3;

const clampValue = (v: number) =>
  Math.max(-MAX_EFFECT_PER_DECISION, Math.min(MAX_EFFECT_PER_DECISION, v));

export function clampEffects(e: Effects): Effects {
  const out: Effects = {};
  for (const [k, v] of Object.entries(e)) {
    if (v) out[k as MetricKey] = clampValue(v);
  }
  return out;
}

export function clampPatientEffects(pe?: PatientEffects): PatientEffects | undefined {
  if (!pe) return pe;
  return Object.fromEntries(
    Object.entries(pe).map(([pid, e]) => [pid, clampEffects(e)])
  );
}

/** Patient character ids, in the order the case lists them. */
export const patientIds = (c: ClinicalCase): string[] =>
  c.characters.filter((ch) => ch.role === "patient").map((ch) => ch.id);

/** True when PATIENT should be scored and shown per patient. */
export const isMultiPatient = (c: ClinicalCase): boolean => patientIds(c).length > 1;

export const initialPatientMetrics = (c: ClinicalCase): Record<string, MetricState> =>
  Object.fromEntries(patientIds(c).map((id) => [id, initialMetrics()]));

export function applyPatientEffects(
  patients: Record<string, MetricState>,
  pe: PatientEffects | undefined
): Record<string, MetricState> {
  if (!pe) return patients;
  const next = { ...patients };
  for (const [pid, eff] of Object.entries(pe)) {
    next[pid] = applyEffects(next[pid] ?? initialMetrics(), eff);
  }
  return next;
}

/**
 * Fold patient-scoped effects into one aggregate Effects object, so the
 * case-wide metric totals stay in sync with the per-patient breakdown.
 */
export function mergePatientEffects(base: Effects, pe?: PatientEffects): Effects {
  if (!pe) return base;
  const out: Effects = { ...base };
  for (const eff of Object.values(pe)) {
    for (const [k, v] of Object.entries(eff)) {
      if (v) out[k as MetricKey] = (out[k as MetricKey] ?? 0) + v;
    }
  }
  return out;
}

/** Rebuild per-patient metrics from a saved path (used by the dashboard and review). */
export function patientMetricsFromPath(
  c: ClinicalCase,
  path: PathStep[]
): Record<string, MetricState> {
  let patients = initialPatientMetrics(c);
  for (const step of path) patients = applyPatientEffects(patients, step.patientEffectsApplied);
  return patients;
}

export function applyEffects(metrics: MetricState, effects: Effects): MetricState {
  const next = { ...metrics };
  for (const [k, v] of Object.entries(effects)) {
    if (v) next[k as keyof MetricState] += v;
  }
  return next;
}

/** Delayed outcomes due at a given moment. */
export function dueDelayed(
  queue: DelayedOutcome[],
  moment:
    | { kind: "dayBreak"; toDay: number }
    | { kind: "node"; nodeId: string }
    | { kind: "clock"; minutes: number }
): DelayedOutcome[] {
  return queue.filter((d) => {
    if (moment.kind === "dayBreak" && "onDayBreakToDay" in d.deliver)
      return d.deliver.onDayBreakToDay <= moment.toDay;
    if (moment.kind === "node" && "atNodeId" in d.deliver)
      return d.deliver.atNodeId === moment.nodeId;
    if (moment.kind === "clock" && "afterScenarioMinutes" in d.deliver)
      return d.deliver.afterScenarioMinutes <= moment.minutes;
    return false;
  });
}

export function nodeById(c: ClinicalCase, id: string) {
  const n = c.nodes.find((n) => n.id === id);
  if (!n) throw new Error(`Case ${c.id}: missing node ${id}`);
  return n;
}

export function characterById(c: ClinicalCase, id: string) {
  const ch = c.characters.find((ch) => ch.id === id);
  if (!ch) throw new Error(`Case ${c.id}: missing character ${id}`);
  return ch;
}

/**
 * Rebuild engine state by walking a saved path up to (not including) an index.
 * Used by counterfactual branching: preserve everything the user decided
 * before the divergence point, then hand control back at that node.
 */
export function replayPrefix(
  c: ClinicalCase,
  path: PathStep[],
  uptoIndex: number
): {
  nodeId: string;
  metrics: MetricState;
  patients: Record<string, MetricState>;
  clock: number;
  path: PathStep[];
  queue: DelayedOutcome[];
} {
  let metrics = initialMetrics();
  let patients = initialPatientMetrics(c);
  let queue: DelayedOutcome[] = [];
  let clock = 0;
  const prefix: PathStep[] = [];

  for (let i = 0; i < uptoIndex && i < path.length; i++) {
    const step = path[i];
    const node = nodeById(c, step.nodeId);

    // Deliver anything that had come due on entering this node.
    const due = [
      ...dueDelayed(queue, { kind: "node", nodeId: step.nodeId }),
      ...dueDelayed(queue, { kind: "clock", minutes: clock }),
    ];
    if (due.length) {
      queue = queue.filter((d) => !due.includes(d));
      metrics = due.reduce(
        (m, d) => applyEffects(m, mergePatientEffects(d.effects ?? {}, d.patientEffects)),
        metrics
      );
      patients = due.reduce((ps, d) => applyPatientEffects(ps, d.patientEffects), patients);
    }

    // Must mirror CasePlayer.choose(): in multi-patient cases the shared
    // metrics take the per-patient effects too, or a replay under-counts them.
    metrics = applyEffects(
      metrics,
      mergePatientEffects(step.effectsApplied, step.patientEffectsApplied)
    );
    patients = applyPatientEffects(patients, step.patientEffectsApplied);
    clock = step.scenarioClockAfter;

    const res = step.resolution;
    const feedback =
      "choiceId" in res
        ? node.choices.find((ch) => ch.id === res.choiceId)?.feedback
        : node.inactionOutcome?.feedback;
    if (feedback?.delayed?.length) queue = [...queue, ...feedback.delayed];

    prefix.push(step);
  }

  return {
    nodeId: path[Math.min(uptoIndex, path.length - 1)].nodeId,
    metrics,
    patients,
    clock,
    path: prefix,
    queue,
  };
}

/**
 * Rebuild the FINAL state of a completed attempt from its saved path.
 *
 * replayPrefix stops at a decision node because branching hands control back
 * there. A finished attempt needs one more step: resolve the last choice to the
 * terminal node and deliver whatever came due on arriving at it, which is what
 * the Aftermath panel shows. Use this to reopen an ending, not replayPrefix.
 */
export function replayComplete(
  c: ClinicalCase,
  path: PathStep[]
): {
  nodeId: string;
  metrics: MetricState;
  patients: Record<string, MetricState>;
  clock: number;
  path: PathStep[];
  aftermath: DelayedOutcome[];
} {
  const st = replayPrefix(c, path, path.length);
  if (!path.length) return { ...st, aftermath: [] };

  const last = path[path.length - 1];
  const node = nodeById(c, last.nodeId);
  const res = last.resolution;
  const rules =
    "choiceId" in res
      ? node.choices.find((ch) => ch.id === res.choiceId)?.next
      : node.inactionOutcome?.next;
  if (!rules) return { ...st, aftermath: [] };

  const endId = resolveNext(rules, {
    metrics: st.metrics,
    scenarioClock: st.clock,
    path: st.path,
    patients: st.patients,
  }).nodeId;

  // Arriving at the terminal node delivers anything still due.
  const due = [
    ...dueDelayed(st.queue, { kind: "node", nodeId: endId }),
    ...dueDelayed(st.queue, { kind: "clock", minutes: st.clock }),
  ];
  const metrics = due.reduce(
    (m, d) => applyEffects(m, mergePatientEffects(d.effects ?? {}, d.patientEffects)),
    st.metrics
  );
  const patients = due.reduce((ps, d) => applyPatientEffects(ps, d.patientEffects), st.patients);

  return { nodeId: endId, metrics, patients, clock: st.clock, path: st.path, aftermath: due };
}

/** Sum metric values per stakeholder for rollup displays. */
export function stakeholderTotals(metrics: MetricState) {
  return {
    patient:
      metrics.clinicalWellbeing + metrics.agencyDignity + metrics.trustRelationship,
    doctor:
      metrics.qualityOfCare +
      metrics.professionalIntegrity +
      metrics.personalSustainability,
    institution: metrics.operationalEfficiency + metrics.riskCompliance,
  };
}


export interface ScoreRow {
  key: string;
  label: string;
  stakeholder: Stakeholder;
  value: number;
  /** Which metric set the expander should read from. */
  source: MetricState;
}

/**
 * One row per stakeholder, except that a case with more than one patient gets
 * a PATIENT row per patient. Scoring two patients as a single total lets good
 * care of one hide serious harm to the other.
 */
export function buildScoreRows(
  c: ClinicalCase,
  metrics: MetricState,
  patients: Record<string, MetricState>
): ScoreRow[] {
  const rows: ScoreRow[] = [];
  const multi = isMultiPatient(c);

  if (multi) {
    for (const pid of patientIds(c)) {
      const m = patients[pid] ?? initialMetrics();
      rows.push({
        key: `patient:${pid}`,
        label: `PATIENT: ${characterById(c, pid).name}`,
        stakeholder: "patient",
        value: stakeholderTotals(m).patient,
        source: m,
      });
    }
  } else {
    rows.push({
      key: "patient",
      label: "PATIENT",
      stakeholder: "patient",
      value: stakeholderTotals(metrics).patient,
      source: metrics,
    });
  }

  for (const s of STAKEHOLDERS.filter((s) => s.key !== "patient")) {
    rows.push({
      key: s.key,
      label: s.label,
      stakeholder: s.key,
      value: stakeholderTotals(metrics)[s.key],
      source: metrics,
    });
  }
  return rows;
}


/**
 * Patients are drawn with the mood the case author set for the beat, but a
 * patient who is deteriorating must never be drawn looking relieved or
 * engaged. This overrides the authored mood using the patient's own clinical
 * well-being, so the picture cannot contradict the outcome.
 */
export function adjustSceneMoods(
  c: ClinicalCase,
  scene: SceneState,
  patients: Record<string, MetricState>,
  metrics: MetricState
): SceneState {
  const moods: Record<string, Mood> = { ...(scene.moods ?? {}) };
  const multi = isMultiPatient(c);

  for (const pid of patientIds(c)) {
    const authored = moods[pid];
    if (!authored) continue;
    const wellbeing = multi
      ? (patients[pid]?.clinicalWellbeing ?? 0)
      : metrics.clinicalWellbeing;

    if (wellbeing <= -4) moods[pid] = "exhausted";
    else if (wellbeing <= -1 && (authored === "relieved" || authored === "engaged"))
      moods[pid] = "uncertain";
  }
  return { ...scene, moods };
}
