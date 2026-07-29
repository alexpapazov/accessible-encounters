"use client";

import Link from "next/link";
import { useVisualStyle } from "@/components/VisualStyleProvider";
import { SceneRendererFor } from "@/components/scenes";
import { VISUAL_STYLES } from "@/lib/visual-styles";
import { useAuth } from "@/components/AuthProvider";
import type { Character, SceneState } from "@/lib/types";

/** A small, representative scene used to preview each style. */
const PREVIEW_CHARACTERS: Character[] = [
  { id: "patient", name: "Patient", role: "patient", archetype: "adult-f" },
  { id: "clinician", name: "You", role: "clinician", archetype: "clinician" },
];

const PREVIEW_SCENE: SceneState = {
  setting: "clinic",
  present: ["patient", "clinician"],
  moods: { patient: "uncertain", clinician: "neutral" },
  focus: "patient",
  bubbles: [{ characterId: "clinician", text: "Take your time. I'm listening." }],
};

export default function SettingsPage() {
  const { style, setStyle } = useVisualStyle();
  const { enabled, user } = useAuth();
  const available = VISUAL_STYLES.filter((s) => s.available);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-[#3A2B26]">Settings</h1>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-[#3A2B26]">Visual style</h2>
        <p className="mt-1 leading-relaxed text-[#5A4A40]">
          Every style plays the same encounters with the same decisions and
          outcomes. Only the artwork changes.
        </p>

        <div className="mt-4 space-y-4">
          {available.map((s) => {
            const selected = s.id === style;
            return (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                aria-pressed={selected}
                className={`block w-full overflow-hidden rounded-2xl border text-left transition-all ${
                  selected
                    ? "border-[#E88C6E] bg-[#FDF6F0] shadow-sm"
                    : "border-[#E7D6C4] bg-white hover:border-[#D8C4AC]"
                }`}
              >
                <div className="border-b border-[#E7D6C4]">
                  <SceneRendererFor
                    styleId={s.id}
                    scene={PREVIEW_SCENE}
                    characters={PREVIEW_CHARACTERS}
                    timeOfDay="afternoon"
                  />
                </div>
                <div className="flex items-start justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold text-[#3A2B26]">
                      {s.name}
                      <span className="ml-2 text-sm font-normal text-[#7A6A5E]">
                        {s.tagline}
                      </span>
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[#5A4A40]">
                      {s.description}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                      selected
                        ? "bg-[#E88C6E] text-white"
                        : "border border-[#E7D6C4] text-[#8A5A44]"
                    }`}
                  >
                    {selected ? "Selected" : "Use this"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {available.length === 1 && (
          <p className="mt-4 rounded-xl border border-[#E7D6C4] bg-[#FBF3E9] p-4 text-sm leading-relaxed text-[#5A4A40]">
            More visual styles are in development. Whatever gets added,{" "}
            <strong>Basic</strong> stays available permanently.
          </p>
        )}

        <p className="mt-3 text-sm text-[#7A6A5E]">
          {enabled && user
            ? "Saved to your account, so it follows you across devices."
            : "Saved in this browser."}
        </p>
      </section>

      <div className="mt-8">
        <Link
          href="/"
          className="rounded-xl border border-[#E7D6C4] bg-white px-5 py-3 font-medium text-[#3A2B26] transition-colors hover:bg-[#FBF3E9]"
        >
          ← Back to encounters
        </Link>
      </div>
    </div>
  );
}
