"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { listAttempts, type AttemptRow } from "@/lib/attempts";
import { analyzeAttempts } from "@/lib/patterns";
import { cases } from "@/lib/data/cases";
import { METRICS, STAKEHOLDERS, metricsFor } from "@/lib/types";

const caseTitle = (id: string) => cases.find((c) => c.id === id)?.title ?? id;
const metricLabel = (k: string) => METRICS.find((m) => m.key === k)?.label ?? k;

export default function PatternsPage() {
  const { enabled, loading, user } = useAuth();
  const [attempts, setAttempts] = useState<AttemptRow[] | null>(null);

  useEffect(() => {
    if (user) listAttempts(user.id).then(setAttempts);
  }, [user]);

  const analysis = useMemo(
    () => (attempts ? analyzeAttempts(attempts, caseTitle) : null),
    [attempts]
  );

  if (!enabled || (!loading && !user)) {
    return (
      <Shell>
        <p className="leading-relaxed text-[#5A4A40]">
          <Link href="/signin" className="text-[#8A5A44] underline">
            Sign in
          </Link>{" "}
          to see patterns across your attempts.
        </p>
      </Shell>
    );
  }
  if (!analysis) {
    return (
      <Shell>
        <p className="text-[#7A6A5E]">Reading your history…</p>
      </Shell>
    );
  }
  if (analysis.attemptCount === 0) {
    return (
      <Shell>
        <p className="leading-relaxed text-[#5A4A40]">
          No completed encounters yet.{" "}
          <Link href="/" className="text-[#8A5A44] underline">
            Play one
          </Link>{" "}
          and this page will start tracing what your choices protect and what
          they spend.
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="text-sm leading-relaxed text-[#7A6A5E]">
        Based on {analysis.attemptCount} completed encounter
        {analysis.attemptCount === 1 ? "" : "s"}. These describe what your
        decisions have done, not what kind of clinician you are.
      </p>

      <section className="mt-6 rounded-2xl border border-[#E7D6C4] bg-white p-5">
        <h2 className="text-lg font-semibold text-[#3A2B26]">What your choices have done</h2>
        <ul className="mt-3 space-y-3">
          {analysis.statements.map((s, i) => (
            <li key={i} className="flex gap-3 leading-relaxed text-[#3A2B26]">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E88C6E]" />
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-2xl border border-[#E7D6C4] bg-white p-5">
        <h2 className="text-lg font-semibold text-[#3A2B26]">Average per encounter</h2>
        <p className="mt-1 text-sm text-[#7A6A5E]">
          Where each of the three forces has tended to land, and the eight
          measures underneath them.
        </p>
        <div className="mt-4 space-y-5">
          {STAKEHOLDERS.map((s) => {
            const avg = analysis.stakeholderAverages[s.key];
            return (
              <div key={s.key}>
                <div className="flex items-baseline justify-between">
                  <span className="font-medium tracking-wide text-[#3A2B26]">{s.label}</span>
                  <span
                    className={`text-sm font-semibold ${
                      avg > 0 ? "text-[#2E6B66]" : avg < 0 ? "text-[#A34A2E]" : "text-[#7A6A5E]"
                    }`}
                  >
                    {avg > 0 ? "+" : ""}
                    {Math.round(avg * 10) / 10}
                  </span>
                </div>
                <Bar value={avg} range={8} />
                <div className="mt-2 grid gap-x-6 gap-y-1 pl-1 sm:grid-cols-2">
                  {metricsFor(s.key).map((m) => {
                    const v = Math.round(analysis.metricAverages[m.key] * 10) / 10;
                    return (
                      <div key={m.key} className="flex items-baseline justify-between gap-3">
                        <span className="text-sm text-[#5A4A40]">{m.label}</span>
                        <span
                          className={`text-sm font-medium ${
                            v > 0 ? "text-[#2E6B66]" : v < 0 ? "text-[#A34A2E]" : "text-[#7A6A5E]"
                          }`}
                        >
                          {v > 0 ? "+" : ""}
                          {v}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {analysis.modeComparisons.length > 0 && (
        <section className="mt-4 rounded-2xl border border-[#6E5A7A] bg-white p-5">
          <h2 className="text-lg font-semibold text-[#3A2B26]">
            Deliberative vs. time-constrained
          </h2>
          <p className="mt-1 text-sm text-[#7A6A5E]">
            The comparison this project exists for: what changes in your ethics
            when the clock is running.
          </p>
          {analysis.modeComparisons.map((mc) => (
            <div key={mc.caseId} className="mt-4">
              <p className="font-medium text-[#3A2B26]">{mc.caseTitle}</p>
              <p className="text-xs text-[#7A6A5E]">
                {mc.deliberativeCount} deliberative · {mc.timedCount} timed
              </p>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E7D6C4] text-left text-xs uppercase tracking-wide text-[#8A5A44]">
                      <th className="py-1.5 pr-3 font-medium">Measure</th>
                      <th className="py-1.5 px-2 text-right font-medium">Deliberative</th>
                      <th className="py-1.5 px-2 text-right font-medium">Timed</th>
                      <th className="py-1.5 pl-2 text-right font-medium">Shift</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mc.rows.map((r) => (
                      <tr key={r.key} className="border-b border-[#F3E8DA] last:border-0">
                        <td className="py-1.5 pr-3 text-[#3A2B26]">{metricLabel(r.key)}</td>
                        <td className="py-1.5 px-2 text-right text-[#5A4A40]">
                          {r.deliberative > 0 ? "+" : ""}
                          {r.deliberative}
                        </td>
                        <td className="py-1.5 px-2 text-right text-[#5A4A40]">
                          {r.timed > 0 ? "+" : ""}
                          {r.timed}
                        </td>
                        <td
                          className={`py-1.5 pl-2 text-right font-medium ${
                            r.delta > 0
                              ? "text-[#2E6B66]"
                              : r.delta < 0
                                ? "text-[#A34A2E]"
                                : "text-[#7A6A5E]"
                          }`}
                        >
                          {r.delta > 0 ? "+" : ""}
                          {r.delta}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 rounded-xl bg-[#EDE4F0] p-4 leading-relaxed text-[#4A3D52]">
                {mc.interpretation}
              </p>
            </div>
          ))}
        </section>
      )}

      {analysis.trends.length > 0 && (
        <section className="mt-4 rounded-2xl border border-[#E7D6C4] bg-white p-5">
          <h2 className="text-lg font-semibold text-[#3A2B26]">Across repeated attempts</h2>
          <ul className="mt-3 space-y-2">
            {analysis.trends.map((t) => (
              <li key={t.caseId} className="leading-relaxed text-[#3A2B26]">
                {t.sentence}
              </li>
            ))}
          </ul>
        </section>
      )}

      {analysis.modeComparisons.length === 0 && analysis.attemptCount > 0 && (
        <p className="mt-4 rounded-2xl border border-[#E7D6C4] bg-[#FBF3E9] p-5 leading-relaxed text-[#5A4A40]">
          Play a case in <em>both</em> modes and this page will compare them,
          same scenario, same values, different clock.
        </p>
      )}

      <div className="mt-6">
        <Link
          href="/dashboard"
          className="rounded-xl border border-[#E7D6C4] bg-white px-5 py-3 font-medium text-[#3A2B26] transition-colors hover:bg-[#FBF3E9]"
        >
          ← Back to dashboard
        </Link>
      </div>
    </Shell>
  );
}

function Bar({ value, range }: { value: number; range: number }) {
  const pct = (Math.min(Math.abs(value), range) / range) * 50;
  return (
    <div className="relative mt-1 h-3 rounded-full bg-[#F3E8DA]">
      <div className="absolute left-1/2 top-0 h-3 w-px bg-[#C9B295]" />
      <div
        className={`absolute top-0 h-3 ${
          value >= 0 ? "rounded-r-full bg-[#4FA39C]" : "rounded-l-full bg-[#E88C6E]"
        }`}
        style={value >= 0 ? { left: "50%", width: `${pct}%` } : { right: "50%", width: `${pct}%` }}
      />
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-[#3A2B26]">Patterns and progress</h1>
      <div className="mt-4">{children}</div>
    </div>
  );
}
