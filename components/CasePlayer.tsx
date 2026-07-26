"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import type {
  CaseNode,
  Choice,
  ClinicalCase,
  DelayedOutcome,
  MetricState,
  PathStep,
} from "@/lib/types";
import { METRICS, STAKEHOLDERS, initialMetrics, metricsFor } from "@/lib/types";
import {
  applyEffects,
  characterById,
  dueDelayed,
  evalCondition,
  nodeById,
  resolveNext,
  stakeholderTotals,
} from "@/lib/engine";
import type { Condition } from "@/lib/types";
import type { EvalContext } from "@/lib/engine";

function evalConditionSafe(cond: Condition, ctx: EvalContext): boolean {
  try {
    return evalCondition(cond, ctx);
  } catch {
    return false;
  }
}
import Scene from "./Scene";

interface Props {
  clinicalCase: ClinicalCase;
}

type Phase =
  | { kind: "node" }
  | { kind: "feedback"; choice: Choice }
  | { kind: "daybreak"; toNodeId: string; delivered: DelayedOutcome[] };

const metricLabel = (key: string) => METRICS.find((m) => m.key === key)?.label ?? key;

export default function CasePlayer({ clinicalCase: c }: Props) {
  const [nodeId, setNodeId] = useState(c.startNodeId);
  const [metrics, setMetrics] = useState<MetricState>(initialMetrics);
  const [clock, setClock] = useState(0);
  const [path, setPath] = useState<PathStep[]>([]);
  const [phase, setPhase] = useState<Phase>({ kind: "node" });
  const [queue, setQueue] = useState<DelayedOutcome[]>([]);
  const [arrivals, setArrivals] = useState<DelayedOutcome[]>([]);
  const [showPerspectives, setShowPerspectives] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const nodeShownAt = useRef<number>(Date.now());

  const node = nodeById(c, nodeId);
  const isTerminal = node.choices.length === 0;
  const beat = phase.kind === "feedback" ? path.length : path.length + 1;

  const patientChars = useMemo(
    () => c.characters.filter((ch) => ch.role === "patient"),
    [c]
  );

  const choose = (choice: Choice) => {
    const decisionMs = Date.now() - nodeShownAt.current;
    const newClock = clock + (choice.timeCost ?? 0);
    const newMetrics = applyEffects(metrics, choice.effects);
    const ctx = { metrics: newMetrics, scenarioClock: newClock, path };
    const rule = resolveNext(choice.next, ctx);
    setMetrics(newMetrics);
    setClock(newClock);
    setPath((p) => [
      ...p,
      {
        nodeId: node.id,
        resolution: { choiceId: choice.id, timedOut: false },
        decisionMs,
        scenarioClockAfter: newClock,
        effectsApplied: choice.effects,
        branchReason: rule.reason,
      },
    ]);
    if (choice.feedback.delayed?.length) {
      setQueue((q) => [...q, ...choice.feedback.delayed!]);
    }
    setPhase({ kind: "feedback", choice });
  };

  const advance = () => {
    if (phase.kind !== "feedback") return;
    const rule = resolveNext(phase.choice.next, { metrics, scenarioClock: clock, path });
    const target = nodeById(c, rule.nodeId);
    const dayChanged =
      target.day !== undefined && node.day !== undefined && target.day > node.day;

    if (dayChanged && target.dayBreak) {
      const due = dueDelayed(queue, { kind: "dayBreak", toDay: target.day! });
      deliver(due);
      setPhase({ kind: "daybreak", toNodeId: target.id, delivered: due });
      return;
    }
    enterNode(target.id);
  };

  const enterNode = (id: string) => {
    const due = [
      ...dueDelayed(queue, { kind: "node", nodeId: id }),
      ...dueDelayed(queue, { kind: "clock", minutes: clock }),
    ];
    deliver(due);
    setArrivals(due);
    setNodeId(id);
    setPhase({ kind: "node" });
    setShowPerspectives(false);
    nodeShownAt.current = Date.now();
  };

  const deliver = (due: DelayedOutcome[]) => {
    if (!due.length) return;
    setQueue((q) => q.filter((d) => !due.includes(d)));
    setMetrics((m) => due.reduce((acc, d) => (d.effects ? applyEffects(acc, d.effects) : acc), m));
  };

  const restart = () => {
    setNodeId(c.startNodeId);
    setMetrics(initialMetrics());
    setClock(0);
    setPath([]);
    setPhase({ kind: "node" });
    setQueue([]);
    setArrivals([]);
    setShowPerspectives(false);
    nodeShownAt.current = Date.now();
  };

  /* ---------- day-break interstitial ---------- */
  if (phase.kind === "daybreak") {
    const target = nodeById(c, phase.toNodeId);
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-2xl border border-[#E7D6C4] bg-[#FBF3E9] p-8 text-center">
          <div className="mx-auto flex h-16 w-16 flex-col overflow-hidden rounded-xl border border-[#D97B5D] bg-white">
            <div className="h-5 bg-[#E88C6E]" />
            <div className="flex flex-1 items-center justify-center text-2xl font-semibold text-[#3A2B26]">
              {target.day}
            </div>
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-[#3A2B26]">
            Day {target.day}
            {target.timeOfDay ? ` — ${target.timeOfDay}` : ""}
          </h1>
          {target.dayBreak && (
            <p className="mx-auto mt-3 max-w-xl leading-relaxed text-[#5A4A40]">
              {target.dayBreak.narration}
            </p>
          )}
          {phase.delivered.map((d) => (
            <div
              key={d.id}
              className="mx-auto mt-3 max-w-xl rounded-xl border border-[#E7D6C4] bg-white p-4 text-left leading-relaxed text-[#3A2B26]"
            >
              {d.text}
            </div>
          ))}
          <button
            onClick={() => enterNode(phase.toNodeId)}
            className="mt-6 rounded-xl bg-[#E88C6E] px-6 py-3 font-medium text-white transition-colors hover:bg-[#D97B5D]"
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  /* ---------- results ---------- */
  if (isTerminal) {
    return (
      <Results
        clinicalCase={c}
        metrics={metrics}
        path={path}
        clock={clock}
        outcomeSummary={node.outcomeSummary}
        aftermath={arrivals}
        onRestart={restart}
      />
    );
  }

  /* ---------- scene with dialogue bubble preview ---------- */
  const sceneBubbles = [
    ...(node.scene.bubbles ?? []),
    ...(phase.kind === "feedback" && phase.choice.dialogue
      ? [{ characterId: phase.choice.dialogue.speakerId, text: phase.choice.label }]
      : []),
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-4 flex items-baseline justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-[#8A5A44] hover:underline">
            ← All encounters
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-[#3A2B26]">{c.title}</h1>
          <p className="text-sm text-[#7A6A5E]">{c.setting}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="rounded-full bg-[#F6E3D0] px-3 py-1 text-xs font-medium text-[#8A5A44]">
            {node.title} · beat {beat}
          </span>
          {(node.day || node.timeOfDay || node.scene.wallClock) && (
            <span className="rounded-full bg-[#EDE4F0] px-3 py-1 text-xs font-medium text-[#6E5A7A]">
              {node.day ? `Day ${node.day}` : ""}
              {node.day && node.timeOfDay ? " · " : ""}
              {node.timeOfDay ?? ""}
              {node.scene.wallClock ? ` · T+${clock} min` : ""}
            </span>
          )}
        </div>
      </header>

      {node.inlineCaption && (
        <p className="mb-2 text-sm italic text-[#7A6A5E]">{node.inlineCaption}</p>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#E7D6C4] shadow-sm">
        <Scene
          scene={{ ...node.scene, bubbles: sceneBubbles }}
          characters={c.characters}
          timeOfDay={node.timeOfDay}
          scenarioMinutes={clock}
        />
      </div>

      {arrivals.length > 0 && phase.kind === "node" && (
        <div className="mt-3 space-y-2">
          {arrivals.map((d) => (
            <div
              key={d.id}
              className="rounded-xl border-l-4 border-[#B0716B] bg-[#F7ECEA] p-4 leading-relaxed text-[#4A3230]"
            >
              {d.text}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-[#E7D6C4] bg-white p-5">
        <p className="leading-relaxed text-[#3A2B26]">{node.situation}</p>

        {node.perspectives && node.perspectives.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowPerspectives((v) => !v)}
              className="rounded-full border border-[#4FA39C] px-4 py-1.5 text-sm font-medium text-[#2E6B66] transition-colors hover:bg-[#4FA39C] hover:text-white"
            >
              {showPerspectives ? "Hide" : "See"} what{" "}
              {node.perspectives
                .map((p) => characterById(c, p.characterId).name.split(" ")[0])
                .join(" and ")}{" "}
              {node.perspectives.length > 1 ? "are" : "is"} experiencing
            </button>
            {showPerspectives &&
              node.perspectives.map((p) => (
                <blockquote
                  key={p.characterId}
                  className="mt-3 rounded-xl border-l-4 border-[#4FA39C] bg-[#EDF6F5] p-4 text-[#2E4B48]"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-[#2E6B66]">
                    {characterById(c, p.characterId).name}
                  </p>
                  <p className="mt-1">{p.text}</p>
                </blockquote>
              ))}
          </div>
        )}
      </div>

      {phase.kind === "node" ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium uppercase tracking-wide text-[#8A5A44]">
            What do you do?
          </p>
          {node.choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => choose(choice)}
              aria-label={choice.dialogue ? `Say: ${choice.label}` : choice.label}
              className="block w-full rounded-xl border border-[#E7D6C4] bg-white p-4 text-left leading-snug text-[#3A2B26] transition-all hover:border-[#E88C6E] hover:bg-[#FDF6F0] hover:shadow-sm"
            >
              {choice.dialogue ? (
                <span>
                  <span className="mr-2 rounded bg-[#EDE4F0] px-1.5 py-0.5 text-xs font-medium text-[#6E5A7A]">
                    say
                  </span>
                  &ldquo;{choice.label}&rdquo;
                </span>
              ) : (
                choice.label
              )}
            </button>
          ))}
        </div>
      ) : (
        <FeedbackPanel
          c={c}
          choice={phase.choice}
          showScores={c.scoring === "standard"}
          onContinue={advance}
        />
      )}

      {patientChars.some((ch) => ch.bio) && (
        <div className="mt-6 rounded-xl border border-[#E7D6C4] bg-white">
          <button
            onClick={() => setShowAbout((v) => !v)}
            className="w-full p-4 text-left text-sm font-medium text-[#8A5A44]"
          >
            About {patientChars.map((ch) => ch.name).join(" & ")} {showAbout ? "▴" : "▾"}
          </button>
          {showAbout &&
            patientChars
              .filter((ch) => ch.bio)
              .map((ch) => (
                <div
                  key={ch.id}
                  className="border-t border-[#E7D6C4] p-4 text-sm leading-relaxed text-[#3A2B26]"
                >
                  <p className="font-medium text-[#8A5A44]">{ch.name}</p>
                  <p className="mt-1 italic text-[#5A4A40]">&ldquo;{ch.bio}&rdquo;</p>
                  {ch.accessNeeds && (
                    <p className="mt-2 text-[#5A4A40]">
                      <span className="font-medium text-[#8A5A44]">Access needs: </span>
                      {ch.accessNeeds.join(" · ")}
                    </p>
                  )}
                </div>
              ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function FeedbackPanel({
  c,
  choice,
  showScores,
  onContinue,
}: {
  c: ClinicalCase;
  choice: Choice;
  showScores: boolean;
  onContinue: () => void;
}) {
  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-xl border border-[#E7D6C4] bg-[#FBF3E9] p-4">
        <p className="text-sm font-medium uppercase tracking-wide text-[#8A5A44]">Your choice</p>
        <p className="mt-1 text-[#3A2B26]">
          {choice.dialogue ? <>&ldquo;{choice.label}&rdquo;</> : choice.label}
        </p>
        {showScores && (
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(choice.effects).map(([k, v]) =>
              v ? (
                <span
                  key={k}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    v > 0 ? "bg-[#DFF0EE] text-[#2E6B66]" : "bg-[#FBE3DA] text-[#A34A2E]"
                  }`}
                >
                  {metricLabel(k)} {v > 0 ? `+${v}` : v}
                </span>
              ) : null
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-[#E7D6C4] bg-white p-4">
        <p className="text-sm font-medium uppercase tracking-wide text-[#8A5A44]">
          What happens now
        </p>
        <p className="mt-1 leading-relaxed text-[#3A2B26]">{choice.feedback.immediate}</p>
      </div>

      {choice.feedback.institutional && (
        <div className="rounded-xl border border-[#E7D6C4] bg-white p-4">
          <p className="text-sm font-medium uppercase tracking-wide text-[#6E5A7A]">
            The institution
          </p>
          <p className="mt-1 leading-relaxed text-[#3A2B26]">{choice.feedback.institutional}</p>
        </div>
      )}

      <div className="rounded-xl border-l-4 border-[#8A5A44] bg-[#FBF3E9] p-4">
        <p className="text-sm font-medium uppercase tracking-wide text-[#8A5A44]">
          What this choice protected — and risked
        </p>
        <p className="mt-1 leading-relaxed text-[#3A2B26]">{choice.feedback.ethical}</p>
      </div>

      {choice.feedback.delayed && choice.feedback.delayed.length > 0 && (
        <p className="text-sm italic text-[#7A6A5E]">
          Some consequences of this choice will surface later…
        </p>
      )}

      <button
        onClick={onContinue}
        className="w-full rounded-xl bg-[#E88C6E] px-4 py-3 font-medium text-white transition-colors hover:bg-[#D97B5D]"
      >
        Continue →
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Results({
  clinicalCase: c,
  metrics,
  path,
  clock,
  outcomeSummary,
  aftermath,
  onRestart,
}: {
  clinicalCase: ClinicalCase;
  metrics: MetricState;
  path: PathStep[];
  clock: number;
  outcomeSummary?: string;
  aftermath: DelayedOutcome[];
  onRestart: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const totals = stakeholderTotals(metrics);
  const RANGE = 8;

  const ctx = { metrics, scenarioClock: clock, path };
  const shownReflections = c.epilogue.reflections.filter((r, i, all) => {
    const firstMatch = all.find(
      (x) => x.characterId === r.characterId && (!x.when || evalConditionSafe(x.when, ctx))
    );
    return firstMatch === r;
  });

  const choiceById = (nodeId: string, choiceId: string) =>
    nodeById(c, nodeId).choices.find((ch) => ch.id === choiceId);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="text-sm text-[#8A5A44] hover:underline">
        ← All encounters
      </Link>
      <h1 className="mt-1 text-2xl font-semibold text-[#3A2B26]">The encounter is over</h1>
      {outcomeSummary && (
        <p className="mt-2 rounded-xl border border-[#E7D6C4] bg-[#FBF3E9] p-4 leading-relaxed text-[#5A4A40]">
          {outcomeSummary}
        </p>
      )}

      {c.scoring === "standard" && (
        <div className="mt-6 rounded-2xl border border-[#E7D6C4] bg-white p-5">
          <h2 className="text-lg font-semibold text-[#3A2B26]">How the encounter went</h2>
          <p className="mt-1 text-sm text-[#7A6A5E]">
            Three forces, eight measures — a strong result for one can hide harm to another.
            Click a stakeholder to see its components.
          </p>
          <div className="mt-4 space-y-4">
            {STAKEHOLDERS.map((s) => {
              const value = totals[s.key];
              const pct = (Math.min(Math.abs(value), RANGE) / RANGE) * 50;
              const isOpen = expanded === s.key;
              return (
                <div key={s.key}>
                  <button className="w-full" onClick={() => setExpanded(isOpen ? null : s.key)}>
                    <div className="flex items-baseline justify-between">
                      <span className="font-medium tracking-wide text-[#3A2B26]">
                        {s.label} {isOpen ? "▴" : "▾"}
                      </span>
                      <span className="text-sm text-[#7A6A5E]">
                        {value > 0 ? `+${value}` : value}
                      </span>
                    </div>
                    <div className="relative mt-1 h-3 rounded-full bg-[#F3E8DA]">
                      <div className="absolute left-1/2 top-0 h-3 w-px bg-[#C9B295]" />
                      <div
                        className={`absolute top-0 h-3 ${
                          value >= 0 ? "rounded-r-full bg-[#4FA39C]" : "rounded-l-full bg-[#E88C6E]"
                        }`}
                        style={
                          value >= 0
                            ? { left: "50%", width: `${pct}%` }
                            : { right: "50%", width: `${pct}%` }
                        }
                      />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="mt-2 space-y-2 rounded-xl bg-[#FBF3E9] p-3">
                      {metricsFor(s.key).map((m) => {
                        const v = metrics[m.key];
                        return (
                          <div key={m.key} className="flex items-baseline justify-between gap-4">
                            <span className="text-sm text-[#3A2B26]">{m.label}</span>
                            <span
                              className={`text-sm font-medium ${
                                v > 0 ? "text-[#2E6B66]" : v < 0 ? "text-[#A34A2E]" : "text-[#7A6A5E]"
                              }`}
                            >
                              {v > 0 ? `+${v}` : v}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-[#E7D6C4] bg-white p-5">
        <h2 className="text-lg font-semibold text-[#3A2B26]">Your path</h2>
        <ol className="mt-3 space-y-2">
          {path.map((step, i) => {
            const n = nodeById(c, step.nodeId);
            const ch =
              "choiceId" in step.resolution
                ? choiceById(step.nodeId, step.resolution.choiceId)
                : undefined;
            return (
              <li key={i} className="text-sm leading-relaxed">
                <span className="font-medium text-[#8A5A44]">{n.title}: </span>
                <span className="text-[#3A2B26]">{ch?.label ?? "(no decision)"}</span>
                {step.branchReason && (
                  <span className="ml-1 italic text-[#7A6A5E]">— {step.branchReason}</span>
                )}
              </li>
            );
          })}
        </ol>
        {clock > 0 && (
          <p className="mt-3 text-sm text-[#7A6A5E]">Scenario time elapsed: {clock} minutes.</p>
        )}
      </div>

      {aftermath.length > 0 && (
        <div className="mt-4 rounded-2xl border border-[#B0716B] bg-[#F7ECEA] p-5">
          <h2 className="text-lg font-semibold text-[#4A3230]">Aftermath</h2>
          {aftermath.map((d) => (
            <p key={d.id} className="mt-2 leading-relaxed text-[#4A3230]">
              {d.text}
            </p>
          ))}
        </div>
      )}

      {shownReflections.map((r) => (
        <blockquote
          key={r.characterId}
          className="mt-4 rounded-2xl border-l-4 border-[#4FA39C] bg-[#EDF6F5] p-5"
        >
          <p className="text-sm font-medium uppercase tracking-wide text-[#2E6B66]">
            {characterById(c, r.characterId).name}, afterward
          </p>
          <p className="mt-2 leading-relaxed text-[#2E4B48]">{r.text}</p>
        </blockquote>
      ))}

      <div className="mt-4 rounded-2xl border border-[#E7D6C4] bg-white p-5">
        <h2 className="text-lg font-semibold text-[#3A2B26]">To sit with</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-[#3A2B26]">
          {c.epilogue.reflectionPrompts.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>

      {c.readingConnections.length > 0 && (
        <div className="mt-4 rounded-2xl border border-[#E7D6C4] bg-[#FBF3E9] p-5">
          <h2 className="text-lg font-semibold text-[#3A2B26]">Connections to the readings</h2>
          <ul className="mt-3 space-y-3">
            {c.readingConnections.map((r, i) => (
              <li key={i} className="leading-relaxed text-[#5A4A40]">
                <span className="font-medium text-[#3A2B26]">{r.source}: </span>
                {r.connection}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          onClick={onRestart}
          className="rounded-xl bg-[#E88C6E] px-5 py-3 font-medium text-white transition-colors hover:bg-[#D97B5D]"
        >
          Replay — choose differently
        </button>
        <Link
          href="/"
          className="rounded-xl border border-[#E7D6C4] bg-white px-5 py-3 font-medium text-[#3A2B26] transition-colors hover:bg-[#FBF3E9]"
        >
          All encounters
        </Link>
      </div>
    </div>
  );
}
