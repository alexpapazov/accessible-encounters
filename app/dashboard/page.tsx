"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { listAttempts, type AttemptRow } from "@/lib/attempts";
import { analyzeAttempts } from "@/lib/patterns";
import { cases } from "@/lib/data/cases";
import { METRICS, STAKEHOLDERS, metricsFor, type MetricState } from "@/lib/types";
import { buildScoreRows, patientMetricsFromPath, stakeholderTotals } from "@/lib/engine";

const caseById = (id: string) => cases.find((c) => c.id === id);

export default function DashboardPage() {
  const { enabled, loading, user } = useAuth();
  const [attempts, setAttempts] = useState<AttemptRow[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (user) listAttempts(user.id).then(setAttempts);
  }, [user]);

  const analysis = useMemo(
    () =>
      attempts
        ? analyzeAttempts(attempts, (id) => caseById(id)?.title ?? id)
        : null,
    [attempts]
  );

  if (!enabled) {
    return (
      <Shell>
        <p className="leading-relaxed text-[#5A4A40]">
          Accounts aren&rsquo;t configured on this deployment yet, so there&rsquo;s no
          history to show. Every encounter is still playable from the{" "}
          <Link href="/" className="text-[#8A5A44] underline">
            library
          </Link>
          .
        </p>
      </Shell>
    );
  }

  if (!loading && !user) {
    return (
      <Shell>
        <p className="leading-relaxed text-[#5A4A40]">
          <Link href="/signin" className="text-[#8A5A44] underline">
            Sign in
          </Link>{" "}
          to see your attempt history.
        </p>
      </Shell>
    );
  }

  if (!attempts) {
    return (
      <Shell>
        <p className="text-[#7A6A5E]">Loading your history…</p>
      </Shell>
    );
  }

  const completedAttempts = attempts.filter((a) => a.status === "completed");
  const inProgress = attempts.filter((a) => a.status === "in-progress");
  const caseIds = new Set(completedAttempts.map((a) => a.case_id));

  return (
    <Shell>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Cases completed" value={caseIds.size} />
        <Stat label="Total attempts" value={completedAttempts.length} />
        <Stat label="In progress" value={inProgress.length} />
      </div>

      {analysis && analysis.attemptCount > 0 && (
        <section className="mt-6 rounded-2xl border border-[#E7D6C4] bg-white p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#3A2B26]">Your tendencies</h2>
            <Link
              href="/dashboard/patterns"
              className="text-sm font-medium text-[#8A5A44] hover:underline"
            >
              Full patterns and progress →
            </Link>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {STAKEHOLDERS.map((s) => {
              const v = Math.round(analysis.stakeholderAverages[s.key] * 10) / 10;
              return (
                <div key={s.key} className="rounded-lg bg-[#FBF3E9] px-3 py-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-medium tracking-wide text-[#8A5A44]">
                      {s.label}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        v > 0 ? "text-[#2E6B66]" : v < 0 ? "text-[#A34A2E]" : "text-[#7A6A5E]"
                      }`}
                    >
                      {v > 0 ? "+" : ""}
                      {v}
                    </span>
                  </div>
                  <MiniBar value={v} />
                </div>
              );
            })}
          </div>
          {analysis.statements[0] && (
            <p className="mt-3 leading-relaxed text-[#3A2B26]">{analysis.statements[0]}</p>
          )}
          <p className="mt-1 text-xs text-[#7A6A5E]">Average per completed encounter.</p>
        </section>
      )}

      {inProgress.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-[#3A2B26]">Continue where you left off</h2>
          <div className="mt-3 space-y-3">
            {inProgress.map((a) => {
              const c = caseById(a.case_id);
              if (!c) return null;
              return (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#4FA39C] bg-[#EDF6F5] p-4"
                >
                  <div>
                    <p className="font-medium text-[#2E4B48]">{c.title}</p>
                    <p className="text-sm text-[#2E6B66]">
                      At {a.state ? `“${nodeTitle(a.case_id, a.state.nodeId)}”` : "start"} ·{" "}
                      {new Date(a.started_at).toLocaleString()}
                    </p>
                  </div>
                  <Link
                    href={`/case/${a.case_id}`}
                    className="rounded-full bg-[#4FA39C] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#3E8983]"
                  >
                    Resume
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-[#3A2B26]">Completed attempts</h2>
        {completedAttempts.length === 0 ? (
          <p className="mt-2 leading-relaxed text-[#5A4A40]">
            Nothing completed yet.{" "}
            <Link href="/" className="text-[#8A5A44] underline">
              start an encounter
            </Link>
            .
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {completedAttempts.map((a) => {
              const c = caseById(a.case_id);
              if (!c || !a.final_metrics) return null;
              const rows = buildScoreRows(
                c,
                a.final_metrics,
                patientMetricsFromPath(c, a.path)
              );
              const isOpen = expanded === a.id;
              return (
                <div key={a.id} className="rounded-xl border border-[#E7D6C4] bg-white p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium text-[#3A2B26]">
                      {c.title}
                      <span
                        className={`ml-2 rounded px-1.5 py-0.5 text-xs font-medium ${
                          a.parent_attempt_id
                            ? "bg-[#EDE4F0] text-[#6E5A7A]"
                            : "bg-[#F6E3D0] text-[#8A5A44]"
                        }`}
                      >
                        {a.parent_attempt_id ? "branch replay" : "full run"}
                      </span>
                    </p>
                    <p className="text-xs text-[#7A6A5E]">
                      {a.mode} · {new Date(a.completed_at ?? a.started_at).toLocaleString()}
                    </p>
                  </div>
                  {a.outcome_summary && (
                    <p className="mt-1 text-sm leading-relaxed text-[#5A4A40]">
                      {a.outcome_summary}
                    </p>
                  )}
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {rows.map((row) => {
                      const v = row.value;
                      return (
                        <div key={row.key} className="rounded-lg bg-[#FBF3E9] px-3 py-2">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-xs font-medium tracking-wide text-[#8A5A44]">
                              {row.label}
                            </span>
                            <span
                              className={`text-sm font-semibold ${
                                v > 0 ? "text-[#2E6B66]" : v < 0 ? "text-[#A34A2E]" : "text-[#7A6A5E]"
                              }`}
                            >
                              {v > 0 ? `+${v}` : v}
                            </span>
                          </div>
                          <MiniBar value={v} />
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Link
                      href={`/dashboard/attempt/${a.id}`}
                      className="rounded-full bg-[#E88C6E] px-3.5 py-1 text-sm font-medium text-white transition-colors hover:bg-[#D97B5D]"
                    >
                      Review attempt
                    </Link>
                    <button
                      onClick={() => setExpanded(isOpen ? null : a.id)}
                      className="text-sm font-medium text-[#8A5A44] hover:underline"
                    >
                      {isOpen ? "Hide" : "All eight metrics"} {isOpen ? "▴" : "▾"}
                    </button>
                    <Link
                      href={`/case/${a.case_id}`}
                      className="text-sm font-medium text-[#8A5A44] hover:underline"
                    >
                      Replay case →
                    </Link>
                  </div>
                  {isOpen && (
                    <div className="mt-3 grid gap-x-6 gap-y-1 rounded-lg bg-[#FBF3E9] p-3 sm:grid-cols-2">
                      {rows.flatMap((row) =>
                        metricsFor(row.stakeholder).map((m) => {
                          const v = (row.source as MetricState)[m.key];
                          return (
                            <div key={row.key + m.key} className="flex items-baseline justify-between gap-4">
                              <span className="text-sm text-[#3A2B26]">{m.label}</span>
                              <span
                                className={`text-sm font-medium ${
                                  v > 0
                                    ? "text-[#2E6B66]"
                                    : v < 0
                                      ? "text-[#A34A2E]"
                                      : "text-[#7A6A5E]"
                                }`}
                              >
                                {v > 0 ? `+${v}` : v}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-[#3A2B26]">Your dashboard</h1>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[#E7D6C4] bg-white p-4">
      <p className="text-2xl font-semibold text-[#3A2B26]">{value}</p>
      <p className="text-sm text-[#7A6A5E]">{label}</p>
    </div>
  );
}

function MiniBar({ value }: { value: number }) {
  const RANGE = 8;
  const pct = (Math.min(Math.abs(value), RANGE) / RANGE) * 50;
  return (
    <div className="relative mt-1 h-2 rounded-full bg-[#F3E8DA]">
      <div className="absolute left-1/2 top-0 h-2 w-px bg-[#C9B295]" />
      <div
        className={`absolute top-0 h-2 ${
          value >= 0 ? "rounded-r-full bg-[#4FA39C]" : "rounded-l-full bg-[#E88C6E]"
        }`}
        style={value >= 0 ? { left: "50%", width: `${pct}%` } : { right: "50%", width: `${pct}%` }}
      />
    </div>
  );
}

function nodeTitle(caseId: string, nodeId: string): string {
  const c = caseById(caseId);
  return c?.nodes.find((n) => n.id === nodeId)?.title ?? nodeId;
}
