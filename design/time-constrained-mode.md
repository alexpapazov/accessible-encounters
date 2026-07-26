# Time-constrained mode — design document

**Status: v2 — all open questions resolved by the user 2026-07-24.** One item
deferred (adaptive pressure, see end). This version is the working spec unless
the user revises it.

## Premise

Time-constrained mode is the same engine, same cases, same metrics as
deliberative mode, with one addition: **decisions expire**. It exists to answer
the project's central question under honest conditions — how does ethical
reasoning change when you cannot stop to deliberate? ("Two Patients, One
Clinician" is the flagship.)

Everything not specified here behaves exactly as in deliberative mode.

---

## The two clocks

### 1. The decision timer (real time)
- Counts down while the user faces a choice. Author-set **per node** (a bedside
  rupture might allow 20 seconds; a family confrontation 90). Fixed as
  authored — no adaptive shortening in v1.
- When it expires, the **time-saver decision** fires automatically (below).
- Frozen on day-break screens and while delta chips display.
- Decision time in **both** modes is recorded per node (deliberative users just
  never see a countdown) — this powers the dashboard's mode comparison.

### 2. The scenario clock (fiction time)
- Time inside the story: "T+38 min into the shift."
- It advances two ways:
  1. **Choice cost:** every choice carries an authored `timeCost` — the
     fiction-minutes the action takes. Ordering labs from the desk: 2 min.
     Going bedside for a procedure: 25 min. More involved decisions genuinely
     spend more of the world's time.
  2. **Hesitation (DECIDED Q1):** real seconds spent deliberating convert to
     scenario minutes at an authored rate (case-level default, e.g. 10 real
     seconds ≈ 1 scenario minute; node-level override allowed). The patient's
     condition does not wait for you to finish thinking. Double pressure —
     the countdown AND the deteriorating world — is intentional.
- The scenario clock is what the *world* responds to: deterioration, arrivals,
  supervisor patience, and branch conditions key off scenario time.

---

## Timeout behavior

### Default: the time-saver decision
- In timed nodes, exactly one visible, Pareto-legal choice is tagged
  **`timeSaver`** — the option that conserves the most scenario time.
- If the countdown expires, the time-saver fires automatically, and the attempt
  records `timedOut: true` for that decision. Review can then show "3 of your
  9 decisions were made by the clock, not by you."
- **Structural rules (DECIDED Q3):**
  - The time-saver choice **always deprioritizes the patient** — this is an
    authoring constraint, not an engine formula. Whatever conserves the most
    time necessarily short-changes this patient's needs, and its authored
    effects must reflect that.
  - When fired by **timeout** (as opposed to being actively chosen), the
    **institutional response is negative**: the institution is angry about the
    wasted decision window. Actively choosing the time-saver quickly reads as
    efficient; freezing until the system defaults reads as time wasted, and
    supervisors/administrators respond accordingly.
  - No additional ad-hoc "paralysis penalty" beyond the above.

### Authored exception: the inaction outcome (DECIDED Q7)
- Authors may override the auto-fire on specific nodes with a bespoke
  **inaction outcome**: if no decision is made in time, **nobody gets helped**
  — the moment passes, the consent conversation dies in silence, neither
  patient is attended. This is its own authored outcome node/effects, distinct
  from every visible choice.
- Use where defaulting to a real choice reads wrong. The default remains the
  time-saver; inaction is the exception, deliberately authored.

---

## Feedback during timed play (DECIDED Q2)

- **Between decisions: metric-delta chips only** (e.g. "Agency −1"), flashed
  briefly so the player feels the direction of consequences. The countdown for
  the next node does not start until the chips clear.
- **No narrative feedback mid-play**: no immediate/delayed-outcome text, no
  institutional response, no ethical interpretation between nodes. The world
  responds diegetically (what characters do next), but explanation waits.
- **Everything lands at the end**: the results screen and attempt review carry
  the full four-part feedback for every decision. In timed mode, review is the
  payoff — you finally learn what your pressured choices meant.

---

## Operational efficiency

Per the user's rule: the faster the user decides *and* the faster the patient
is treated, the higher operational efficiency. Two authored inputs, no magic
formula:

1. **Decision speed** (real clock): per-node thresholds set by the author —
   e.g. answered within 15s → op-efficiency +1. Never negative purely for
   slowness unless the case says so (timeout institutional anger is handled in
   the timeout rules, not here).
2. **Milestones** (scenario clock): case-level targets — e.g. "antibiotics
   running by T+30 → +2; by T+60 → +1; later → 0, and the T+90 node fires the
   supervisor's intervention." Milestones are where hesitation and expensive
   choices actually bite.

Both are visible in attempt review ("Antibiotics started T+52 — missed the
T+30 window: Decision 2 spent 25 minutes bedside and you deliberated 90
seconds across Decisions 1–3").

---

## Incomplete information

Timed variants of a node may show **less** than their deliberative twin (no
time to read the full chart). Authored as optional per-node overrides: a
shorter situation text and/or a hidden patient-view toggle. Deliberative shows
everything; timed shows what a rushed clinician would actually have absorbed.

---

## UI during timed play (DECIDED Q4, Q5, Q6)

- **Countdown: a shrinking bar at the top of the screen** — full width, color
  shifting warm → coral as it empties. **No numeric timer anywhere**; the bar
  is the only representation of remaining decision time.
- **Scenario clock**: shown in the persistent header chip alongside day/time —
  "Day 1 · night · T+38 min" — and, as a design feature, **the wall clock in
  the illustrated scene renders scenario time**. Pure SceneState, so it works
  in every current and future graphics option.
- Grace beat: the bar holds full for ~2 seconds after the node renders before
  it starts shrinking (reading time ≠ deliberating time).

---

## Leaving / pausing

Auto-save after every choice regardless of mode; each timed case declares
whether leaving pauses the attempt or ends it ("Leaving this scenario will end
the current attempt" where authors choose the hard rule).

---

## Data model additions (over deliberative)

- Node: `timerSeconds?` (presence marks the node as timed), `timedOverrides?`
  (situation/patient-view replacements), `inactionOutcome?` (bespoke timeout
  override per Q7)
- Choice: `timeCost` (scenario minutes), `timeSaver?: true` (exactly one per
  timed node lacking an `inactionOutcome`)
- Case: `modes: ("deliberative" | "timed")[]`, hesitation conversion rate
  (real-seconds → scenario-minutes, node override allowed), efficiency
  milestones, decision-speed thresholds
- Branch conditions gain access to: scenario clock, per-node real decision
  time, timed-out flags, metric thresholds
- Attempt record: per-decision real ms (both modes), `timedOut` flags,
  scenario-clock value at each node, milestone results

---

## Deferred (revisit later if wanted)

- **Adaptive pressure** (timers shortening as the shift deteriorates): not in
  v1. The hesitation-burns-fiction-time rule already escalates pressure
  naturally; revisit only if the flagship feels too static in playtesting.
