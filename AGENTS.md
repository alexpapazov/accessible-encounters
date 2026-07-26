<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Accessible Clinical Encounters

A simulator for clinicians to practice communication with Deaf and hard-of-hearing
patients — exploring the diversity of deafness, access needs, and deafness as identity.

## Architecture

- **Cases are pure data, the engine is generic.** New encounters = new data files in
  `lib/data/cases/` registered in `lib/data/cases/index.ts`. Never encode case-specific
  logic in components.
- `lib/types.ts` — the core model: `Persona`, `ClinicalCase`, `CaseNode`, `Choice`,
  `SceneState`. Read this first.
- `components/CasePlayer.tsx` — generic engine: plays any case graph, tracks the four
  score dimensions (access, comprehension, autonomy, rapport), shows evidence-based
  feedback + patient reactions, renders the results/epilogue screen.
- `components/Scene.tsx` — warm flat-illustration SVG exam room, driven by each node's
  `SceneState` (who is present, patient mood, clinician focus).
- Routes: `/` (case library), `/case/[caseId]` (player). No backend, no auth — static.

## Representation principles (non-negotiable)

1. **Never depict signing in illustration or animation.** Handshapes are a language;
   faking them misrepresents it. Signed communication is conveyed through framing,
   presence, and expression. Real ASL goes in `MediaSlot`s as video of Deaf signers.
2. **Deafness is identity and language, not deficit.** Patient personas are people with
   narratives, not teaching props. No "cure" framing.
3. **Feedback explains, never just labels right/wrong.** Every `Choice.feedback` is an
   evidence-based explanation; ethics-centered cases (e.g. cochlear implant decisions)
   must not have a "right answer" score at all.
4. **`reviewStatus` stays honest.** Cases and signs are `draft` until actually reviewed
   by Deaf/ASL-fluent experts. Never mark `expert-reviewed` without real review.
5. **Four score dimensions, never one number.** A clinician can "succeed" clinically
   while trampling autonomy — the model must be able to say so.

## Node-text authoring protocol (user-approved 2026-07-24)

New scenarios test *values under constraint*, not knowledge. Four rules per node:

1. **Pareto rule.** No choice may dominate another: for every pair of options, each
   must beat the other on at least one metric. If one option wins on everything, the
   node is broken — fix the structure before writing prose.
2. **Every option is somebody's right answer.** Each choice must be the defensible
   pick from some lens (patient-advocate, triage-realist, policy-follower...).
   Authoring test: write one sentence per option starting "A thoughtful clinician
   would choose this because…". If you can't, cut or rewrite the option.
3. **Name the cost in the prose.** The situation text must make competing obligations
   *felt* before the choice — the visible waiting room, the supervisor's comment,
   your own fatigue — in ≤120 words. Concise pressure beats exposition.
4. **Tempting corrosion.** The efficient-but-corrosive option must be genuinely
   attractive (saves time, looks competent, follows policy) — never strawmanned.
   Moral injury only teaches if the injurious path was the one you almost wanted.

## Review exports

`npm run export:review` regenerates `review/<case-id>.md` — the complete text of
every case as a linear, readable script (all nodes, choices, effects, feedback).
Re-run it after any case edit; these files are how the author and outside experts
review case content without clicking through the app.

## Roadmap context

Phase 0/1 (current): routine clinic visit case with Maya. Planned next: ER consent
case, cochlear-implant family ethics case (no right-answer scoring), case library
search, ASL medical glossary (separate data model, see project notes), and much later
a hand-tracking experiment (separate track, never a blocker).

