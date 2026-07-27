"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getAttempt, listCaseAttempts, type AttemptRow } from "@/lib/attempts";
import { cases } from "@/lib/data/cases";
import Scene from "@/components/Scene";
import DecisionMap from "@/components/DecisionMap";
import type {
  Choice,
  ClinicalCase,
  MetricState,
  PathStep,
} from "@/lib/types";
import { METRICS, STAKEHOLDERS, metricsFor } from "@/lib/types";
import { characterById, nodeById, stakeholderTotals } from "@/lib/engine";

const metricLabel = (key: string) => METRICS.find((m) => m.key === key)?.label ?? key;

function Chips({ effects }: { effects: Record<string, number | undefined> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(effects).map(([k, v]) =>
        v ? (
          <span
            key={k}
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              v > 0 ? "bg-[#DFF0EE] text-[#2E6B66]" : "bg-[#FBE3DA] text-[#A34A2E]"
            }`}
          >
            {metricLabel(k)} {v > 0 ? `+${v}` : v}
          </span>
        ) : null
      )}
    </div>
  );
}

export default function AttemptReviewPage() {
  const { id } = useParams<{ id: string }>();
  const { enabled, loading, user } = useAuth();
  const [attempt, setAttempt] = useState<AttemptRow | null | "missing">(null);
  const [parent, setParent] = useState<AttemptRow | null>(null);
  const [siblings, setSiblings] = useState<AttemptRow[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [openRoad, setOpenRoad] = useState<string | null>(null);
  const [showUnseen, setShowUnseen] = useState(false);

  useEffect(() => {
    if (user && id) getAttempt(id).then((row) => setAttempt(row ?? "missing"));
  }, [user, id]);

  useEffect(() => {
    if (!user || !attempt || attempt === "missing") return;
    listCaseAttempts(user.id, attempt.case_id).then(setSiblings);
    if (attempt.parent_attempt_id) getAttempt(attempt.parent_attempt_id).then(setParent);
  }, [user, attempt]);

  const c: ClinicalCase | undefined = useMemo(
    () =>
      attempt && attempt !== "missing"
        ? cases.find((x) => x.id === attempt.case_id)
        : undefined,
    [attempt]
  );

  if (!enabled || (!loading && !user)) {
    return (
      <Shell title="Attempt review">
        <p className="leading-relaxed text-[#5A4A40]">
          <Link href="/signin" className="text-[#8A5A44] underline">
            Sign in
          </Link>{" "}
          to review your attempts.
        </p>
      </Shell>
    );
  }
  if (attempt === null) {
    return (
      <Shell title="Attempt review">
        <p className="text-[#7A6A5E]">Loading…</p>
      </Shell>
    );
  }
  if (attempt === "missing" || !c) {
    return (
      <Shell title="Attempt review">
        <p className="leading-relaxed text-[#5A4A40]">
          This attempt couldn&rsquo;t be found (or belongs to a case version that no
          longer exists).{" "}
          <Link href="/dashboard" className="text-[#8A5A44] underline">
            Back to dashboard
          </Link>
        </p>
      </Shell>
    );
  }

  const path = attempt.path;
  const isTimed = attempt.mode === "timed";
  const onSummary = stepIndex >= path.length;
  const step: PathStep | undefined = onSummary ? undefined : path[stepIndex];

  const goto = (i: number) => {
    setStepIndex(Math.max(0, Math.min(path.length, i)));
    setOpenRoad(null);
    setShowUnseen(false);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <Link href="/dashboard" className="text-sm text-[#8A5A44] hover:underline">
            ← Dashboard
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-[#3A2B26]">{c.title}</h1>
          <p className="text-sm text-[#7A6A5E]">
            {attempt.mode} ·{" "}
            {new Date(attempt.completed_at ?? attempt.started_at).toLocaleString()}
          </p>
        </div>
        <span className="rounded-full bg-[#F6E3D0] px-3 py-1 text-xs font-medium text-[#8A5A44]">
          {onSummary ? "Summary" : `Decision ${stepIndex + 1} of ${path.length}`}
        </span>
      </div>

      {attempt.parent_attempt_id && (
        <p className="mt-3 rounded-xl border border-[#6E5A7A] bg-[#EDE4F0] p-3 text-sm leading-relaxed text-[#4A3D52]">
          <span className="font-medium">Counterfactual replay.</span> Branched from{" "}
          {parent ? (
            <Link
              href={`/dashboard/attempt/${parent.id}`}
              className="underline hover:text-[#6E5A7A]"
            >
              your {new Date(parent.completed_at ?? parent.started_at).toLocaleDateString()}{" "}
              attempt
            </Link>
          ) : (
            "an earlier attempt"
          )}
          {attempt.branch_node_id
            ? ` at “${nodeById(c, attempt.branch_node_id).title}”.`
            : "."}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          onClick={() => goto(stepIndex - 1)}
          disabled={stepIndex === 0}
          className="rounded-full border border-[#E7D6C4] bg-white px-4 py-1.5 text-sm font-medium text-[#3A2B26] disabled:opacity-40"
        >
          ← Previous
        </button>
        <div className="flex flex-1 justify-center gap-1.5">
          {path.map((_, i) => (
            <button
              key={i}
              onClick={() => goto(i)}
              aria-label={`Go to decision ${i + 1}`}
              className={`h-2.5 w-2.5 rounded-full ${
                i === stepIndex ? "bg-[#E88C6E]" : "bg-[#E7D6C4] hover:bg-[#D8C4AC]"
              }`}
            />
          ))}
          <button
            onClick={() => goto(path.length)}
            aria-label="Go to summary"
            className={`h-2.5 w-5 rounded-full ${
              onSummary ? "bg-[#4FA39C]" : "bg-[#E7D6C4] hover:bg-[#D8C4AC]"
            }`}
          />
        </div>
        <button
          onClick={() => goto(stepIndex + 1)}
          disabled={onSummary}
          className="rounded-full border border-[#E7D6C4] bg-white px-4 py-1.5 text-sm font-medium text-[#3A2B26] disabled:opacity-40"
        >
          Next →
        </button>
      </div>

      {onSummary ? (
        <Summary attempt={attempt} parent={parent} c={c} />
      ) : (
        <StepView
          c={c}
          attemptId={attempt.id}
          stepIndex={stepIndex}
          step={step!}
          isTimed={isTimed}
          openRoad={openRoad}
          setOpenRoad={setOpenRoad}
          showUnseen={showUnseen}
          setShowUnseen={setShowUnseen}
        />
      )}

      <DecisionMap
        c={c}
        path={path}
        allPaths={siblings.map((s) => s.path)}
        currentIndex={onSummary ? -1 : stepIndex}
        onSelect={goto}
      />
    </div>
  );
}

function StepView({
  c,
  attemptId,
  stepIndex,
  step,
  isTimed,
  openRoad,
  setOpenRoad,
  showUnseen,
  setShowUnseen,
}: {
  c: ClinicalCase;
  attemptId: string;
  stepIndex: number;
  step: PathStep;
  isTimed: boolean;
  openRoad: string | null;
  setOpenRoad: (v: string | null) => void;
  showUnseen: boolean;
  setShowUnseen: (v: boolean) => void;
}) {
  const node = nodeById(c, step.nodeId);
  const inaction = "inaction" in step.resolution;
  const choice: Choice | undefined =
    "choiceId" in step.resolution
      ? node.choices.find(
          (ch) => ch.id === (step.resolution as { choiceId: string }).choiceId
        )
      : undefined;
  const timedOut = "choiceId" in step.resolution && step.resolution.timedOut;

  const shownSituation =
    isTimed && node.timedOverrides?.situation
      ? node.timedOverrides.situation
      : node.situation;
  const hadUnseen =
    isTimed &&
    (node.timedOverrides?.situation !== undefined ||
      (node.timedOverrides?.hidePerspectives && (node.perspectives?.length ?? 0) > 0));

  const roads = node.choices.filter((ch) => ch.id !== choice?.id);

  return (
    <>
      <div className="mt-4 overflow-hidden rounded-2xl border border-[#E7D6C4] shadow-sm">
        <Scene
          scene={node.scene}
          characters={c.characters}
          timeOfDay={node.timeOfDay}
          scenarioMinutes={step.scenarioClockAfter}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-[#E7D6C4] bg-white p-5">
        <p className="text-sm font-medium uppercase tracking-wide text-[#8A5A44]">
          {node.title} — as you saw it
        </p>
        <p className="mt-1 leading-relaxed text-[#3A2B26]">{shownSituation}</p>
        {hadUnseen && (
          <div className="mt-3">
            <button
              onClick={() => setShowUnseen(!showUnseen)}
              className="rounded-full border border-[#6E5A7A] px-4 py-1.5 text-sm font-medium text-[#6E5A7A] transition-colors hover:bg-[#EDE4F0]"
            >
              {showUnseen ? "Hide" : "Show"} what you didn&rsquo;t have time to see
            </button>
            {showUnseen && (
              <div className="mt-3 space-y-3 rounded-xl bg-[#EDE4F0] p-4">
                {node.timedOverrides?.situation && (
                  <p className="leading-relaxed text-[#3A2B26]">{node.situation}</p>
                )}
                {node.timedOverrides?.hidePerspectives &&
                  node.perspectives?.map((p) => (
                    <blockquote
                      key={p.characterId}
                      className="border-l-4 border-[#6E5A7A] pl-3 text-[#3A2B26]"
                    >
                      <p className="text-xs font-medium uppercase tracking-wide text-[#6E5A7A]">
                        {characterById(c, p.characterId).name}
                      </p>
                      <p className="mt-1 leading-relaxed">{p.text}</p>
                    </blockquote>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 rounded-2xl border border-[#E7D6C4] bg-[#FBF3E9] p-5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium uppercase tracking-wide text-[#8A5A44]">
            {inaction ? "No decision was made" : "Your choice"}
          </p>
          {timedOut && (
            <span className="rounded bg-[#FBE3DA] px-1.5 py-0.5 text-xs font-medium text-[#A34A2E]">
              decided by the clock
            </span>
          )}
          <span className="rounded bg-white px-1.5 py-0.5 text-xs text-[#7A6A5E]">
            {(step.decisionMs / 1000).toFixed(1)}s
          </span>
          <span className="rounded bg-white px-1.5 py-0.5 text-xs text-[#7A6A5E]">
            T+{step.scenarioClockAfter} min after
          </span>
        </div>
        <p className="mt-2 leading-relaxed text-[#3A2B26]">
          {inaction
            ? node.inactionOutcome?.text
            : choice?.dialogue
              ? `“${choice.label}”`
              : choice?.label}
        </p>
        <div className="mt-3">
          <Chips effects={step.effectsApplied} />
        </div>
      </div>

      {(choice || (inaction && node.inactionOutcome)) && (
        <div className="mt-3 space-y-3">
          {(() => {
            const fb = inaction ? node.inactionOutcome!.feedback : choice!.feedback;
            return (
              <>
                <div className="rounded-xl border border-[#E7D6C4] bg-white p-4">
                  <p className="text-sm font-medium uppercase tracking-wide text-[#8A5A44]">
                    What happened
                  </p>
                  <p className="mt-1 leading-relaxed text-[#3A2B26]">{fb.immediate}</p>
                </div>
                {fb.institutional && (
                  <div className="rounded-xl border border-[#E7D6C4] bg-white p-4">
                    <p className="text-sm font-medium uppercase tracking-wide text-[#6E5A7A]">
                      The institution
                    </p>
                    <p className="mt-1 leading-relaxed text-[#3A2B26]">{fb.institutional}</p>
                  </div>
                )}
                <div className="rounded-xl border-l-4 border-[#8A5A44] bg-[#FBF3E9] p-4">
                  <p className="text-sm font-medium uppercase tracking-wide text-[#8A5A44]">
                    What this choice protected — and risked
                  </p>
                  <p className="mt-1 leading-relaxed text-[#3A2B26]">{fb.ethical}</p>
                </div>
                {fb.delayed?.map((d) => (
                  <div
                    key={d.id}
                    className="rounded-xl border-l-4 border-[#B0716B] bg-[#F7ECEA] p-4"
                  >
                    <p className="text-sm font-medium uppercase tracking-wide text-[#B0716B]">
                      Surfaced later
                    </p>
                    <p className="mt-1 leading-relaxed text-[#4A3230]">{d.text}</p>
                    {d.effects && (
                      <div className="mt-2">
                        <Chips effects={d.effects} />
                      </div>
                    )}
                  </div>
                ))}
                {step.branchReason && (
                  <p className="rounded-xl bg-[#EDE4F0] p-3 text-sm italic leading-relaxed text-[#6E5A7A]">
                    What this set in motion: {step.branchReason}.
                  </p>
                )}
              </>
            );
          })()}
        </div>
      )}

      {roads.length > 0 && (
        <div className="mt-4 rounded-2xl border border-[#E7D6C4] bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="text-sm font-medium uppercase tracking-wide text-[#8A5A44]">
              Roads not taken
            </p>
            <Link
              href={`/case/${c.id}?branchFrom=${attemptId}&atStep=${stepIndex}`}
              className="rounded-full bg-[#6E5A7A] px-3.5 py-1 text-sm font-medium text-white transition-colors hover:bg-[#5C4A66]"
            >
              Explore another decision from this point →
            </Link>
          </div>
          <p className="mt-1 text-sm text-[#7A6A5E]">
            What each would have set off immediately — the full paths stay yours to
            discover by replaying.
          </p>
          <div className="mt-3 space-y-2">
            {roads.map((r) => {
              const open = openRoad === r.id;
              return (
                <div key={r.id} className="rounded-xl border border-[#E7D6C4]">
                  <button
                    onClick={() => setOpenRoad(open ? null : r.id)}
                    className="w-full p-3 text-left text-sm leading-snug text-[#3A2B26] hover:bg-[#FDF6F0]"
                  >
                    <span className="mr-1 text-[#8A5A44]">{open ? "▾" : "▸"}</span>
                    {r.dialogue ? `“${r.label}”` : r.label}
                  </button>
                  {open && (
                    <div className="space-y-2 border-t border-[#E7D6C4] p-3">
                      <p className="text-sm leading-relaxed text-[#3A2B26]">
                        {r.feedback.immediate}
                      </p>
                      <Chips effects={r.effects} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

function Summary({
  attempt,
  parent,
  c,
}: {
  attempt: AttemptRow;
  parent: AttemptRow | null;
  c: ClinicalCase;
}) {
  const metrics = attempt.final_metrics;
  return (
    <div className="mt-4 space-y-4">
      {attempt.outcome_summary && (
        <p className="rounded-2xl border border-[#E7D6C4] bg-[#FBF3E9] p-5 leading-relaxed text-[#5A4A40]">
          {attempt.outcome_summary}
        </p>
      )}

      {parent?.final_metrics && metrics && (
        <div className="rounded-2xl border border-[#6E5A7A] bg-white p-5">
          <h2 className="text-lg font-semibold text-[#3A2B26]">
            Original path vs. this counterfactual
          </h2>
          <p className="mt-1 text-sm text-[#7A6A5E]">
            Same case, same starting decisions — the difference is what you did
            after the branch.
          </p>
          <div className="mt-3 space-y-2">
            {STAKEHOLDERS.map((s) => {
              const a = stakeholderTotals(parent.final_metrics as MetricState)[s.key];
              const b = stakeholderTotals(metrics as MetricState)[s.key];
              const d = b - a;
              return (
                <div
                  key={s.key}
                  className="flex items-baseline justify-between gap-3 rounded-lg bg-[#FBF3E9] px-3 py-2"
                >
                  <span className="text-sm font-medium tracking-wide text-[#3A2B26]">
                    {s.label}
                  </span>
                  <span className="text-sm text-[#7A6A5E]">
                    original {a > 0 ? `+${a}` : a} → this {b > 0 ? `+${b}` : b}{" "}
                    <span
                      className={`font-semibold ${
                        d > 0 ? "text-[#2E6B66]" : d < 0 ? "text-[#A34A2E]" : "text-[#7A6A5E]"
                      }`}
                    >
                      ({d > 0 ? `+${d}` : d})
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
          {parent.outcome_summary && parent.outcome_summary !== attempt.outcome_summary && (
            <p className="mt-3 text-sm leading-relaxed text-[#5A4A40]">
              <span className="font-medium text-[#3A2B26]">Originally: </span>
              {parent.outcome_summary}
            </p>
          )}
        </div>
      )}
      {metrics && (
        <div className="rounded-2xl border border-[#E7D6C4] bg-white p-5">
          <h2 className="text-lg font-semibold text-[#3A2B26]">Where it all landed</h2>
          <div className="mt-3 space-y-3">
            {STAKEHOLDERS.map((s) => {
              const totals = stakeholderTotals(metrics as MetricState);
              const v = totals[s.key];
              return (
                <div key={s.key}>
                  <div className="flex items-baseline justify-between">
                    <span className="font-medium tracking-wide text-[#3A2B26]">{s.label}</span>
                    <span
                      className={`text-sm font-semibold ${
                        v > 0 ? "text-[#2E6B66]" : v < 0 ? "text-[#A34A2E]" : "text-[#7A6A5E]"
                      }`}
                    >
                      {v > 0 ? `+${v}` : v}
                    </span>
                  </div>
                  <div className="mt-1 grid gap-x-6 gap-y-1 sm:grid-cols-2">
                    {metricsFor(s.key).map((m) => {
                      const mv = (metrics as MetricState)[m.key];
                      return (
                        <div key={m.key} className="flex items-baseline justify-between gap-4">
                          <span className="text-sm text-[#5A4A40]">{m.label}</span>
                          <span
                            className={`text-sm font-medium ${
                              mv > 0
                                ? "text-[#2E6B66]"
                                : mv < 0
                                  ? "text-[#A34A2E]"
                                  : "text-[#7A6A5E]"
                            }`}
                          >
                            {mv > 0 ? `+${mv}` : mv}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="flex gap-3">
        <Link
          href={`/case/${c.id}`}
          className="rounded-xl bg-[#E88C6E] px-5 py-3 font-medium text-white transition-colors hover:bg-[#D97B5D]"
        >
          Replay this case
        </Link>
        <Link
          href="/dashboard"
          className="rounded-xl border border-[#E7D6C4] bg-white px-5 py-3 font-medium text-[#3A2B26] transition-colors hover:bg-[#FBF3E9]"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-[#3A2B26]">{title}</h1>
      <div className="mt-6">{children}</div>
    </div>
  );
}
