"use client";

import { useMemo, useState } from "react";
import type { ClinicalCase, PathStep } from "@/lib/types";
import { nodeById } from "@/lib/engine";

/**
 * Case-review map. Shows the route this attempt took, the immediate
 * alternatives at each decision, and — in Explored Paths mode — every branch
 * the user has personally reached across attempts. Never an answer key:
 * unvisited destinations stay unnamed, so replaying still discovers something.
 */
export default function DecisionMap({
  c,
  path,
  allPaths,
  currentIndex,
  onSelect,
}: {
  c: ClinicalCase;
  path: PathStep[];
  allPaths: PathStep[][];
  currentIndex: number;
  onSelect: (i: number) => void;
}) {
  const [mode, setMode] = useState<"mine" | "explored">("mine");

  /** Choice ids the user has taken anywhere, across all their attempts. */
  const exploredChoices = useMemo(() => {
    const set = new Set<string>();
    for (const p of allPaths)
      for (const s of p)
        if ("choiceId" in s.resolution) set.add(s.resolution.choiceId);
    return set;
  }, [allPaths]);

  const ROW = 74;
  const height = path.length * ROW + 60;
  const laneX = 130;

  return (
    <div className="mt-4 rounded-2xl border border-[#E7D6C4] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#3A2B26]">Decision map</h2>
          <p className="mt-1 text-sm text-[#7A6A5E]">
            Solid is the route you took. Muted branches you passed by; anything
            you have never reached stays unmarked.
          </p>
        </div>
        <div className="flex overflow-hidden rounded-full border border-[#E7D6C4]">
          {(["mine", "explored"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 text-sm font-medium ${
                mode === m ? "bg-[#E88C6E] text-white" : "bg-white text-[#8A5A44]"
              }`}
            >
              {m === "mine" ? "My path" : "Explored paths"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 620 ${height}`} className="w-full" role="img" aria-label="Decision map">
          {path.map((step, i) => {
            const node = nodeById(c, step.nodeId);
            const y = 30 + i * ROW;
            const taken =
              "choiceId" in step.resolution ? step.resolution.choiceId : null;
            const siblings = node.choices.filter((ch) => ch.id !== taken);
            const isCurrent = i === currentIndex;
            return (
              <g key={i}>
                {i < path.length - 1 && (
                  <line
                    x1={laneX}
                    y1={y + 12}
                    x2={laneX}
                    y2={y + ROW - 12}
                    stroke="#C9B295"
                    strokeWidth="2.5"
                  />
                )}
                {siblings.map((s, si) => {
                  const explored = mode === "explored" && exploredChoices.has(s.id);
                  const bx = laneX + 60 + si * 118;
                  return (
                    <g key={s.id} opacity={explored ? 0.85 : 0.4}>
                      <line
                        x1={laneX + 12}
                        y1={y}
                        x2={bx - 6}
                        y2={y}
                        stroke={explored ? "#8A5A44" : "#D8C4AC"}
                        strokeWidth="1.5"
                        strokeDasharray={explored ? "0" : "4 3"}
                      />
                      <circle
                        cx={bx}
                        cy={y}
                        r="6"
                        fill={explored ? "#F6E3D0" : "#FBF5EE"}
                        stroke={explored ? "#8A5A44" : "#D8C4AC"}
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                })}
                <circle
                  cx={laneX}
                  cy={y}
                  r={isCurrent ? 11 : 8}
                  fill={isCurrent ? "#E88C6E" : "#4FA39C"}
                  stroke={isCurrent ? "#D97B5D" : "#3E8983"}
                  strokeWidth="2"
                  className="cursor-pointer"
                  onClick={() => onSelect(i)}
                />
                <text
                  x={laneX - 20}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12.5"
                  fill={isCurrent ? "#3A2B26" : "#7A6A5E"}
                  fontWeight={isCurrent ? 600 : 400}
                  className="cursor-pointer"
                  onClick={() => onSelect(i)}
                >
                  {node.title}
                </text>
              </g>
            );
          })}
          <circle cx={laneX} cy={30 + path.length * ROW - ROW + 40} r="5" fill="#C9B295" />
          <text
            x={laneX - 20}
            y={30 + path.length * ROW - ROW + 44}
            textAnchor="end"
            fontSize="12"
            fill="#7A6A5E"
          >
            outcome
          </text>
        </svg>
      </div>

      {mode === "explored" && (
        <p className="mt-2 text-xs leading-relaxed text-[#7A6A5E]">
          Filled branches are ones you have actually played at some point. The
          rest are roads you have still never taken.
        </p>
      )}
    </div>
  );
}
