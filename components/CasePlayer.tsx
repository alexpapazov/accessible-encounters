"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Choice, ClinicalCase, Persona, ScoreState } from "@/lib/types";
import { SCORE_DIMENSIONS, initialScores } from "@/lib/types";
import Scene from "./Scene";

interface Props {
  clinicalCase: ClinicalCase;
  persona: Persona;
}

interface PlayedStep {
  nodeTitle: string;
  choice: Choice;
}

export default function CasePlayer({ clinicalCase, persona }: Props) {
  const nodesById = useMemo(
    () => new Map(clinicalCase.nodes.map((n) => [n.id, n])),
    [clinicalCase]
  );

  const [nodeId, setNodeId] = useState(clinicalCase.startNodeId);
  const [scores, setScores] = useState<ScoreState>(initialScores);
  const [pending, setPending] = useState<Choice | null>(null);
  const [steps, setSteps] = useState<PlayedStep[]>([]);
  const [showPatientView, setShowPatientView] = useState(false);
  const [showPersona, setShowPersona] = useState(false);

  const node = nodesById.get(nodeId);
  if (!node) throw new Error(`Case graph is missing node: ${nodeId}`);

  const isTerminal = node.choices.length === 0;
  const beatNumber = steps.length + 1;

  const choose = (choice: Choice) => {
    setPending(choice);
    setScores((s) => {
      const next = { ...s };
      for (const dim of SCORE_DIMENSIONS) {
        next[dim.key] += choice.effects[dim.key] ?? 0;
      }
      return next;
    });
  };

  const advance = () => {
    if (!pending) return;
    setSteps((prev) => [...prev, { nodeTitle: node.title, choice: pending }]);
    setNodeId(pending.nextNodeId);
    setPending(null);
    setShowPatientView(false);
  };

  const restart = () => {
    setNodeId(clinicalCase.startNodeId);
    setScores(initialScores());
    setPending(null);
    setSteps([]);
    setShowPatientView(false);
  };

  if (isTerminal) {
    return <Results clinicalCase={clinicalCase} persona={persona} scores={scores} steps={steps} onRestart={restart} />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-4 flex items-baseline justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-[#8A5A44] hover:underline">
            ← All encounters
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-[#3A2B26]">{clinicalCase.title}</h1>
          <p className="text-sm text-[#7A6A5E]">{clinicalCase.setting}</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#F6E3D0] px-3 py-1 text-xs font-medium text-[#8A5A44]">
          {node.title} · beat {beatNumber}
        </span>
      </header>

      <div className="overflow-hidden rounded-2xl border border-[#E7D6C4] shadow-sm">
        <Scene scene={node.scene} />
      </div>

      <div className="mt-4 rounded-2xl border border-[#E7D6C4] bg-white p-5">
        <p className="leading-relaxed text-[#3A2B26]">{node.situation}</p>

        {node.patientState && (
          <div className="mt-4">
            <button
              onClick={() => setShowPatientView((v) => !v)}
              className="rounded-full border border-[#4FA39C] px-4 py-1.5 text-sm font-medium text-[#2E6B66] transition-colors hover:bg-[#4FA39C] hover:text-white"
            >
              {showPatientView ? "Hide" : "See"} what {persona.name.split(" ")[0]} is experiencing
            </button>
            {showPatientView && (
              <blockquote className="mt-3 rounded-xl border-l-4 border-[#4FA39C] bg-[#EDF6F5] p-4 text-[#2E4B48]">
                {node.patientState}
              </blockquote>
            )}
          </div>
        )}
      </div>

      {!pending ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium uppercase tracking-wide text-[#8A5A44]">What do you do?</p>
          {node.choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => choose(choice)}
              className="block w-full rounded-xl border border-[#E7D6C4] bg-white p-4 text-left leading-snug text-[#3A2B26] transition-all hover:border-[#E88C6E] hover:bg-[#FDF6F0] hover:shadow-sm"
            >
              {choice.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-[#E7D6C4] bg-[#FBF3E9] p-4">
            <p className="text-sm font-medium uppercase tracking-wide text-[#8A5A44]">Your choice</p>
            <p className="mt-1 text-[#3A2B26]">{pending.label}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SCORE_DIMENSIONS.map((dim) => {
                const delta = pending.effects[dim.key] ?? 0;
                if (delta === 0) return null;
                return (
                  <span
                    key={dim.key}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      delta > 0 ? "bg-[#DFF0EE] text-[#2E6B66]" : "bg-[#FBE3DA] text-[#A34A2E]"
                    }`}
                  >
                    {dim.label} {delta > 0 ? `+${delta}` : delta}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-[#E7D6C4] bg-white p-4">
            <p className="text-sm font-medium uppercase tracking-wide text-[#8A5A44]">Why this matters</p>
            <p className="mt-1 leading-relaxed text-[#3A2B26]">{pending.feedback}</p>
          </div>

          {pending.patientReaction && (
            <blockquote className="rounded-xl border-l-4 border-[#4FA39C] bg-[#EDF6F5] p-4 text-[#2E4B48]">
              <p className="text-sm font-medium uppercase tracking-wide text-[#2E6B66]">
                {persona.name.split(" ")[0]}&rsquo;s experience
              </p>
              <p className="mt-1 leading-relaxed">{pending.patientReaction}</p>
            </blockquote>
          )}

          <button
            onClick={advance}
            className="w-full rounded-xl bg-[#E88C6E] px-4 py-3 font-medium text-white transition-colors hover:bg-[#D97B5D]"
          >
            Continue the visit →
          </button>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-[#E7D6C4] bg-white">
        <button
          onClick={() => setShowPersona((v) => !v)}
          className="w-full p-4 text-left text-sm font-medium text-[#8A5A44]"
        >
          About {persona.name} {showPersona ? "▴" : "▾"}
        </button>
        {showPersona && (
          <div className="border-t border-[#E7D6C4] p-4 text-sm leading-relaxed text-[#3A2B26]">
            <p className="italic text-[#5A4A40]">&ldquo;{persona.narrative}&rdquo;</p>
            <dl className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2">
              <div>
                <dt className="font-medium text-[#8A5A44]">Identity</dt>
                <dd>{persona.identityStance}</dd>
              </div>
              <div>
                <dt className="font-medium text-[#8A5A44]">Language</dt>
                <dd>{persona.language}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}

function Results({
  clinicalCase,
  persona,
  scores,
  steps,
  onRestart,
}: {
  clinicalCase: ClinicalCase;
  persona: Persona;
  scores: ScoreState;
  steps: PlayedStep[];
  onRestart: () => void;
}) {
  const RANGE = 6;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="text-sm text-[#8A5A44] hover:underline">
        ← All encounters
      </Link>
      <h1 className="mt-1 text-2xl font-semibold text-[#3A2B26]">The visit is over</h1>
      <p className="mt-1 text-[#7A6A5E]">
        What {persona.name.split(" ")[0]} carries home was decided across {steps.length} moments. Here is how they added up.
      </p>

      <div className="mt-6 rounded-2xl border border-[#E7D6C4] bg-white p-5">
        <h2 className="text-lg font-semibold text-[#3A2B26]">How the encounter went</h2>
        <div className="mt-4 space-y-4">
          {SCORE_DIMENSIONS.map((dim) => {
            const value = Math.max(-RANGE, Math.min(RANGE, scores[dim.key]));
            const pct = (Math.abs(value) / RANGE) * 50;
            return (
              <div key={dim.key}>
                <div className="flex items-baseline justify-between">
                  <span className="font-medium text-[#3A2B26]">{dim.label}</span>
                  <span className="text-sm text-[#7A6A5E]">{dim.blurb}</span>
                </div>
                <div className="relative mt-1 h-3 rounded-full bg-[#F3E8DA]">
                  <div className="absolute left-1/2 top-0 h-3 w-px bg-[#C9B295]" />
                  <div
                    className={`absolute top-0 h-3 ${value >= 0 ? "rounded-r-full bg-[#4FA39C]" : "rounded-l-full bg-[#E88C6E]"}`}
                    style={
                      value >= 0
                        ? { left: "50%", width: `${pct}%` }
                        : { right: "50%", width: `${pct}%` }
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-[#7A6A5E]">
          These aren&rsquo;t grades — they trace how each decision moved access, understanding, autonomy, and trust.
          A clinically &ldquo;successful&rdquo; visit can still fail the person it was for.
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-[#E7D6C4] bg-white p-5">
        <h2 className="text-lg font-semibold text-[#3A2B26]">Your path through the visit</h2>
        <ol className="mt-3 space-y-2">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed">
              <span className="shrink-0 font-medium text-[#8A5A44]">{step.nodeTitle}:</span>
              <span className="text-[#3A2B26]">{step.choice.label}</span>
            </li>
          ))}
        </ol>
      </div>

      <blockquote className="mt-4 rounded-2xl border-l-4 border-[#4FA39C] bg-[#EDF6F5] p-5">
        <p className="text-sm font-medium uppercase tracking-wide text-[#2E6B66]">
          {persona.name}, afterward
        </p>
        <p className="mt-2 leading-relaxed text-[#2E4B48]">{clinicalCase.epilogue.patientReflection}</p>
      </blockquote>

      <div className="mt-4 rounded-2xl border border-[#E7D6C4] bg-white p-5">
        <h2 className="text-lg font-semibold text-[#3A2B26]">To sit with</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-[#3A2B26]">
          {clinicalCase.epilogue.reflectionPrompts.map((prompt, i) => (
            <li key={i}>{prompt}</li>
          ))}
        </ul>
      </div>

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
