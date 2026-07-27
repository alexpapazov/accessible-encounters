"use client";

import { useEffect, useState } from "react";
import { saveReflection } from "@/lib/attempts";

/**
 * Optional written reflection saved with an attempt. Private to the learner —
 * never scored, never analyzed, never shown anywhere but their own history.
 */
export default function ReflectionComposer({
  attemptId,
  initial,
  prompt,
}: {
  attemptId: string | null;
  initial?: string | null;
  prompt?: string;
}) {
  const [text, setText] = useState(initial ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => setText(initial ?? ""), [initial]);

  if (!attemptId) return null;

  return (
    <div className="mt-4 rounded-2xl border border-[#4FA39C] bg-[#EDF6F5] p-5">
      <h2 className="text-lg font-semibold text-[#2E4B48]">Your reflection</h2>
      <p className="mt-1 text-sm leading-relaxed text-[#2E6B66]">
        {prompt ??
          "Anything you want to say about this encounter while it's fresh. Saved with the attempt, visible only to you, never scored."}
      </p>
      <label htmlFor={`reflection-${attemptId}`} className="sr-only">
        Write your reflection on this attempt
      </label>
      <textarea
        id={`reflection-${attemptId}`}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setStatus("idle");
        }}
        rows={5}
        placeholder="What stayed with you? What would you do differently, and what would that have cost?"
        className="mt-3 w-full rounded-xl border border-[#B7D8D4] bg-white p-3 leading-relaxed text-[#3A2B26] outline-none focus:border-[#4FA39C]"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={async () => {
            setStatus("saving");
            await saveReflection(attemptId, text);
            setStatus("saved");
          }}
          className="rounded-xl bg-[#4FA39C] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3E8983]"
        >
          {status === "saving" ? "Saving…" : "Save reflection"}
        </button>
        {status === "saved" && (
          <span className="text-sm text-[#2E6B66]" role="status">
            Saved to this attempt.
          </span>
        )}
      </div>
    </div>
  );
}
