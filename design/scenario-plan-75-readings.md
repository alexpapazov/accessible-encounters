# Scenario 5 — The Plan 75 Consultation: reading notes

Grounding for the case text. Every choice and every piece of feedback traces to
something below. Written under the owner's 2026-07-29 instruction that missing
sources are researched rather than requested.

## Plan 75, dir. Chie Hayakawa (2022)

Researched, not viewed. Verified program mechanics, kept exactly in the case at
the owner's instruction to stay as close to the film as possible:

- A government program offering free euthanasia to citizens seventy-five and over,
  introduced in response to a rapidly ageing population.
- Applicants receive a payment of one hundred thousand yen.
- Representatives staff counters and walk applicants through the process.
- A call centre phones enrollees to provide emotional support while they wait.

The film follows Michi, a seventy-eight-year-old hotel cleaner who loses her job
and her housing and becomes a candidate; Hiromi, a recruitment agent; and Maria,
a Filipina worker employed in the program's aftermath.

**In the case:** the premise is that the offer reaches people whose circumstances
have already made it look sensible. The support-line caller is the person Toshio
speaks to most in a week, which is the film's cruelty in one detail.

**Representation guard:** Toshio Arai is deliberately *not* Michi. She is a woman
of seventy-eight who cleans hotels; he is a widowed man of seventy-nine from a
municipal depot. Owner approved the divergence before writing.

## Chikako Ozawa-de Silva, *The Anatomy of Loneliness* (Class 4)

Scanned PDF, read as page images 1 to 5. Subtitle: Suicide, Social Connection,
and the Search for Relational Meaning in Contemporary Japan.

- **The spine of this case.** The anatomy of loneliness is not the anatomy of a
  single individual but of a type of society. In contemporary industrialised
  societies loneliness is a social fact, not a private failing.
- Loneliness is an affliction of subjectivity: true in the experience of the
  person and not necessarily visible from outside. Someone surrounded by family
  and friends can be terribly lonely.
- It is not reducible to a disorder of body or mind, so it is not caught by
  screening for one.
- Suicide researchers find no simple link between depression and suicide.
  **Languishing**, a deficit in emotional, social, and psychological well-being,
  is more predictive of future suicide than mental illness is. People with
  depression but with meaning and good relationships may be at lower risk than
  people who are languishing without any diagnosis.
- Loneliness carries hard health costs: raised mortality, changed gene
  expression, effects compared to smoking.

**In the case:** this is why the negative depression screen is a decision node
rather than a clearance. A physician who records "screen negative, capacity
intact" and treats that as an answer is making exactly the error the reading
names. `sc-beyond` is the choice that says so out loud.

## Jeremy Nobel, *Project UnLonely* (2023)

Researched. Nobel is a primary care physician at the Harvard Chan School and
Harvard Medical School, and founder of the Foundation for Art & Healing. He
separates loneliness into three faces:

- **Psychological**, a longing for authentic connection to another person.
- **Societal**, a sense of not fitting in or belonging anywhere.
- **Existential**, questions about meaning and purpose.

**In the case:** the eligibility form asks his age, address, diagnoses, and
medication, and none of the three. That gap is what the whole third appointment
is built on.

## Atul Gawande, *Being Mortal* (Class 5)

Already read for scenario 6. What carries over: measure a plan against what the
person actually wants from the time they have, rather than against survival.

**In the case:** this cuts both ways. Keeping Toshio alive inside the same week
is not obviously the thing he is asking for, so the case refuses to score
survival as success.

## Karen Thornber, *Global Healing*

On disk. Care that stops at the patient and never reaches the conditions leaves
the conditions to do the deciding.

**In the case:** the housing referral and the eligibility form are the same
appointment. `wf-money` and `pw-hold` are where that lands.

## Built

`lib/data/cases/the-plan-75-consultation.ts`, v1, reviewStatus draft.
6 decisions per playthrough, 22 choices, 7 endings, 2,304 paths, ~2,900
player-visible words. Deliberative only.

Distribution: handed-off 21%, challenged 21%, flagged 16%, enrolled-processed
15%, withdrew-supported 13%, withdrew-overruled 9%, enrolled-seen 6%.
All three stakeholders green on 36 of 2,304 paths.

## Rules carried into this case

- Enrolling is not scored as failure and surviving is not scored as success.
  What is scored is whether the decision was actually his.
- The case gives no anti-Plan 75 answer. Talking him out of it scores badly:
  he stays alive, still alone, and now knows his doctor will overrule him.
- Never model a character closely on a real or fictional individual.
- All writing follows `design/style-guide.md` without exception, including no
  dashes, no humour, and plain aftermath.
