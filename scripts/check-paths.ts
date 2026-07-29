/**
 * Walks every path through a case and report metric ranges, ending
 * distribution, and worst-case runs. Use it to confirm that catastrophic
 * endings are reachable but rare, and that they fire for the right reasons.
 *
 * Run: npm run check:paths [case-id]
 */
import { cases } from "../lib/data/cases/index";
import {
  applyEffects,
  applyPatientEffects,
  initialPatientMetrics,
  mergePatientEffects,
  nodeById,
  resolveNext,
  stakeholderTotals,
} from "../lib/engine";
import { initialMetrics, type MetricState, type PathStep } from "../lib/types";

const c = cases.find((x) => x.id === (process.argv[2] ?? "two-patients-one-clinician"))!;

interface Run {
  ending: string;
  metrics: MetricState;
  patients: Record<string, MetricState>;
  clock: number;
  choices: string[];
}
const runs: Run[] = [];

function walk(
  nodeId: string,
  metrics: MetricState,
  patients: Record<string, MetricState>,
  clock: number,
  path: PathStep[],
  picks: string[]
) {
  const node = nodeById(c, nodeId);
  if (!node.choices.length) {
    runs.push({ ending: node.id, metrics, patients, clock, choices: picks });
    return;
  }
  if (picks.length > 20) return;
  for (const ch of node.choices) {
    const m2 = applyEffects(metrics, mergePatientEffects(ch.effects, ch.patientEffects));
    const p2 = applyPatientEffects(patients, ch.patientEffects);
    const clock2 = clock + (ch.timeCost ?? 0);
    const rule = resolveNext(ch.next, { metrics: m2, scenarioClock: clock2, path, patients: p2 });
    const step: PathStep = {
      nodeId,
      resolution: { choiceId: ch.id, timedOut: false },
      decisionMs: 0,
      scenarioClockAfter: clock2,
      effectsApplied: ch.effects,
      patientEffectsApplied: ch.patientEffects,
    };
    walk(rule.nodeId, m2, p2, clock2, [...path, step], [...picks, ch.id]);
  }
}

walk(c.startNodeId, initialMetrics(), initialPatientMetrics(c), 0, [], []);

const tot = runs.map((r) => ({ ...r, t: stakeholderTotals(r.metrics) }));
const rng = (f: (x: (typeof tot)[0]) => number) => {
  const v = tot.map(f);
  return `${Math.min(...v)} .. ${Math.max(...v)}`;
};

console.log(`paths: ${runs.length}`);
console.log(`PATIENT      ${rng((x) => x.t.patient)}`);
console.log(`DOCTOR       ${rng((x) => x.t.doctor)}`);
console.log(`INSTITUTION  ${rng((x) => x.t.institution)}`);
for (const pid of Object.keys(tot[0].patients))
  console.log(
    `  ${pid.padEnd(10)} PATIENT ${rng((x) => stakeholderTotals(x.patients[pid]).patient)}  wellbeing ${rng((x) => x.patients[pid].clinicalWellbeing)}`
  );
console.log(`clock        ${rng((x) => x.clock)}`);
console.log();
const byEnding = new Map<string, number>();
for (const r of runs) byEnding.set(r.ending, (byEnding.get(r.ending) ?? 0) + 1);
console.log("endings reached:");
for (const [e, n] of [...byEnding].sort((a, b) => b[1] - a[1]))
  console.log(`  ${e.padEnd(26)} ${n}`);

const worstP = tot.reduce((a, b) => (b.t.patient < a.t.patient ? b : a));
console.log("\nworst PATIENT run:", worstP.t, "\n  ", worstP.choices.join(" > "));
const worstD = tot.reduce((a, b) => (b.t.doctor < a.t.doctor ? b : a));
console.log("worst DOCTOR run:", worstD.t, "\n  ", worstD.choices.join(" > "));
const worstI = tot.reduce((a, b) => (b.t.institution < a.t.institution ? b : a));
console.log("worst INSTITUTION run:", worstI.t, "\n  ", worstI.choices.join(" > "));
const worstE = tot.reduce((a, b) =>
  b.patients.eleanor.clinicalWellbeing < a.patients.eleanor.clinicalWellbeing ? b : a
);
console.log("worst Eleanor wellbeing:", worstE.patients.eleanor.clinicalWellbeing, "\n  ", worstE.choices.join(" > "));
