"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import {
  abandonAttempt,
  completeAttempt,
  createAttempt,
  getAttempt,
  latestInProgress,
  saveProgress,
  type AttemptRow,
} from "@/lib/attempts";
import type {
  CaseMode,
  CaseNode,
  Choice,
  ClinicalCase,
  Condition,
  DelayedOutcome,
  Effects,
  MetricState,
  NextRule,
  PathStep,
} from "@/lib/types";
import { METRICS, STAKEHOLDERS, initialMetrics, metricsFor } from "@/lib/types";
import {
  applyEffects,
  adjustSceneMoods,
  applyPatientEffects,
  clampEffects,
  clampPatientEffects,
  mergePatientEffects,
  characterById,
  dueDelayed,
  evalCondition,
  initialPatientMetrics,
  isMultiPatient,
  nodeById,
  buildScoreRows,
  replayPrefix,
  resolveNext,
  stakeholderTotals,
} from "@/lib/engine";
import type { EvalContext } from "@/lib/engine";
import SceneRenderer from "./scenes";
import ReflectionComposer from "./ReflectionComposer";

function evalConditionSafe(cond: Condition, ctx: EvalContext): boolean {
  try {
    return evalCondition(cond, ctx);
  } catch {
    return false;
  }
}

interface Props {
  clinicalCase: ClinicalCase;
}

type Phase =
  | { kind: "node" }
  | { kind: "feedback"; choice: Choice }
  /**
   * Timed mode: what the decision did in the short term. The clock is stopped
   * here, and the next decision's timer does not start until Continue.
   */
  | {
      kind: "impact";
      immediate: string;
      effects: Effects;
      next: NextRule[];
    }
  /** Timed mode: the clock ran out; show what got chosen before its impact. */
  | {
      kind: "timeout";
      label: string;
      dialogue: boolean;
      inactionText?: string;
      immediate: string;
      effects: Effects;
      next: NextRule[];
    }
  | { kind: "daybreak"; toNodeId: string; delivered: DelayedOutcome[] };

const metricLabel = (key: string) => METRICS.find((m) => m.key === key)?.label ?? key;

const GRACE_MS = 2000;


export default function CasePlayer({ clinicalCase: c }: Props) {
  const { enabled: authEnabled, loading: authLoading, user } = useAuth();
  const [mode, setMode] = useState<CaseMode | null>(
    c.modes.length === 1 ? c.modes[0] : null
  );
  const [nodeId, setNodeId] = useState(c.startNodeId);
  const [metrics, setMetrics] = useState<MetricState>(initialMetrics);
  const [patients, setPatients] = useState<Record<string, MetricState>>(() =>
    initialPatientMetrics(c)
  );
  const [clock, setClock] = useState(0);
  const [path, setPath] = useState<PathStep[]>([]);
  const [phase, setPhase] = useState<Phase>({ kind: "node" });
  const [queue, setQueue] = useState<DelayedOutcome[]>([]);
  const [arrivals, setArrivals] = useState<DelayedOutcome[]>([]);
  const [showPerspectives, setShowPerspectives] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [resumeOffer, setResumeOffer] = useState<AttemptRow | null>(null);
  const [branch, setBranch] = useState<{
    parentId: string;
    stepIndex: number;
    parentDate: string;
  } | null>(null);
  const [timerFraction, setTimerFraction] = useState<number | null>(null);
  const [timeAnnouncement, setTimeAnnouncement] = useState("");
  const [liveHesMin, setLiveHesMin] = useState(0);
  const nodeShownAt = useRef<number>(Date.now());
  const attemptId = useRef<string | null>(null);
  const completed = useRef(false);
  const firedTimeout = useRef(false);

  const node = nodeById(c, nodeId);
  const isTerminal = node.choices.length === 0;
  const beat = phase.kind === "node" ? path.length + 1 : path.length;
  const isTimed = mode === "timed";
  const hesRate = c.timing?.hesitationSecondsPerScenarioMinute;

  const patientChars = useMemo(
    () => c.characters.filter((ch) => ch.role === "patient"),
    [c]
  );

  /* ------------------------------------------------------------ */
  /* Persistence                                                   */
  /* ------------------------------------------------------------ */

  /* Counterfactual entry: /case/x?branchFrom=<attemptId>&atStep=<index> */
  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    const parentId = params.get("branchFrom");
    const atStep = Number(params.get("atStep"));
    if (!parentId || Number.isNaN(atStep)) return;

    getAttempt(parentId).then((parent) => {
      if (!parent || parent.case_id !== c.id || !parent.path[atStep]) return;
      const prefix = replayPrefix(c, parent.path, atStep);
      setMode(parent.mode);
      setNodeId(prefix.nodeId);
      setMetrics(prefix.metrics);
      setPatients(prefix.patients);
      setClock(prefix.clock);
      setPath(prefix.path);
      setQueue(prefix.queue);
      setPhase({ kind: "node" });
      setResumeOffer(null);
      setBranch({
        parentId,
        stepIndex: atStep,
        parentDate: new Date(
          parent.completed_at ?? parent.started_at
        ).toLocaleDateString(),
      });
      nodeShownAt.current = Date.now();
    });
  }, [user, c]);

  useEffect(() => {
    if (!user || branch) return;
    if (new URLSearchParams(window.location.search).has("branchFrom")) return;
    latestInProgress(user.id, c.id).then((row) => {
      if (!row) return;
      const staleVersion = row.case_version !== c.caseVersion;
      const timedNoResume = row.mode === "timed" && c.timing?.leavingEndsAttempt;
      if (staleVersion || timedNoResume || !row.state) abandonAttempt(row.id);
      else setResumeOffer(row);
    });
  }, [user, branch, c.id, c.caseVersion, c.timing?.leavingEndsAttempt]);

  useEffect(() => {
    if (!attemptId.current || completed.current) return;
    if (phase.kind !== "node" || path.length === 0 || isTerminal) return;
    saveProgress(attemptId.current, { nodeId, metrics, clock, path, queue });
  }, [nodeId, phase.kind, path, metrics, clock, queue, isTerminal]);

  useEffect(() => {
    if (!isTerminal || completed.current || !attemptId.current) return;
    completed.current = true;
    completeAttempt(attemptId.current, metrics, path, node.outcomeSummary);
  }, [isTerminal, metrics, path, node.outcomeSummary]);

  /* ------------------------------------------------------------ */
  /* Core decision flow                                            */
  /* ------------------------------------------------------------ */

  const choose = (choice: Choice, opts: { timedOut?: boolean } = {}) => {
    if (user && !attemptId.current && mode && (path.length === 0 || branch)) {
      createAttempt(
        user.id,
        c.id,
        c.caseVersion,
        mode,
        branch ? { parentAttemptId: branch.parentId, branchNodeId: node.id } : undefined
      ).then((id) => {
        attemptId.current = id;
      });
      if (resumeOffer) {
        abandonAttempt(resumeOffer.id);
        setResumeOffer(null);
      }
    }
    const decisionMs = Date.now() - nodeShownAt.current;
    const elapsedSec = decisionMs / 1000;
    const hesMin = isTimed && hesRate ? Math.floor(elapsedSec / hesRate) : 0;
    const newClock = clock + hesMin + (choice.timeCost ?? 0);

    /*
     * Merge authored effects with the timing-derived operational efficiency
     * bonuses, then clamp: no single decision moves a metric by more than
     * MAX_EFFECT_PER_DECISION, however the bonuses stack.
     */
    const raw: Effects = { ...choice.effects };
    if (isTimed && !opts.timedOut) {
      const speed = c.timing?.decisionSpeed?.find((t) => elapsedSec <= t.withinSeconds);
      if (speed) raw.operationalEfficiency = (raw.operationalEfficiency ?? 0) + speed.delta;
    }
    const milestone = c.timing?.milestones?.find((m) => m.onChoiceId === choice.id);
    if (milestone) {
      const tier = milestone.tiers.find((t) => newClock <= t.byMinute);
      if (tier) raw.operationalEfficiency = (raw.operationalEfficiency ?? 0) + tier.delta;
    }
    const effects = clampEffects(raw);
    const patientEffects = clampPatientEffects(choice.patientEffects);

    const newMetrics = applyEffects(metrics, mergePatientEffects(effects, patientEffects));
    const newPatients = applyPatientEffects(patients, patientEffects);
    const ctx = { metrics: newMetrics, scenarioClock: newClock, path, patients: newPatients };
    const rule = resolveNext(choice.next, ctx);
    setMetrics(newMetrics);
    setPatients(newPatients);
    setClock(newClock);
    setLiveHesMin(0);
    setPath((p) => [
      ...p,
      {
        nodeId: node.id,
        resolution: { choiceId: choice.id, timedOut: opts.timedOut ?? false },
        decisionMs,
        scenarioClockAfter: newClock,
        effectsApplied: effects,
        patientEffectsApplied: patientEffects,
        branchReason: rule.reason,
      },
    ]);
    if (choice.feedback.delayed?.length) {
      setQueue((q) => [...q, ...choice.feedback.delayed!]);
    }
    setPhase(
      !isTimed
        ? { kind: "feedback", choice }
        : opts.timedOut
          ? {
              kind: "timeout",
              label: choice.label,
              dialogue: Boolean(choice.dialogue),
              immediate: choice.feedback.immediate,
              effects,
              next: choice.next,
            }
          : {
              kind: "impact",
              immediate: choice.feedback.immediate,
              effects,
              next: choice.next,
            }
    );
  };

  const handleTimeout = () => {
    if (node.inactionOutcome) {
      const io = node.inactionOutcome;
      const decisionMs = Date.now() - nodeShownAt.current;
      const hesMin = hesRate ? Math.floor(decisionMs / 1000 / hesRate) : 0;
      const newClock = clock + hesMin;
      const newMetrics = applyEffects(metrics, mergePatientEffects(io.effects, io.patientEffects));
      const newPatients = applyPatientEffects(patients, io.patientEffects);
      setMetrics(newMetrics);
      setPatients(newPatients);
      setClock(newClock);
      setLiveHesMin(0);
      setPath((p) => [
        ...p,
        {
          nodeId: node.id,
          resolution: { inaction: true },
          decisionMs,
          scenarioClockAfter: newClock,
          effectsApplied: io.effects,
          patientEffectsApplied: io.patientEffects,
        },
      ]);
      if (io.feedback.delayed?.length) setQueue((q) => [...q, ...io.feedback.delayed!]);
      setPhase({
        kind: "timeout",
        label: "",
        dialogue: false,
        inactionText: io.text,
        immediate: io.feedback.immediate,
        effects: io.effects,
        next: io.next,
      });
      return;
    }
    const saver = node.choices.find((ch) => ch.timeSaver);
    if (saver) choose(saver, { timedOut: true });
  };
  const latestTimeout = useRef(handleTimeout);
  latestTimeout.current = handleTimeout;

  const advanceRules = (rules: NextRule[]) => {
    const rule = resolveNext(rules, { metrics, scenarioClock: clock, path, patients });
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
    firedTimeout.current = false;
    nodeShownAt.current = Date.now();
  };

  const deliver = (due: DelayedOutcome[]) => {
    if (!due.length) return;
    setQueue((q) => q.filter((d) => !due.includes(d)));
    setMetrics((m) =>
      due.reduce(
        (acc, d) => applyEffects(acc, mergePatientEffects(d.effects ?? {}, d.patientEffects)),
        m
      )
    );
    setPatients((ps) => due.reduce((acc, d) => applyPatientEffects(acc, d.patientEffects), ps));
  };

  const restart = () => {
    if (attemptId.current && !completed.current) abandonAttempt(attemptId.current);
    attemptId.current = null;
    completed.current = false;
    firedTimeout.current = false;
    setBranch(null);
    setMode(c.modes.length === 1 ? c.modes[0] : null);
    setNodeId(c.startNodeId);
    setMetrics(initialMetrics());
    setPatients(initialPatientMetrics(c));
    setClock(0);
    setPath([]);
    setPhase({ kind: "node" });
    setQueue([]);
    setArrivals([]);
    setShowPerspectives(false);
    setTimerFraction(null);
    setLiveHesMin(0);
    nodeShownAt.current = Date.now();
  };

  const resume = () => {
    if (!resumeOffer?.state) return;
    const s = resumeOffer.state;
    attemptId.current = resumeOffer.id;
    setMode(resumeOffer.mode);
    setNodeId(s.nodeId);
    setMetrics(s.metrics);
    setClock(s.clock);
    setPath(s.path);
    setQueue(s.queue);
    setPhase({ kind: "node" });
    setResumeOffer(null);
    nodeShownAt.current = Date.now();
  };

  /* ------------------------------------------------------------ */
  /* Timed-mode clockwork                                          */
  /* ------------------------------------------------------------ */

  const timerActive =
    isTimed && phase.kind === "node" && !isTerminal && !!node.timerSeconds;

  useEffect(() => {
    if (!timerActive) {
      setTimerFraction(null);
      return;
    }
    const total = node.timerSeconds! * 1000;
    const tick = () => {
      const sinceShown = Date.now() - nodeShownAt.current;
      const elapsed = sinceShown - GRACE_MS;
      const fraction = Math.max(0, 1 - Math.max(0, elapsed) / total);
      setTimerFraction(fraction);
      // Coarse spoken equivalent of the bar, at thresholds only.
      const left = Math.ceil((total - Math.max(0, elapsed)) / 1000);
      setTimeAnnouncement((prev) => {
        if (left <= 5 && !prev.startsWith("5")) return "5 seconds left to decide";
        if (left <= 15 && left > 5 && !prev.startsWith("15")) return "15 seconds left to decide";
        if (left <= 30 && left > 15 && !prev.startsWith("30")) return "30 seconds left to decide";
        return prev;
      });
      if (hesRate) setLiveHesMin(Math.floor(sinceShown / 1000 / hesRate));
      if (fraction <= 0 && !firedTimeout.current) {
        firedTimeout.current = true;
        latestTimeout.current();
      }
    };
    tick();
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [timerActive, nodeId, node.timerSeconds, hesRate]);

  /* ------------------------------------------------------------ */
  /* Gates and pickers                                             */
  /* ------------------------------------------------------------ */

  if (authEnabled && !authLoading && !user) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold text-[#3A2B26]">{c.title}</h1>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-[#5A4A40]">
          Sign in to play this encounter. Your decisions, timing, and outcomes
          are saved so you can review them and explore other paths.
        </p>
        <Link
          href="/signin"
          className="mt-6 inline-block rounded-xl bg-[#E88C6E] px-6 py-3 font-medium text-white transition-colors hover:bg-[#D97B5D]"
        >
          Sign in to begin
        </Link>
      </div>
    );
  }

  if (
    mode === null &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("branchFrom")
  ) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center text-[#7A6A5E]">
        Rebuilding your earlier decisions…
      </div>
    );
  }

  if (mode === null) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link href="/" className="text-sm text-[#8A5A44] hover:underline">
          ← All encounters
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-[#3A2B26]">{c.title}</h1>
        <p className="mt-1 text-sm text-[#7A6A5E]">{c.setting}</p>
        <p className="mt-4 leading-relaxed text-[#3A2B26]">How do you want to face this shift?</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => setMode("deliberative")}
            aria-label="Play in deliberative mode, no countdown"
            className="rounded-2xl border border-[#E7D6C4] bg-white p-5 text-left transition-all hover:border-[#4FA39C] hover:shadow-sm"
          >
            <p className="text-lg font-semibold text-[#3A2B26]">Deliberative</p>
            <p className="mt-2 text-sm leading-relaxed text-[#5A4A40]">
              No countdown. Sit with each decision as long as you need. This
              mode reveals what you value when nothing forces your hand.
            </p>
          </button>
          <button
            onClick={() => setMode("timed")}
            aria-label="Play in time-constrained mode, decisions expire"
            className="rounded-2xl border border-[#E7D6C4] bg-white p-5 text-left transition-all hover:border-[#E88C6E] hover:shadow-sm"
          >
            <p className="text-lg font-semibold text-[#3A2B26]">Time-constrained</p>
            <p className="mt-2 text-sm leading-relaxed text-[#5A4A40]">
              Decisions expire. While you deliberate, the ward keeps moving —
              and if the bar empties, the system decides for you.
            </p>
            {c.timing?.leavingEndsAttempt && (
              <p className="mt-2 text-xs font-medium text-[#A34A2E]">
                Leaving this scenario mid-run ends the attempt.
              </p>
            )}
          </button>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-[#7A6A5E]">
          Play both and compare on your dashboard: the point of this case is
          what time pressure does to the same values.
        </p>
      </div>
    );
  }

  /* ------------------------------------------------------------ */
  /* Interstitials and results                                     */
  /* ------------------------------------------------------------ */

  if (phase.kind === "daybreak") {
    const target = nodeById(c, phase.toNodeId);
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
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

  if (isTerminal) {
    return (
      <Results
        clinicalCase={c}
        mode={mode}
        metrics={metrics}
        patients={patients}
        path={path}
        clock={clock}
        outcomeSummary={node.outcomeSummary}
        aftermath={arrivals}
        attemptId={attemptId.current}
        onRestart={restart}
      />
    );
  }

  /* ------------------------------------------------------------ */
  /* Node view                                                     */
  /* ------------------------------------------------------------ */

  const situation =
    isTimed && node.timedOverrides?.situation ? node.timedOverrides.situation : node.situation;
  const perspectives =
    isTimed && node.timedOverrides?.hidePerspectives ? [] : (node.perspectives ?? []);
  const displayClock = clock + liveHesMin;

  const sceneBubbles = [
    ...(node.scene.bubbles ?? []),
    ...(phase.kind === "feedback" && phase.choice.dialogue
      ? [{ characterId: phase.choice.dialogue.speakerId, text: phase.choice.label }]
      : []),
  ];

  return (
    <>
      {timerActive && timerFraction !== null && (
        <div className="fixed inset-x-0 top-0 z-50 h-2.5 bg-[#F3E8DA]" aria-hidden="true">
          <div
            className="h-full transition-[width] duration-100 ease-linear"
            style={{
              width: `${timerFraction * 100}%`,
              backgroundColor:
                timerFraction > 0.5 ? "#E8C86E" : timerFraction > 0.25 ? "#E8A25E" : "#E86E5E",
            }}
          />
        </div>
      )}
      {timerActive && timerFraction !== null && timerFraction <= 0.25 && (
        <div
          aria-hidden="true"
          className="urgent-flash pointer-events-none fixed inset-0 z-40"
          style={{ boxShadow: "inset 0 0 0 10px #E8452F" }}
        />
      )}

      {/* Spoken equivalent of the countdown bar. */}
      <div className="sr-only" role="status" aria-live="assertive">
        {timerActive ? timeAnnouncement : ""}
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <header className="mb-5 flex flex-wrap items-baseline justify-between gap-4">
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
                {node.scene.wallClock ? ` · T+${displayClock} min` : ""}
              </span>
            )}
            {isTimed && (
              <span className="rounded-full bg-[#FBE3DA] px-3 py-1 text-xs font-medium text-[#A34A2E]">
                time-constrained
              </span>
            )}
          </div>
        </header>

        {branch && (
          <div className="mb-4 rounded-xl border border-[#6E5A7A] bg-[#EDE4F0] p-4">
            <p className="text-sm font-medium uppercase tracking-wide text-[#6E5A7A]">
              Counterfactual
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[#4A3D52]">
              Your first {branch.stepIndex} decision
              {branch.stepIndex === 1 ? "" : "s"} from the {branch.parentDate}{" "}
              attempt are preserved. From here, choose differently and see where
              it leads — this saves as a linked counterfactual.
            </p>
          </div>
        )}

        {resumeOffer && path.length === 0 && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#4FA39C] bg-[#EDF6F5] p-4">
            <p className="text-sm leading-relaxed text-[#2E4B48]">
              You have an unfinished attempt at{" "}
              <span className="font-medium">
                {nodeById(c, resumeOffer.state!.nodeId).title}
              </span>
              .
            </p>
            <div className="flex gap-2">
              <button
                onClick={resume}
                className="rounded-full bg-[#4FA39C] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#3E8983]"
              >
                Resume
              </button>
              <button
                onClick={() => {
                  abandonAttempt(resumeOffer.id);
                  setResumeOffer(null);
                }}
                className="rounded-full border border-[#4FA39C] px-4 py-1.5 text-sm font-medium text-[#2E6B66] hover:bg-white"
              >
                Start fresh
              </button>
            </div>
          </div>
        )}

        {node.inlineCaption && (
          <p className="mb-2 text-sm italic text-[#7A6A5E]">{node.inlineCaption}</p>
        )}

        <div className="overflow-hidden rounded-2xl border border-[#E7D6C4] shadow-sm">
          <SceneRenderer
            scene={{
              ...adjustSceneMoods(c, node.scene, patients, metrics),
              bubbles: sceneBubbles,
            }}
            characters={c.characters}
            timeOfDay={node.timeOfDay}
            scenarioMinutes={displayClock}
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

        <div className="mt-5 rounded-2xl border border-[#E7D6C4] bg-white p-6">
          <p className="text-lg leading-relaxed text-[#3A2B26]">{situation}</p>

          {perspectives.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowPerspectives((v) => !v)}
                className="rounded-full border border-[#4FA39C] px-4 py-1.5 text-sm font-medium text-[#2E6B66] transition-colors hover:bg-[#4FA39C] hover:text-white"
              >
                {showPerspectives ? "Hide" : "See"} what{" "}
                {perspectives
                  .map((p) => characterById(c, p.characterId).name.split(" ")[0])
                  .join(" and ")}{" "}
                {perspectives.length > 1 ? "are" : "is"} experiencing
              </button>
              {showPerspectives &&
                perspectives.map((p) => (
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

        {phase.kind === "node" && (
          <div className="mt-5 space-y-3">
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
        )}

        {phase.kind === "feedback" && (
          <FeedbackPanel
            choice={phase.choice}
            showScores={c.scoring === "standard"}
            onContinue={() => advanceRules(phase.choice.next)}
          />
        )}

        {phase.kind === "timeout" && (
          <div
            className="mt-5 rounded-xl border-2 border-[#E8452F] bg-[#FBE3DA] p-5"
            role="status"
            aria-live="assertive"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-[#A34A2E]">
              Time ran out
            </p>
            {phase.inactionText ? (
              <p className="mt-2 leading-relaxed text-[#4A3230]">{phase.inactionText}</p>
            ) : (
              <>
                <p className="mt-1 text-sm text-[#8A5A44]">
                  You did not decide, so the default happened:
                </p>
                <p className="mt-2 text-lg leading-snug text-[#3A2B26]">
                  {phase.dialogue ? `“${phase.label}”` : phase.label}
                </p>
              </>
            )}
            <button
              onClick={() =>
                setPhase({
                  kind: "impact",
                  immediate: phase.immediate,
                  effects: phase.effects,
                  next: phase.next,
                })
              }
              className="mt-4 rounded-xl bg-[#A34A2E] px-4 py-2 font-medium text-white transition-colors hover:bg-[#8A3A22]"
            >
              See what that did
            </button>
          </div>
        )}

        {phase.kind === "impact" && (
          <div className="mt-5 space-y-3" role="status" aria-live="polite">
            <div className="rounded-2xl border border-[#E7D6C4] bg-white p-6">
              <p className="text-sm font-medium uppercase tracking-wide text-[#8A5A44]">
                What happens now
              </p>
              <p className="mt-1 text-lg leading-relaxed text-[#3A2B26]">{phase.immediate}</p>
              {c.scoring === "standard" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(phase.effects).map(([k, v]) =>
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
              <p className="mt-3 text-sm italic text-[#7A6A5E]">
                The clock is stopped. It starts again on the next decision.
              </p>
            </div>
            <button
              onClick={() => advanceRules(phase.next)}
              className="w-full rounded-xl bg-[#E88C6E] px-4 py-3 font-medium text-white transition-colors hover:bg-[#D97B5D]"
            >
              Continue
            </button>
          </div>
        )}

        {patientChars.some((ch) => ch.bio) && !isTimed && (
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
    </>
  );
}

/* ------------------------------------------------------------------ */

function FeedbackPanel({
  choice,
  showScores,
  onContinue,
}: {
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
  mode,
  metrics,
  patients,
  path,
  clock,
  outcomeSummary,
  aftermath,
  attemptId,
  onRestart,
}: {
  clinicalCase: ClinicalCase;
  mode: CaseMode;
  metrics: MetricState;
  patients: Record<string, MetricState>;
  path: PathStep[];
  clock: number;
  outcomeSummary?: string;
  aftermath: DelayedOutcome[];
  attemptId: string | null;
  onRestart: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [openStep, setOpenStep] = useState<number | null>(null);
  const totals = stakeholderTotals(metrics);
  const RANGE = 8;

  const ctx = { metrics, scenarioClock: clock, path, patients };

  /*
   * Multi-patient cases get one PATIENT row per patient, so harm to one can
   * never be cancelled out by good care of the other.
   */
  const rows = buildScoreRows(c, metrics, patients);
  const shownReflections = c.epilogue.reflections.filter((r, i, all) => {
    const firstMatch = all.find(
      (x) => x.characterId === r.characterId && (!x.when || evalConditionSafe(x.when, ctx))
    );
    return firstMatch === r;
  });

  const stepChoice = (step: PathStep): Choice | undefined =>
    "choiceId" in step.resolution
      ? nodeById(c, step.nodeId).choices.find(
          (ch) => ch.id === (step.resolution as { choiceId: string }).choiceId
        )
      : undefined;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
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
            Each patient is scored separately, so strong care for one never hides
            harm to the other. Click any row to see the measures underneath it.
          </p>
          <div className="mt-4 space-y-4">
            {rows.map((row) => {
              const pct = (Math.min(Math.abs(row.value), RANGE) / RANGE) * 50;
              const isOpen = expanded === row.key;
              return (
                <div key={row.key}>
                  <button className="w-full" onClick={() => setExpanded(isOpen ? null : row.key)}>
                    <div className="flex items-baseline justify-between">
                      <span className="font-medium tracking-wide text-[#3A2B26]">
                        {row.label} {isOpen ? "▴" : "▾"}
                      </span>
                      <span className="text-sm text-[#7A6A5E]">
                        {row.value > 0 ? `+${row.value}` : row.value}
                      </span>
                    </div>
                    <div className="relative mt-1 h-3 rounded-full bg-[#F3E8DA]">
                      <div className="absolute left-1/2 top-0 h-3 w-px bg-[#C9B295]" />
                      <div
                        className={`absolute top-0 h-3 ${
                          row.value >= 0
                            ? "rounded-r-full bg-[#4FA39C]"
                            : "rounded-l-full bg-[#E88C6E]"
                        }`}
                        style={
                          row.value >= 0
                            ? { left: "50%", width: `${pct}%` }
                            : { right: "50%", width: `${pct}%` }
                        }
                      />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="mt-2 space-y-2 rounded-xl bg-[#FBF3E9] p-3">
                      {metricsFor(row.stakeholder).map((m) => {
                        const v = row.source[m.key];
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
        <h2 className="text-lg font-semibold text-[#3A2B26]">
          {mode === "timed" ? "Your decisions, explained" : "Your path"}
        </h2>
                <ol className="mt-3 space-y-2">
          {path.map((step, i) => {
            const n = nodeById(c, step.nodeId);
            const ch = stepChoice(step);
            const timedOut =
              "choiceId" in step.resolution && step.resolution.timedOut;
            const inaction = "inaction" in step.resolution;
            const isOpen = openStep === i;
            return (
              <li key={i} className="text-sm leading-relaxed">
                <button
                  className="w-full text-left"
                  onClick={() => setOpenStep(isOpen ? null : i)}
                  disabled={mode !== "timed"}
                >
                  <span className="font-medium text-[#8A5A44]">{n.title}: </span>
                  <span className="text-[#3A2B26]">
                    {inaction ? "(no decision was made in time)" : ch?.label}
                  </span>
                  {timedOut && (
                    <span className="ml-1 rounded bg-[#FBE3DA] px-1.5 py-0.5 text-xs font-medium text-[#A34A2E]">
                      decided by the clock
                    </span>
                  )}
                  {step.branchReason && (
                    <span className="ml-1 italic text-[#7A6A5E]">— {step.branchReason}</span>
                  )}
                  {mode === "timed" && (
                    <span className="ml-1 text-[#8A5A44]">{isOpen ? "▴" : "▾"}</span>
                  )}
                </button>
                {isOpen && mode === "timed" && (
                  <div className="mt-2 space-y-2 rounded-xl bg-[#FBF3E9] p-3">
                    {inaction && n.inactionOutcome ? (
                      <>
                        <p className="text-[#3A2B26]">{n.inactionOutcome.text}</p>
                        <p className="text-[#3A2B26]">
                          <span className="font-medium text-[#8A5A44]">Ethically: </span>
                          {n.inactionOutcome.feedback.ethical}
                        </p>
                      </>
                    ) : ch ? (
                      <>
                        <p className="text-[#3A2B26]">
                          <span className="font-medium text-[#8A5A44]">What happened: </span>
                          {ch.feedback.immediate}
                        </p>
                        {ch.feedback.institutional && (
                          <p className="text-[#3A2B26]">
                            <span className="font-medium text-[#6E5A7A]">The institution: </span>
                            {ch.feedback.institutional}
                          </p>
                        )}
                        <p className="text-[#3A2B26]">
                          <span className="font-medium text-[#8A5A44]">
                            Protected and risked:{" "}
                          </span>
                          {ch.feedback.ethical}
                        </p>
                      </>
                    ) : null}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {Object.entries(step.effectsApplied).map(([k, v]) =>
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
                      <span className="rounded-full bg-white px-2.5 py-0.5 text-xs text-[#7A6A5E]">
                        decided in {(step.decisionMs / 1000).toFixed(1)}s
                      </span>
                    </div>
                  </div>
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

      <ReflectionComposer attemptId={attemptId} />

      {c.readingConnections.length > 0 && (
        <div className="mt-4 rounded-2xl border border-[#E7D6C4] bg-[#FBF3E9] p-5">
          <h2 className="text-lg font-semibold text-[#3A2B26]">Inspired by</h2>
          <ul className="mt-3 space-y-1.5">
            {c.readingConnections.map((r, i) => (
              <li key={i} className="leading-relaxed text-[#5A4A40]">
                {r.source}
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
