"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getAttempt, type AttemptRow } from "@/lib/attempts";
import { cases } from "@/lib/data/cases";
import { Results } from "@/components/CasePlayer";
import { replayComplete } from "@/lib/engine";

/**
 * The ending screen for a finished attempt, rebuilt from its saved path.
 *
 * This is the same component the player sees the moment they finish, so the
 * card on the dashboard reopens exactly what they saw rather than a summary of
 * it. Nothing about the run is stored as rendered text: the path is replayed
 * through the engine, which also tells us which delayed outcomes had landed by
 * the end so the Aftermath panel matches.
 */
export default function AttemptOutcomePage() {
  const { id } = useParams<{ id: string }>();
  const { enabled, loading, user } = useAuth();
  const router = useRouter();
  const [attempt, setAttempt] = useState<AttemptRow | null | "missing">(null);

  useEffect(() => {
    if (user && id) getAttempt(id).then((row) => setAttempt(row ?? "missing"));
  }, [user, id]);

  const replay = useMemo(() => {
    if (!attempt || attempt === "missing") return null;
    const c = cases.find((x) => x.id === attempt.case_id);
    if (!c) return null;
    try {
      const state = replayComplete(c, attempt.path);
      return { c, state, aftermath: state.aftermath };
    } catch {
      // The attempt was recorded against an older version of this case and
      // refers to nodes or choices that no longer exist, so it cannot be
      // replayed. The saved scores on the dashboard card are still accurate.
      return { c, state: null, aftermath: [] };
    }
  }, [attempt]);

  if (!enabled) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-[#5A4A40]">Accounts are not configured on this deployment.</p>
      </div>
    );
  }
  if (loading || attempt === null) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-[#7A6A5E]">Loading…</p>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/signin" className="text-[#8A5A44] underline">
          Sign in to see this attempt
        </Link>
      </div>
    );
  }
  if (attempt === "missing" || !replay) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-[#5A4A40]">That attempt could not be found.</p>
        <Link href="/dashboard" className="mt-3 inline-block text-[#8A5A44] underline">
          Back to your dashboard
        </Link>
      </div>
    );
  }
  if (!replay.state) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/dashboard" className="text-sm text-[#8A5A44] hover:underline">
          ← Your dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-[#3A2B26]">
          This ending cannot be reopened
        </h1>
        <p className="mt-2 leading-relaxed text-[#5A4A40]">
          You played version {attempt.case_version} of {replay.c.title}, and the
          encounter has been rewritten since. The scores on your dashboard are
          still what you earned. Playing it again starts from the current
          version.
        </p>
        <Link
          href={`/case/${replay.c.id}`}
          className="mt-4 inline-block rounded-xl bg-[#E88C6E] px-5 py-3 font-medium text-white"
        >
          Play the current version
        </Link>
      </div>
    );
  }

  if (attempt.status !== "completed") {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-[#5A4A40]">This attempt was not finished, so it has no ending.</p>
        <Link href="/dashboard" className="mt-3 inline-block text-[#8A5A44] underline">
          Back to your dashboard
        </Link>
      </div>
    );
  }

  const { c, state, aftermath } = replay;

  return (
    <div>
      <div className="mx-auto max-w-4xl px-6 pt-8">
        <Link href="/dashboard" className="text-sm text-[#8A5A44] hover:underline">
          ← Your dashboard
        </Link>
      </div>
      <Results
        clinicalCase={c}
        mode={attempt.mode}
        metrics={state.metrics}
        patients={state.patients}
        path={state.path}
        clock={state.clock}
        aftermath={aftermath}
        attemptId={attempt.id}
        onRestart={() => router.push(`/case/${c.id}`)}
      />
    </div>
  );
}
