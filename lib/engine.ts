import type {
  ClinicalCase,
  Condition,
  DelayedOutcome,
  Effects,
  MetricState,
  NextRule,
  PathStep,
} from "./types";
import { initialMetrics } from "./types";

/** Runtime state the condition system evaluates against. */
export interface EvalContext {
  metrics: MetricState;
  scenarioClock: number; // minutes
  path: PathStep[];
}

export function evalCondition(c: Condition, ctx: EvalContext): boolean {
  if ("metricAtLeast" in c) return ctx.metrics[c.metricAtLeast[0]] >= c.metricAtLeast[1];
  if ("metricBelow" in c) return ctx.metrics[c.metricBelow[0]] < c.metricBelow[1];
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
  throw new Error("No next rule matched — case data must end rule lists with an unconditional rule");
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
  clock: number;
  path: PathStep[];
  queue: DelayedOutcome[];
} {
  let metrics = initialMetrics();
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
        (m, d) => (d.effects ? applyEffects(m, d.effects) : m),
        metrics
      );
    }

    metrics = applyEffects(metrics, step.effectsApplied);
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
    clock,
    path: prefix,
    queue,
  };
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
