import type { ClinicalCase } from "../../types";

/**
 * Foundational case, remapped to engine v2 (caseVersion 2).
 *
 * Effects were translated from the original four access dimensions to the
 * eight-metric system, enriched with institutional effects where the story
 * clearly implies them (ADA effective-communication obligations, privacy
 * exposure, clinic throughput). Prose is unchanged from the reviewed v1.
 *
 * Node id suffixes: -i = interpreter present, -n = no interpreter.
 */
export const routineClinicVisit: ClinicalCase = {
  id: "routine-clinic-visit",
  caseVersion: 2,
  title: "A routine visit, an unroutine gap",
  setting: "Primary care clinic — headache follow-up appointment",
  difficulty: "foundational",
  reviewStatus: "draft",
  modes: ["deliberative"],
  scoring: "standard",
  characters: [
    {
      id: "maya",
      name: "Maya Reyes",
      role: "patient",
      archetype: "maya",
      bio:
        "I grew up in a Deaf family — ASL is my first language, and Deaf " +
        "community is home, not something missing. English is my second " +
        "language, and written English especially takes real effort. I don't " +
        "lipread well; almost nobody does, whatever hearing people assume. " +
        "When a clinic books me without an interpreter, the message I get is " +
        "that my time and my health matter less than everyone else's.",
      accessNeeds: [
        "Qualified ASL interpreter (in-person preferred)",
        "Direct eye contact — speak to me, not about me",
        "Visual/diagram-based explanations over dense English text",
        "Comprehension checked by teach-back, not by asking 'do you understand?'",
      ],
    },
    { id: "clinician", name: "You", role: "clinician", archetype: "clinician" },
    {
      id: "interpreter",
      name: "VRI interpreter",
      role: "interpreter",
      archetype: "vri-interpreter",
    },
  ],
  learningObjectives: [
    "Recognize that effective communication access is the clinician's and clinic's legal and ethical responsibility, not the patient's problem to solve",
    "Practice interpreter-mediated communication etiquette",
    "Distinguish apparent agreement (nodding) from verified comprehension",
    "Deliver discharge instructions in a format the patient can actually use",
  ],
  startNodeId: "first-contact",
  nodes: [
    {
      id: "first-contact",
      title: "First contact",
      situation:
        "Your 2:15 patient, Maya Reyes, is here for a follow-up on recurring " +
        "headaches. Her chart is flagged: 'Deaf — ASL user.' The front desk " +
        "tells you no interpreter was booked; the scheduling system dropped " +
        "the request. Maya is in the exam room now. Her hearing neighbor, " +
        "who drove her in, is in the waiting room. You have a full " +
        "afternoon of patients. How do you begin?",
      perspectives: [
        {
          characterId: "maya",
          text:
            "Maya arrived on time and confirmed her interpreter request twice " +
            "when booking. She can see from the front desk's body language that " +
            "something has gone wrong — again.",
        },
      ],
      scene: {
        setting: "clinic",
        present: ["maya", "clinician"],
        moods: { maya: "uncertain" },
        focus: "notes",
      },
      choices: [
        {
          id: "fc-notes",
          label:
            "Press on with pen and paper — it's just a follow-up, and notes should cover it.",
          effects: {
            qualityOfCare: -2,
            trustRelationship: -1,
            agencyDignity: -1,
            riskCompliance: -1,
            operationalEfficiency: 1,
          },
          feedback: {
            immediate:
              "Maya takes the pen because refusing feels riskier than " +
              "complying. She answers in short phrases and abandons the " +
              "follow-up questions she had planned to ask.",
            institutional:
              "The schedule holds. Nobody upstream learns that the " +
              "interpreter request was dropped, so nothing stops it from " +
              "happening again.",
            ethical:
              "Written English is not a substitute for ASL. ASL is a distinct " +
              "language with its own grammar — not English on the hands — and " +
              "for many Deaf adults English is a second language. Note-writing " +
              "flattens a medical conversation into fragments, shifts the " +
              "labor of access onto the patient, and under the ADA, " +
              "effective communication is the provider's obligation.",
          },
          next: [{ nodeId: "history-n" }],
        },
        {
          id: "fc-vri",
          label:
            "Apologize for the clinic's error and set up video remote interpreting (VRI) before starting.",
          effects: {
            qualityOfCare: 2,
            trustRelationship: 2,
            agencyDignity: 1,
            riskCompliance: 1,
            operationalEfficiency: -1,
          },
          feedback: {
            immediate:
              "Maya exhales. The apology registers — someone finally treated " +
              "the missing interpreter as the clinic's problem, not hers.",
            institutional:
              "Setting up the cart costs the schedule a few minutes, and " +
              "documenting the dropped request creates a record the clinic " +
              "manager will have to answer for — which is exactly how the " +
              "scheduling failure gets fixed upstream.",
            ethical:
              "Naming the error as the clinic's — not treating it as Maya's " +
              "inconvenience to absorb — matters as much as the fix. VRI is " +
              "an imperfect but legitimate stopgap when in-person " +
              "interpreting falls through: it requires a stable connection, a " +
              "well-positioned screen, and a check-in with the patient that " +
              "it's working for them. Best practice is also to rebook the " +
              "in-person interpreter for future visits.",
          },
          next: [{ nodeId: "history-i" }],
        },
        {
          id: "fc-neighbor",
          label:
            "Ask her neighbor from the waiting room to interpret — they know each other, and it's fastest.",
          effects: {
            agencyDignity: -2,
            trustRelationship: -1,
            qualityOfCare: -1,
            riskCompliance: -2,
            operationalEfficiency: 1,
          },
          feedback: {
            immediate:
              "Maya's jaw tightens. Now her neighbor will hear her medical " +
              "history, and she must choose between her privacy and her " +
              "healthcare in front of two people.",
            institutional:
              "It costs the clinic nothing today. It also exposes the clinic " +
              "to exactly the kind of complaint ADA regulations were written " +
              "for — relying on accompanying adults to interpret is " +
              "specifically restricted.",
            ethical:
              "Family, friends, and neighbors should not interpret medical " +
              "encounters except in true emergencies while qualified access " +
              "is arranged. They lack medical vocabulary in both languages, " +
              "they edit — softening, summarizing, omitting — and their " +
              "presence strips the patient's privacy: Maya may not want her " +
              "neighbor to know anything about her health.",
          },
          next: [{ nodeId: "history-n" }],
        },
        {
          id: "fc-lipread",
          label:
            "Speak slowly and clearly, facing her — she can probably lipread enough.",
          effects: {
            qualityOfCare: -2,
            clinicalWellbeing: -1,
            trustRelationship: -1,
            agencyDignity: -1,
            riskCompliance: -1,
            operationalEfficiency: 1,
          },
          feedback: {
            immediate:
              "Maya watches your lips move and catches fragments — " +
              "'headache,' maybe 'weeks?' She nods where it seems expected, " +
              "already calculating how much of this visit she is going to " +
              "lose.",
            ethical:
              "Even skilled lipreaders catch roughly 30% of English speech on " +
              "the lips — the rest is guesswork, and exaggerated mouthing " +
              "makes it worse, not better. Lipreading assumptions are one of " +
              "the most common and most quietly dangerous defaults in " +
              "clinical care of Deaf patients: the encounter proceeds, both " +
              "parties nod, and critical information silently never arrives.",
          },
          next: [{ nodeId: "history-n" }],
        },
      ],
    },
    {
      id: "history-i",
      title: "Taking the history",
      situation:
        "The VRI cart is set up and the interpreter appears on screen. " +
        "Maya positions herself so she can see both you and the screen. " +
        "You need a detailed headache history: onset, pattern, triggers, " +
        "what she's tried. As the conversation starts, where do you direct " +
        "your attention?",
      perspectives: [
        {
          characterId: "maya",
          text:
            "With an interpreter in the loop, Maya can finally use her own " +
            "language. She has a list of things she's been waiting to say " +
            "since the last visit.",
        },
      ],
      scene: {
        setting: "clinic",
        present: ["maya", "clinician", "interpreter"],
        moods: { maya: "engaged" },
        focus: "interpreter",
      },
      choices: [
        {
          id: "hi-face-interp",
          label:
            "Face the interpreter and ask, 'Can you ask her when the headaches started?'",
          dialogue: { speakerId: "clinician" },
          effects: { agencyDignity: -1, trustRelationship: -2 },
          feedback: {
            immediate:
              "Maya watches you talk to the screen about her. It is a small " +
              "thing, and it is also the whole thing: she is once again a " +
              "topic rather than a person in the room.",
            ethical:
              "Speaking to the interpreter in the third person — 'ask her,' " +
              "'tell her' — removes the patient from her own appointment. " +
              "The interpreter is a conduit, not a participant: speak " +
              "directly to Maya in the first person and keep your eyes on " +
              "her, even while the interpreter is signing. The conversation " +
              "is between you and your patient.",
          },
          next: [{ nodeId: "assessment-i" }],
        },
        {
          id: "hi-face-maya",
          label:
            "Look at Maya, speak to her directly in the first person, and let the interpreter work.",
          effects: { trustRelationship: 2, agencyDignity: 1, qualityOfCare: 1 },
          feedback: {
            immediate:
              "You're looking at her, so she's looking at you — catching " +
              "your expressions, reading your engagement. For the first " +
              "time today this feels like her appointment.",
            ethical:
              "This is interpreter-mediated communication done right: first " +
              "person, eye contact with the patient, natural pacing with " +
              "pauses so the interpretation can complete before you move on. " +
              "Note that Maya must split her visual attention between you " +
              "and the screen — resist the urge to talk while she's watching " +
              "the interpreter finish.",
          },
          next: [{ nodeId: "assessment-i" }],
        },
        {
          id: "hi-rapid",
          label:
            "Run your usual rapid-fire history — you're behind schedule and the interpreter can keep up.",
          effects: {
            qualityOfCare: -1,
            clinicalWellbeing: -1,
            trustRelationship: -1,
            operationalEfficiency: 1,
          },
          feedback: {
            immediate:
              "Questions arrive before Maya finishes answering the last " +
              "one. She starts giving shorter answers to keep up, trimming " +
              "away the details — the vision sparkles, the neck stiffness — " +
              "that she came here to report.",
            ethical:
              "Interpretation is not simultaneous transcription — ASL and " +
              "English have different structures, and a faithful rendering " +
              "lags the source by several seconds. Rapid-fire questions " +
              "stack up, answers get compressed, and the interpreter is " +
              "forced to summarize. The visit moves fast and loses exactly " +
              "the detail a headache history exists to capture.",
          },
          next: [{ nodeId: "assessment-i" }],
        },
      ],
    },
    {
      id: "history-n",
      title: "Taking the history",
      situation:
        "You're attempting a headache history without an interpreter. " +
        "Communication is crawling: every question and answer is being " +
        "squeezed through written fragments and guesswork. Maya's answers " +
        "are getting shorter. You still need onset, pattern, triggers, " +
        "medication history — and you're already 15 minutes behind.",
      perspectives: [
        {
          characterId: "maya",
          text:
            "Maya is doing double work: decoding your English while composing " +
            "her own, all in her second language, about her own health. She " +
            "has stopped volunteering anything you don't directly ask.",
        },
      ],
      scene: {
        setting: "clinic",
        present: ["maya", "clinician"],
        moods: { maya: "frustrated" },
        focus: "notes",
      },
      choices: [
        {
          id: "hn-stop",
          label:
            "Stop. Acknowledge this isn't working, apologize, and get VRI set up now.",
          effects: {
            qualityOfCare: 2,
            trustRelationship: 1,
            agencyDignity: 1,
            professionalIntegrity: 1,
            riskCompliance: 1,
            operationalEfficiency: -1,
          },
          feedback: {
            immediate:
              "Maya puts down the pen and, when the interpreter appears " +
              "on screen, visibly settles. Then she tells you about the " +
              "vision changes before the worst headaches — the detail that " +
              "never made it onto paper.",
            institutional:
              "The visit runs longer and the waiting room backs up — and " +
              "the clinic gains a documented example of why interpreter " +
              "requests can't silently fail.",
            ethical:
              "Recovering mid-encounter is not failure — it's the correct " +
              "response to evidence. The willingness to stop, name the " +
              "problem ('This isn't giving you full access, and that's on " +
              "us'), and fix it is itself a clinical skill. The minutes " +
              "'lost' to setting up VRI are recovered many times over in " +
              "accuracy and trust.",
          },
          next: [{ nodeId: "assessment-i" }],
        },
        {
          id: "hn-press",
          label:
            "Push through with shorter, simpler written questions — you can cover the essentials.",
          effects: {
            clinicalWellbeing: -1,
            qualityOfCare: -2,
            trustRelationship: -1,
            professionalIntegrity: -1,
            operationalEfficiency: 1,
          },
          feedback: {
            immediate:
              "Maya answers what's asked: 'yes,' 'no,' '2 weeks.' The " +
              "vision sparkles before the bad headaches? There's no box on " +
              "this form for that, and no energy left to volunteer it.",
            ethical:
              "Simplifying the questions simplifies the history. A headache " +
              "workup lives on nuance — quality, aura, timing, triggers — " +
              "and yes/no fragments cannot carry it. Studies of Deaf " +
              "patients' healthcare experiences consistently find exactly " +
              "this pattern: encounters that technically happened but " +
              "clinically didn't. Knowing the visit is compromised and " +
              "pressing on anyway is the quiet start of moral injury.",
          },
          next: [{ nodeId: "assessment-n" }],
        },
        {
          id: "hn-defer",
          label:
            "Wrap up quickly and handle the rest at the next visit, when an interpreter can be booked.",
          effects: {
            clinicalWellbeing: -1,
            agencyDignity: -1,
            professionalIntegrity: -1,
            operationalEfficiency: 1,
          },
          feedback: {
            immediate:
              "Another visit to arrange, another ride to find, more time " +
              "off work — and the headaches continue tonight. Maya nods, " +
              "because what else is there to do.",
            ethical:
              "Deferring feels respectful of the access problem, but it " +
              "quietly rations care: Maya took time off work, arranged a " +
              "ride, and waited weeks for this appointment — and leaves " +
              "with her headaches unaddressed. Deaf patients report " +
              "chronically receiving less care per visit than hearing " +
              "patients. The better version of this instinct is to fix " +
              "access now and keep the visit.",
          },
          next: [{ nodeId: "assessment-n" }],
        },
      ],
    },
    {
      id: "assessment-i",
      title: "Explaining the assessment",
      situation:
        "The history points to migraine with aura, likely triggered by " +
        "screen-heavy work and disrupted sleep, and you want to rule out " +
        "anything concerning with a neuro exam today. Time to explain your " +
        "thinking and the plan. How do you deliver it?",
      perspectives: [
        {
          characterId: "maya",
          text:
            "Maya has been to appointments where the diagnosis arrived as a " +
            "single English word on a prescription slip. She wants to actually " +
            "understand what is happening in her head.",
        },
      ],
      scene: {
        setting: "clinic",
        present: ["maya", "clinician", "interpreter"],
        moods: { maya: "engaged" },
        focus: "maya",
      },
      choices: [
        {
          id: "ai-jargon",
          label:
            "Give your standard explanation: 'migraine with aura, cortical spreading depression, we'll do a focused neuro exam to rule out secondary etiologies.'",
          dialogue: { speakerId: "clinician" },
          effects: { qualityOfCare: -1 },
          feedback: {
            immediate:
              "The interpreter fingerspells C-O-R-T-I-C-A-L, then pauses " +
              "and glances at you — there's nothing to interpret yet, " +
              "because nothing has been explained yet.",
            ethical:
              "Even a skilled interpreter can't rescue an explanation the " +
              "source language delivered in jargon — many medical terms " +
              "have no established ASL sign and must be fingerspelled or " +
              "expanded, which works only if the underlying concept was " +
              "explained. Plain language isn't dumbing down; it's the " +
              "prerequisite for interpretation to carry meaning instead of " +
              "vocabulary.",
          },
          next: [{ nodeId: "discharge-i" }],
        },
        {
          id: "ai-plain",
          label:
            "Explain in plain language with a quick sketch: what a migraine is, why the vision sparkles happen, what today's exam checks for.",
          effects: {
            qualityOfCare: 2,
            clinicalWellbeing: 1,
            trustRelationship: 1,
            agencyDignity: 1,
          },
          feedback: {
            immediate:
              "The sketch of the visual cortex and the spreading wave — " +
              "that's her headache, drawn. Maya asks her first full " +
              "question of the visit: do the sparkles mean it's getting " +
              "worse?",
            ethical:
              "Plain language plus a visual is the strongest combination " +
              "here: the sketch carries meaning through a channel that " +
              "doesn't depend on either English or interpretation, and it " +
              "stays with Maya after the visit. Pausing for the " +
              "interpretation to finish before moving to the next idea " +
              "keeps the explanation and the signing in sync.",
          },
          next: [{ nodeId: "discharge-i" }],
        },
        {
          id: "ai-nod",
          label:
            "Explain briefly, ask 'Does that make sense?', and take her nod as confirmation.",
          dialogue: { speakerId: "clinician" },
          effects: { qualityOfCare: -1, clinicalWellbeing: -1 },
          feedback: {
            immediate:
              "Maya nods. She caught most of it, she thinks. The part " +
              "about when to worry versus when not to — that went by " +
              "quickly, but the appointment is clearly moving on.",
            ethical:
              "'Do you understand?' is the least reliable question in " +
              "medicine, and it is especially unreliable across a language " +
              "barrier: nodding is social lubricant, an exit ramp from an " +
              "exhausting interaction, not evidence of comprehension. " +
              "Teach-back — 'Show me how you'll take this; tell me what " +
              "you'll watch for' — is the only real verification, and it " +
              "works through an interpreter.",
          },
          next: [{ nodeId: "discharge-i" }],
        },
      ],
    },
    {
      id: "assessment-n",
      title: "Explaining the assessment",
      situation:
        "Working from the limited history, you believe this is migraine, " +
        "though you have less detail than you'd like. You need to convey " +
        "your assessment and plan — still without an interpreter. What's " +
        "your approach?",
      perspectives: [
        {
          characterId: "maya",
          text:
            "Maya has pieced together that you think it's 'migraine' — that " +
            "word made it through. Why it happens, what the plan is, and " +
            "whether she should be worried: none of that has arrived yet.",
        },
      ],
      scene: {
        setting: "clinic",
        present: ["maya", "clinician"],
        moods: { maya: "uncertain" },
        focus: "notes",
      },
      choices: [
        {
          id: "an-write",
          label: "Write out the diagnosis and plan in a detailed paragraph for her to read.",
          effects: { qualityOfCare: -1, clinicalWellbeing: -1 },
          feedback: {
            immediate:
              "Maya reads the paragraph twice. 'Prophylaxis' — she circles " +
              "it and looks up. There are four more words like it and only " +
              "so much appointment left.",
            ethical:
              "A dense clinical paragraph hands Maya a reading-comprehension " +
              "task in her second language at the most important moment of " +
              "the visit. Health-literacy research is blunt about this even " +
              "for hearing native English speakers; for a Deaf ASL user the " +
              "gap compounds. If written English is genuinely the only " +
              "channel available, short sentences plus diagrams beat " +
              "paragraphs — but the honest lesson is that this moment " +
              "needed an interpreter.",
          },
          next: [{ nodeId: "discharge-n" }],
        },
        {
          id: "an-sketch",
          label:
            "Use simple sentences plus sketches — a head diagram, a calendar for the pattern, pill icons for the plan.",
          effects: { qualityOfCare: 1, clinicalWellbeing: 1, trustRelationship: 1 },
          feedback: {
            immediate:
              "The calendar sketch clicks — she can mark headache days. " +
              "Maya adds her own drawing: sparkle marks before the bad " +
              "ones, a question mark next to them. Some real information " +
              "finally moves in both directions.",
            ethical:
              "Given the constraint, this is the strongest available move: " +
              "visuals carry meaning without depending on English " +
              "proficiency, and they persist after the visit. It does not " +
              "make the encounter accessible — the nuance an interpreter " +
              "would carry is still missing — but it treats Maya as " +
              "someone entitled to understand her own diagnosis.",
          },
          next: [{ nodeId: "discharge-n" }],
        },
      ],
    },
    {
      id: "discharge-i",
      title: "Discharge instructions",
      situation:
        "The exam was reassuring. The plan: a preventive medication " +
        "started low, a rescue medication with specific timing rules, a " +
        "headache diary, and clear return precautions — which symptoms " +
        "mean 'come back immediately.' This is the information that keeps " +
        "patients safe after they leave. How do you close the visit?",
      perspectives: [
        {
          characterId: "maya",
          text:
            "This is the part Maya has been burned by before: leaving with a " +
            "bag of instructions she only mostly understood, and a niggling " +
            "fear of getting the medication timing wrong.",
        },
      ],
      scene: {
        setting: "clinic",
        present: ["maya", "clinician", "interpreter"],
        moods: { maya: "engaged" },
        focus: "maya",
      },
      choices: [
        {
          id: "di-printout",
          label:
            "Hand her the standard printed discharge summary — it's all written down for reference.",
          effects: {
            qualityOfCare: -1,
            clinicalWellbeing: -1,
            trustRelationship: -1,
            operationalEfficiency: 1,
          },
          feedback: {
            immediate:
              "Maya takes the printout — three dense paragraphs. The visit " +
              "was going so well. She'll ask her Deaf community group to " +
              "help her decode the medication section tonight.",
            ethical:
              "The standard printout assumes fluent English reading — the " +
              "same assumption that has quietly failed Maya at every prior " +
              "step. Ending an otherwise accessible visit this way " +
              "abandons the accessibility exactly when the stakes move " +
              "into her home, where there is no interpreter and no " +
              "clinician to ask. Discharge is where communication failures " +
              "convert into medication errors and missed red flags.",
          },
          next: [{ nodeId: "end" }],
        },
        {
          id: "di-teachback",
          label:
            "Go through the plan with the interpreter, using teach-back: Maya explains the plan back, and you annotate the printout with a visual medication schedule.",
          effects: {
            clinicalWellbeing: 2,
            agencyDignity: 2,
            qualityOfCare: 2,
            trustRelationship: 1,
            operationalEfficiency: -1,
          },
          feedback: {
            immediate:
              "Maya signs the plan back: preventive every night, rescue at " +
              "the first sparkles — not later — and the three symptoms " +
              "that mean come back now. She corrects one detail herself, " +
              "catches it, laughs. She's got this.",
            ethical:
              "Teach-back through the interpreter verifies actual " +
              "comprehension; the annotated visual schedule gives Maya an " +
              "artifact that works in her home the way the interpreter " +
              "worked in the room. Asking her to explain the plan — rather " +
              "than asking if she understood it — respects her as the " +
              "person who will actually manage this condition.",
          },
          next: [{ nodeId: "end" }],
        },
        {
          id: "di-verbal",
          label:
            "Summarize the plan verbally through the interpreter and ask if she has questions.",
          effects: { qualityOfCare: 1 },
          feedback: {
            immediate:
              "Maya follows the summary and asks one question about the " +
              "diary. On the drive home she realizes she's unsure whether " +
              "the rescue pill is 'at first sign' or 'if it gets bad' — " +
              "she'll guess.",
            ethical:
              "Interpreted delivery keeps the channel open — genuinely " +
              "better than the printout alone — but a one-way summary " +
              "still leaves comprehension unverified, and 'any questions?' " +
              "at the end of a long appointment reliably produces 'no.' " +
              "The missing piece is teach-back plus a take-home format " +
              "that doesn't revert to dense English the moment she walks " +
              "out.",
          },
          next: [{ nodeId: "end" }],
        },
      ],
    },
    {
      id: "discharge-n",
      title: "Discharge instructions",
      situation:
        "You're closing the visit — still without an interpreter. The " +
        "plan involves a new medication with timing rules and return " +
        "precautions. Whatever Maya leaves with is what she'll be working " +
        "from at home. How do you hand it off?",
      perspectives: [
        {
          characterId: "maya",
          text:
            "Maya is exhausted from ninety minutes of communicating uphill. " +
            "She wants to leave — and she also knows that whatever she " +
            "doesn't nail down right now, she takes home as a guess.",
        },
      ],
      scene: {
        setting: "clinic",
        present: ["maya", "clinician"],
        moods: { maya: "frustrated" },
        focus: "maya",
      },
      choices: [
        {
          id: "dn-printout",
          label: "Give her the standard printout and gesture that she can call with questions.",
          effects: {
            clinicalWellbeing: -2,
            qualityOfCare: -2,
            trustRelationship: -1,
            agencyDignity: -1,
            riskCompliance: -1,
            operationalEfficiency: 1,
          },
          feedback: {
            immediate:
              "Call with questions. Maya files that one away with a flat " +
              "expression — she has been offered phone numbers before. " +
              "Tonight: the printout, a translation app, and hope.",
            institutional:
              "The visit closes on time. The clinic also just handed a Deaf " +
              "patient a phone number as her safety net — the kind of detail " +
              "that reads very differently in a complaint or chart review.",
            ethical:
              "Every layer of this handoff is inaccessible: the dense " +
              "English printout, and a 'call us' fallback — a phone line — " +
              "offered to a Deaf patient. This is how a visit that " +
              "technically happened produces a patient managing a new " +
              "medication on guesswork. The encounter ends the way it ran: " +
              "with the labor of access left entirely on Maya.",
          },
          next: [{ nodeId: "end" }],
        },
        {
          id: "dn-visual",
          label:
            "Build a visual schedule with her — calendar, pill icons, circled red-flag symptoms — and book the next visit with an in-person interpreter confirmed.",
          effects: {
            clinicalWellbeing: 1,
            qualityOfCare: 1,
            agencyDignity: 1,
            trustRelationship: 1,
            riskCompliance: 1,
            operationalEfficiency: -1,
          },
          feedback: {
            immediate:
              "Maya checks the next appointment card: interpreter " +
              "confirmed, in writing, with a name. She holds onto that. " +
              "The visual schedule goes on her fridge that night.",
            institutional:
              "Documenting today's failure in the chart and with the clinic " +
              "manager is what turns one bad visit into a systems fix — " +
              "and a confirmed interpreter booking is cheaper than the " +
              "repeat visit this one nearly became.",
            ethical:
              "Within a compromised visit, this is real harm reduction: a " +
              "visual schedule she can actually use, red flags she can " +
              "actually recognize, and — critically — the next visit fixed " +
              "so this doesn't happen again.",
          },
          next: [{ nodeId: "end" }],
        },
      ],
    },
    {
      id: "end",
      title: "The visit ends",
      situation:
        "Maya gathers her things and heads out through the waiting room. " +
        "The encounter is over — what she carries out of it, in " +
        "understanding and in trust, is already set.",
      scene: {
        setting: "clinic",
        present: ["maya"],
        moods: { maya: "neutral" },
      },
      choices: [],
      outcomeSummary:
        "A routine follow-up whose outcome was decided less by the diagnosis than by whether Maya could access her own appointment.",
    },
  ],
  epilogue: {
    reflections: [
      {
        characterId: "maya",
        text:
          "People think access is a favor the clinic does for me. It isn't. I " +
          "confirmed that interpreter twice. What I remember about my " +
          "appointments isn't usually the diagnosis — it's whether I left " +
          "knowing what's happening in my own body, or left performing " +
          "understanding I didn't have, because everyone was busy and the " +
          "next patient was waiting. When a clinician treats access as their " +
          "job, the appointment is about my headaches. When they don't, the " +
          "appointment is about my deafness — and my headaches come home " +
          "with me untreated.",
      },
    ],
    reflectionPrompts: [
      "At which moment in this visit was the most clinical information at risk of being lost — and would you have noticed the loss at the time?",
      "The clinic's scheduling failure set every downstream problem in motion. What would it take, structurally, for the error to be caught before Maya arrived?",
      "Nodding, short answers, 'no questions' — what did apparent cooperation actually signal at different points in this encounter?",
      "How would this same visit have unfolded for a patient like Maya who is DeafBlind, or oral-deaf, or newly late-deafened? Which of your choices would need to change?",
    ],
  },
  readingConnections: [],
};
