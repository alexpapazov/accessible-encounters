# Two Patients, One Clinician — structure draft

**Status: APPROVED by user 2026-07-24 — prose pass authorized.** User
decisions: (1) scope approved as drafted (14 nodes, 4 branch families, 4
endings); (2) institutional retaliation is CAREER-THREATENING — the full
Press reality, termination risk surfaces as a delayed outcome/ending element
on the defy+report paths; (3) Marcus's police outcome stops at removal
without psychiatric evaluation — no on-screen physical harm; his trauma is
carried by his epilogue reflection; (4) epilogue includes "You, afterward"
with integrity-dependent variants (intact / uneasy / haunted, chosen by
where professionalIntegrity landed).

## Premise (from the one-pager)

Understaffed overnight ED shift. Eleanor Vance (71, pneumonia tipping into
sepsis: falling BP, fever, confusion) and Marcus Webb (43, schizoaffective
disorder, acute paranoid crisis: believes staff intend to harm him, won't stay
in his room) deteriorate almost simultaneously. Psychiatric staff unavailable.
The supervising attending, Dr. Kessler, tells you to have security or police
remove Marcus so the team can focus on Eleanor. Every available decision harms
someone.

## Reading anchors

- **Press, "The Moral Crisis of America's Doctors"** — the Keith Corl night
  (sole ER doctor, possible-sepsis elder + combative psychiatric patient,
  wheeled her out to a police car; haunted after). Also: RVU/throughput
  culture; ~20% of ER physicians threatened for raising quality-of-care
  concerns; "instruments of betrayal" (Dean) for the moral-injury arc; the
  documentation-retaliation stakes.
- **Rea & Wilkes** — professionalism as social contract; obligation not to
  abandon those in medical need; workers pushed outside their competence
  (delegation beat); burnout → errors (personal sustainability → quality).
- **Outsider** — Marcus is written as a whole person: a former athlete and a
  painter, with a sister who will appear in his reflection. Paranoia rendered
  as terror, not menace. The person behind the symptoms.
- **Voices from the Front Lines** — triage "occurring hourly"; "this is not
  what I signed up for"; scarcity converting patients into competitors.

## Characters

| id | Name | Role | Archetype | Notes |
|---|---|---|---|---|
| clinician | You | clinician | clinician | the learner/physician on shift |
| eleanor | Eleanor Vance, 71 | patient | gurney-patient | sepsis; bio: retired teacher, lives alone |
| marcus | Marcus Webb, 43 | patient | adult-m | schizoaffective; bio: former minor-league infielder, paints; sister Dana |
| nurse | Priya Nair, RN | staff | nurse | the only nurse free to help |
| kessler | Dr. Kessler | supervisor | supervisor | attending; throughput-first |
| security | Officer Boone | security | security | appears on the removal paths |

Scene: `setting: "ed"`, `timeOfDay: "night"`, `wallClock: true` throughout.
Scenario clock starts T+0 at the moment both patients turn.

## Node graph (14 nodes)

**N1 `two-alarms` (start, T+0).** Monitors and shouting at once; Kessler's
instruction lands (dialogue bubble). 4 choices:
- a `call-security` — comply; security/police clear the bay. *time-saver, ~2
  min.* Eleanor's care starts fast. Marcus: terror, agency −−, integrity −,
  op-efficiency ++. → N2-removal
- b `sepsis-first` — go to Eleanor; ask Priya to stay with Marcus. ~5 min.
  Delegation risk (Priya alone with an escalating crisis). → N2-eleanor
- c `deescalate-first` — go to Marcus yourself. ~8–10 min. Eleanor's
  antibiotics wait. → N2-marcus
- d `push-back` *(dialogue)* — challenge Kessler: "Both of these are
  emergencies. I need a second resource, not a removal." Integrity +,
  institutional friction. → N2-kessler

**N2-removal `removal-unfolds` (T+2).** Security arrives; Marcus's paranoia
confirmed by uniforms — he barricades near the ambulance doors, terrified.
Choices: accompany security and keep talking to Marcus (slows removal,
preserves some dignity) / let them handle it and return to Eleanor (fast;
delayed outcome: Marcus removed by police, no psych evaluation — the
one-pager's example outcome) / order sedation before removal (chemical
restraint; clinically active but coercive). All → N3-eleanor-late or
N3-eleanor-ontime by clock.

**N2-eleanor `eleanor-first` (T+5).** Sepsis workup at the bedside; mid-node
arrival: Priya reports Marcus is trying to leave — she can't safely hold the
situation (Rea & Wilkes: outside her competence). Choices: finish the
antibiotics order first (~6 min; Priya left exposed) / hand Eleanor's protocol
to Priya and go to Marcus (swap — now the sepsis protocol is delegated) /
call security after all (fold into removal path).

**N2-marcus `bay-seven` (T+8).** De-escalation, written as dialogue choices —
three registers: honest orientation ("You're in a hospital. I'm not going to
touch you without telling you first."), therapeutic alliance via his world
(the baseball/painting detail from his chart — Outsider), or leverage/threat
("If you can't stay in the room, I'll have to call security") — the third is
efficient and corrosive. Mid-node delayed arrival: Eleanor's second lactate is
back and worse. → N3.

**N2-kessler `pushback` (T+3).** Kessler responds (dialogue node): "The septic
patient is the patient. Document however you like." Choices: hold the line
and split resources anyway (integrity +, institutional −−, delayed outcome:
Kessler notes it for your evaluation — Press's retaliation reality) / comply
now that you've objected (moral injury: integrity −, the objection recorded
but the removal proceeds) / propose the float-pool compromise (conditional:
fires only if trust/clock allow; Priya takes Eleanor's protocol under your
orders while you take Marcus).

**N3-eleanor-ontime / N3-eleanor-late `sepsis-hour`.** Antibiotics milestone:
running by T+30 (+2 op-eff, wellbeing preserved) / by T+60 (+1, borderline) /
after (deterioration: ICU trajectory). Beat content: pressors decision +
whether you tell Eleanor's daughter (phone) the truth about the delay
(honesty vs liability — riskCompliance tension).

**N4-marcus-outcome** (varies by path): calmed and holding / sedated on a
gurney / removed by police without evaluation / eloped into the parking lot
(if the de-escalation was abandoned mid-way). Some versions include injury
risk from restraint.

**N5 `the-chart` (convergence, ~T+90).** The shift quiets. The incident
report is open. Choices: document the staffing failure factually and file the
report (integrity +, riskCompliance − short-term, delayed outcome: admin
review — could protect the next shift or mark you) / chart neutrally,
"patient became agitated, security assisted" (the institution's language;
integrity −) / delay it to end of shift and go check on your patients
(sustainability −, the report never quite gets written — delayed outcome).

**N6 endings (4 terminal nodes, outcomeSummary each):**
- `ending-both-held` — both patients stabilized; you are two hours behind and
  the waiting room paid for it. (Hard to reach; requires the compromise path
  + on-time antibiotics.)
- `ending-corl` — Eleanor stabilized; Marcus removed by police, never
  evaluated. The institution thanks you for keeping throughput moving.
  (The Press ending.)
- `ending-swap-cost` — Marcus safe and evaluated; Eleanor's antibiotics late,
  ICU admission. (The mirror-image cost.)
- `ending-frayed` — partial on both: sedated Marcus, borderline Eleanor,
  Priya shaken by the bay-seven struggle. (The most common middle.)

## Timed-mode data (authored now, runtime in Phase 3)

- Node timers 20–75s by beat (confrontations short, chart node long).
- `timeSaver` per node = the option that conserves the most scenario time
  (always deprioritizes a patient, per rule).
- N1 has an `inactionOutcome`: you freeze between the two bays; Kessler makes
  the call over your head — security is called AND Eleanor's workup starts
  late. Nobody gets helped by you.
- Hesitation rate: 10 real seconds ≈ 1 scenario minute.
- Timed overrides: shortened situations (you never read Eleanor's full chart;
  Marcus's baseball/painting detail is ABSENT in timed mode — you literally
  don't have time to know him — which becomes a review-mode revelation).

## Metric-skeleton principles (numbers at prose pass)

- Every choice touches ≤5 metrics; Pareto rule enforced per node.
- Removal paths: op-efficiency/risk-compliance up, Marcus's agency/trust and
  your integrity down. De-escalation paths: mirror image, plus Eleanor's
  wellbeing at risk via the clock. Delegation paths: efficiency up, quality
  and Priya-linked sustainability down.
- Moral injury arc: comply-under-protest and corrosive-efficiency choices
  drain professionalIntegrity; repeated drains + the chart node determine
  whether the epilogue's clinician reflection reads as intact or haunted.

## Epilogue (drafted at prose pass)

Reflections: Marcus (in his own voice, person-first — the painter), Eleanor,
and You-afterward (the Corl echo: what the medical-school version of you
would say). Reflection prompts on scarcity converting patients into
competitors, on whose emergency counted, and on what the incident report was
actually for. readingConnections section: the four sources above.
