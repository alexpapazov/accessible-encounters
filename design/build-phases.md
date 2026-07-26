# Build phases — implementation plan

**Status: v1 for user approval, 2026-07-24.** Sequenced so every phase ships
something usable, and everything expensive to change later (schema, engine,
auth) is locked against one real scenario before content is mass-produced.

Two tracks run in parallel:
- **Platform track** (phases below) — engine, backend, dashboard. Claude builds.
- **Content track** — the six scenarios. Gated on the user: one-pagers arrive
  one at a time, readings/excerpts provided per scenario, every uncertainty
  resolved by AskUserQuestion, `npm run export:review` file per case, user
  reads and approves before a case ships. Slots into whatever platform phase
  is current.

---

## Phase 1 — Engine v2 + first scenario (deliberative)

The big rebuild. Everything the old four-dimension engine can't do:

- **Metrics**: eight metrics grouped under PATIENT / DOCTOR / INSTITUTION;
  per-choice effects touch only meaningfully-changed metrics; three-level
  presentation (stakeholder → metric → per-decision deltas)
- **Feedback**: four-part structure (immediate / delayed / institutional
  response / ethical interpretation); delayed-outcome queue; per-scenario
  reading-connections section (separate from decision feedback)
- **Dialogue**: dialogue-type choices (the chosen line IS the decision);
  speech bubbles off characters in the scene renderer
- **Conditional branching**: conditions on metric thresholds, prior choices,
  scenario clock; "why this branch fired" recorded for later review
- **Case-defined rules**: per-case weights, no-score sections (CI case),
  outcome labels
- **Time passing**: `day`/`timeOfDay` palettes, day-break calendar screens
  (pause until Continue, deliver delayed outcomes), persistent day/time chip,
  within-day captions, wall clock in scene
- **Scene v2**: bubbles, palettes, clock, multi-patient scene support
- **Results screen v2** honoring all of the above
- **First scenario authored** (content track: recommend "Two Patients, One
  Clinician" deliberative version, since it exercises multi-patient scenes,
  scenario clock, institutional response, and becomes the timed flagship in
  Phase 3 — but the user picks which one-pager comes first)
- **Maya-case decision executed** (user call: label as foundational/tutorial
  with old four dimensions intact, remap to 8 metrics, or unlist temporarily)

Ships: the new simulator, playable anonymously, one real scenario.
Size: L (largest phase — deliberately, everything downstream depends on it).

## Phase 2 — Accounts + persistence (Supabase)

- Supabase project (user does console steps from the saved instructions;
  schema updated to the rich attempt record: case_id, case_version, mode,
  completion status, path, per-decision timing, 8 final metrics, intermediate
  metric state, started_at/completed_at, parent_attempt_id, branch_node_id,
  saved reflections)
- Google + magic-link sign-in; lightweight profile (display name, optional
  role/training level, all skippable)
- **Sign-in required to begin a case**; public landing + case library remain
  the portfolio front door
- Auto-save after every choice; resume/restart for incomplete attempts
- Basic dashboard: history list (scenario, date, mode, time spent, three
  stakeholder scores, outcome label, expandable 8 metrics; review/replay
  buttons — review button lands in Phase 4)

Ships: durable accounts, nothing lost, visible history.
Size: M.

## Phase 3 — Time-constrained mode

Implements design/time-constrained-mode.md v2 in full on the flagship
scenario: two clocks, hesitation→fiction-time conversion, time-saver
auto-fire (+ institutional anger on timeout), authored inaction outcomes,
chips-only mid-play feedback, shrinking top bar (no digits, grace beat),
scenario clock in chip + wall clock, efficiency milestones + decision-speed
thresholds, timed node overrides (incomplete information), per-case
leave/pause rules. Mode picker on case start.

Ships: the flagship playable in both modes — the project's signature
comparison becomes possible.
Size: M.

## Phase 4 — Attempt review

The most important dashboard feature (user's spec):
- Decision-by-decision walkthrough: situation as seen (including timed-mode
  reduced info), selected choice, decision time, all four feedback parts,
  metric deltas, "which later events this influenced," why branches fired
- Roads not taken: collapsed by default; expanding shows immediate
  consequences only, never the full alternate path
- Full feedback for timed runs lives here (the payoff of chips-only play)

Ships: the reflective core of the product.
Size: M.

## Phase 5 — Counterfactuals + decision map

- **Branch from here**: from any reviewed decision — preserve earlier path,
  choose differently, play the branch live, save as linked branch attempt
  (parent_attempt_id + branch_node_id; "Branched from Decision 3 of your
  July 26 attempt")
- Attempt types distinguished everywhere: original / full replay / branch
- Side-by-side original-vs-counterfactual comparison
- **Decision map** (inside case review): My Path and Explored Paths views;
  solid visited / muted unchosen / hidden undiscovered; never an answer key

Ships: counterfactual learning — likely the strongest feature.
Size: L.

## Phase 6 — Patterns + mode comparison

- Overview page completed: completion stats, continue-where-you-left-off,
  recent activity, stakeholder tendencies
- Pattern statements in choice-language, never personality-language ("Your
  choices have often protected patient agency while increasing institutional
  risk")
- Eight-metric tendencies across attempts; change across repeated attempts
- Deliberative-vs-timed comparison tables with plain-language interpretation

Ships: the longitudinal story — how pressure changes your ethics.
Size: M.

## Phase 7 — Reflection + polish

- Optional written reflections saved with attempts
- Auto-generated pattern statements refined; reflection prompts driven by
  repeated choices
- Remaining scenarios completed (content track finishes)
- Expert-review pipeline: review exports out to Deaf/ASL and clinical
  reviewers; reviewStatus flips only on real review
- Accessibility pass, mobile pass, performance pass

Ships: the complete envisioned product.
Size: M.

## Phase 8 (optional) — Graphics upgrade

Only if time allows; user is explicitly unconcerned. Second renderer (Figma-
designed assets; Rive candidate for animated characters) implementing the
same SceneState; settings toggle; warm flat-SVG style remains forever as an
option.
Size: L, fully skippable.

---

## Content track — per-scenario workflow (any phase)

1. User provides the one-pager + the reading excerpts/summaries to draw from
2. Claude drafts structure first (nodes, branches, metric effects, clocks) —
   checked against the 4-rule node-text protocol (AGENTS.md); every
   uncertainty → AskUserQuestion
3. Prose + dialogue drafted from the readings; export via
   `npm run export:review`; user reads the review file and gives notes
4. Case ships as `draft`; `expert-reviewed` only after real outside review

Scenario order: user's choice, delivered one at a time. Recommendation only:
2 (flagship, Phase 1/3) → 6 or 5 (deliberative depth) → 1 → 4 → 3 (CI case
last — it needs the no-score machinery plus the most careful writing).

## Standing notes

- **Deploy to production after every completed phase** (`vercel deploy --prod
  --yes`) — the user wants to try each phase live as it lands. Mid-phase
  work-in-progress stays local (or Vercel preview deploys) so the public URL
  always holds a complete, verified phase.
- Every phase ends with: typecheck/build, click-through verification,
  review-file regeneration, and a user walkthrough before the next begins.
