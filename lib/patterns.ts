import type { AttemptRow } from "./attempts";
import { stakeholderTotals } from "./engine";
import { METRICS, type MetricKey, type MetricState, type Stakeholder } from "./types";

/**
 * Longitudinal analysis across a user's attempts.
 *
 * Language rule (non-negotiable): every generated sentence describes what the
 * user's CHOICES did — never what kind of person or clinician they are. "Your
 * choices have most often protected patient agency," never "you are an
 * autonomy-focused doctor." Patterns are evidence to reflect on, not a
 * personality verdict.
 */

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const round1 = (n: number) => Math.round(n * 10) / 10;
const label = (k: MetricKey) => METRICS.find((m) => m.key === k)!.label.toLowerCase();

export interface ModeComparison {
  caseId: string;
  caseTitle: string;
  deliberativeCount: number;
  timedCount: number;
  rows: { key: MetricKey; deliberative: number; timed: number; delta: number }[];
  interpretation: string;
}

export interface CaseTrend {
  caseId: string;
  caseTitle: string;
  attempts: number;
  first: number;
  latest: number;
  stakeholder: Stakeholder;
  sentence: string;
}

export interface PatternAnalysis {
  attemptCount: number;
  stakeholderAverages: Record<Stakeholder, number>;
  metricAverages: Record<MetricKey, number>;
  statements: string[];
  modeComparisons: ModeComparison[];
  trends: CaseTrend[];
}

const emptyMetricAverages = (): Record<MetricKey, number> =>
  Object.fromEntries(METRICS.map((m) => [m.key, 0])) as Record<MetricKey, number>;

export function analyzeAttempts(
  attempts: AttemptRow[],
  caseTitle: (caseId: string) => string
): PatternAnalysis {
  const done = attempts.filter(
    (a) => a.status === "completed" && a.final_metrics
  ) as (AttemptRow & { final_metrics: MetricState })[];

  const stakeholderAverages = {
    patient: mean(done.map((a) => stakeholderTotals(a.final_metrics).patient)),
    doctor: mean(done.map((a) => stakeholderTotals(a.final_metrics).doctor)),
    institution: mean(done.map((a) => stakeholderTotals(a.final_metrics).institution)),
  };

  const metricAverages = emptyMetricAverages();
  for (const m of METRICS) {
    metricAverages[m.key] = mean(done.map((a) => a.final_metrics[m.key]));
  }

  return {
    attemptCount: done.length,
    stakeholderAverages,
    metricAverages,
    statements: buildStatements(done.length, stakeholderAverages, metricAverages),
    modeComparisons: buildModeComparisons(done, caseTitle),
    trends: buildTrends(done, caseTitle),
  };
}

/* ------------------------------------------------------------------ */

function buildStatements(
  count: number,
  stake: Record<Stakeholder, number>,
  metrics: Record<MetricKey, number>
): string[] {
  if (count === 0) return [];
  if (count < 2)
    return [
      "One completed encounter isn't a pattern yet. Play a few more — including the same case a second way — and this section will start showing what your choices consistently protect and consistently spend.",
    ];

  const out: string[] = [];
  const sorted = [...METRICS].sort((a, b) => metrics[b.key] - metrics[a.key]);
  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];

  if (metrics[top.key] > 0)
    out.push(`Your choices have most often increased ${label(top.key)}.`);
  if (metrics[bottom.key] < 0)
    out.push(
      `They have most often come at the cost of ${label(bottom.key)}${
        metrics[top.key] > 0 ? " — that is the trade you keep making" : ""
      }.`
    );

  // Cross-stakeholder tension is the case library's central question.
  const { patient, doctor, institution } = stake;
  if (patient > 0.5 && institution < -0.5)
    out.push(
      "Across your attempts, you most consistently protect patient interests. Those same decisions often create workload, delay, or policy risk for the institution."
    );
  else if (institution > 0.5 && patient < -0.5)
    out.push(
      "Your decisions have most consistently satisfied institutional demands — efficiency, throughput, compliance — and patients have absorbed the difference."
    );
  else if (patient > 0.5 && doctor < -0.5)
    out.push(
      "You protect patients at measurable cost to yourself: your choices repeatedly spend the clinician's own integrity or sustainability to hold the line."
    );

  if (metrics.professionalIntegrity < -0.5)
    out.push(
      "Professional integrity has more often been spent than protected across your attempts — the accumulation the readings name as moral injury."
    );
  if (metrics.personalSustainability < -0.5)
    out.push(
      "Personal sustainability has trended negative. In these cases that is not a footnote: fatigue is what converts a defensible decision into an error later."
    );

  return out;
}

/* ------------------------------------------------------------------ */

function buildModeComparisons(
  done: (AttemptRow & { final_metrics: MetricState })[],
  caseTitle: (caseId: string) => string
): ModeComparison[] {
  const byCase = new Map<string, typeof done>();
  for (const a of done) {
    byCase.set(a.case_id, [...(byCase.get(a.case_id) ?? []), a]);
  }

  const comparisons: ModeComparison[] = [];
  for (const [caseId, list] of byCase) {
    const del = list.filter((a) => a.mode === "deliberative");
    const timed = list.filter((a) => a.mode === "timed");
    if (!del.length || !timed.length) continue;

    const rows = METRICS.map((m) => {
      const d = round1(mean(del.map((a) => a.final_metrics[m.key])));
      const t = round1(mean(timed.map((a) => a.final_metrics[m.key])));
      return { key: m.key, deliberative: d, timed: t, delta: round1(t - d) };
    });

    comparisons.push({
      caseId,
      caseTitle: caseTitle(caseId),
      deliberativeCount: del.length,
      timedCount: timed.length,
      rows,
      interpretation: interpretModeShift(rows),
    });
  }
  return comparisons;
}

function interpretModeShift(
  rows: { key: MetricKey; delta: number }[]
): string {
  const rose = rows.filter((r) => r.delta > 0.4).sort((a, b) => b.delta - a.delta);
  const fell = rows.filter((r) => r.delta < -0.4).sort((a, b) => a.delta - b.delta);

  if (!rose.length && !fell.length)
    return "Your decisions held remarkably steady across both modes — the clock changed how it felt, but not what you protected.";

  const parts: string[] = [];
  if (rose.length)
    parts.push(
      `Under time pressure your choices protected ${listOf(rose.slice(0, 2).map((r) => label(r.key)))} more`
    );
  if (fell.length)
    parts.push(
      `${rose.length ? ", while " : "Under time pressure, "}${listOf(
        fell.slice(0, 2).map((r) => label(r.key))
      )} fell furthest`
    );

  let sentence = parts.join("") + ".";

  // The comparison the whole project exists to surface.
  const effUp = rows.find((r) => r.key === "operationalEfficiency")!.delta > 0.4;
  const valuesDown =
    rows.find((r) => r.key === "professionalIntegrity")!.delta < -0.4 ||
    rows.find((r) => r.key === "agencyDignity")!.delta < -0.4;
  if (effUp && valuesDown)
    sentence +=
      " You acted faster and moved the department along, and the things that gave way were the patient's control and your own sense of defensible practice. That gap — between what you value with time to think and what you do without it — is the finding.";
  else if (!fell.length)
    sentence += " Pressure sharpened your practice without costing anyone.";

  return sentence;
}

/** Several metric labels already contain "and", so only join with "and" when none do. */
const listOf = (xs: string[]) => {
  if (xs.length <= 1) return xs[0] ?? "";
  if (xs.some((x) => x.includes(" and "))) return xs.join(", ");
  return `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`;
};

/* ------------------------------------------------------------------ */

function buildTrends(
  done: (AttemptRow & { final_metrics: MetricState })[],
  caseTitle: (caseId: string) => string
): CaseTrend[] {
  const byCase = new Map<string, typeof done>();
  for (const a of done) byCase.set(a.case_id, [...(byCase.get(a.case_id) ?? []), a]);

  const trends: CaseTrend[] = [];
  for (const [caseId, list] of byCase) {
    if (list.length < 2) continue;
    const ordered = [...list].sort(
      (a, b) =>
        new Date(a.completed_at ?? a.started_at).getTime() -
        new Date(b.completed_at ?? b.started_at).getTime()
    );
    const firstTotals = stakeholderTotals(ordered[0].final_metrics);
    const lastTotals = stakeholderTotals(ordered.at(-1)!.final_metrics);

    // Report the stakeholder that moved most between first and latest attempt.
    const moves = (["patient", "doctor", "institution"] as const).map((k) => ({
      k,
      delta: lastTotals[k] - firstTotals[k],
    }));
    const biggest = moves.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0];
    if (Math.abs(biggest.delta) < 1) continue;

    // Deliberately neutral: a rising institution total is not automatically an
    // improvement in this project — it may be exactly what patient dignity paid for.
    const dir = biggest.delta > 0 ? "risen" : "fallen";
    trends.push({
      caseId,
      caseTitle: caseTitle(caseId),
      attempts: ordered.length,
      first: firstTotals[biggest.k],
      latest: lastTotals[biggest.k],
      stakeholder: biggest.k,
      sentence: `Across your ${ordered.length} attempts at “${caseTitle(caseId)}”, the ${biggest.k} totals have ${dir} from ${firstTotals[biggest.k] > 0 ? "+" : ""}${firstTotals[biggest.k]} to ${lastTotals[biggest.k] > 0 ? "+" : ""}${lastTotals[biggest.k]}.`,
    });
  }
  return trends;
}
