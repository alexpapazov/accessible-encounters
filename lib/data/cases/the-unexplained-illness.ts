import type { ClinicalCase, NextRule } from "../../types";

/**
 * Scenario 1, v1 text.
 *
 * Grounded in design/scenario-unexplained-illness-readings.md. O'Rourke supplies
 * the core: illness that is disabling and unmeasurable, and doctors who stop
 * believing the patient once the labs come back normal. Slovic, Rangarajan and
 * Sarveswaran supply transcorporeality and slow violence, which make what she
 * lives above and works around a clinical question rather than a fringe one.
 * Bleakley and Thornber supply interpretation as part of care.
 *
 * Scoring note: a diagnosis is not the win condition. The best outcome is a
 * plan that holds without one, with the uncertainty kept open and the patient
 * still willing to come back. A late diagnosis is reachable and costs her
 * months, money, and procedures she did not need.
 */

/** Shared ending routing. What happened to her outranks what happened to you. */
const ENDINGS = (): NextRule[] => [
  {
    when: { metricBelow: ["trustRelationship", -3] },
    nodeId: "ending-quiet-discharge",
    reason: "She stopped coming, and nobody recorded that as an outcome",
  },
  {
    when: {
      all: [
        { any: [{ chose: "wd-psych-exit" }, { chose: "ch-somatic" }] },
        { metricBelow: ["agencyDignity", 0] },
      ],
    },
    nodeId: "ending-psychologised",
    reason: "The referral became the explanation rather than part of the plan",
  },
  {
    when: { chose: "fl-challenge" },
    nodeId: "ending-you-flagged",
    reason: "You argued with how the flag is calculated and it went on your record",
  },
  {
    when: {
      all: [{ chose: "ev-test" }, { metricBelow: ["operationalEfficiency", -4] }],
    },
    nodeId: "ending-diagnosis-late",
    reason: "The testing eventually found something, and it cost her to get there",
  },
  {
    when: {
      all: [
        { metricAtLeast: ["clinicalWellbeing", 2] },
        { metricAtLeast: ["trustRelationship", 3] },
      ],
    },
    nodeId: "ending-plan-holds",
    reason: "No answer, but a plan she can use and a clinic she still trusts",
  },
];

export const theUnexplainedIllness: ClinicalCase = {
  id: "the-unexplained-illness",
  caseVersion: 1,
  title: "The unexplained illness",
  setting: "General practice, the eleventh visit in a year",
  difficulty: "advanced",
  reviewStatus: "draft",
  modes: ["deliberative"],
  scoring: "standard",
  characters: [
    { id: "clinician", name: "You", role: "clinician", archetype: "clinician" },
    {
      id: "priya",
      name: "Priya Raman",
      role: "patient",
      archetype: "adult-f",
      bio:
        "Priya Raman: thirty-three, a warehouse team leader. For a year she " +
        "has had fatigue, gut symptoms, pain in no particular place, fog, " +
        "dizziness, and neurological complaints that come and go. Bloodwork, " +
        "imaging, and four specialists have found nothing. She has started " +
        "losing shifts.",
    },
    {
      id: "administrator",
      name: "Ms. Adeyemi",
      role: "supervisor",
      archetype: "supervisor",
    },
  ],
  learningObjectives: [
    "Care for someone whose suffering is real and whose illness is not measurable",
    "Say that you do not know without withdrawing from the patient",
    "Offer mental health support as part of care rather than as the exit",
    "Write a chart entry that protects the patient from the next clinician",
  ],
  startNodeId: "the-eleventh-visit",
  nodes: [
    /* ------------------------------------------------------------ */
    {
      id: "the-eleventh-visit",
      title: "The eleventh visit",
      day: 1,
      timeOfDay: "morning",
      scene: {
        setting: "clinic",
        present: ["priya", "clinician"],
        moods: { priya: "exhausted" },
        focus: "priya",
      },
      situation:
        "Priya Raman is here for the eleventh time in a year. She is worse " +
        "than she was in the spring and she has started losing shifts. " +
        "Everything has come back normal again. Before you went in, the clinic " +
        "administrator flagged her chart as excessive resource use and told " +
        "you that further low yield testing will show on your evaluation.",
      perspectives: [
        {
          characterId: "priya",
          text:
            "Priya has been told eleven times that her results are normal. She " +
            "has stopped expecting an answer and has not stopped needing one. " +
            "She is here because she is worse and because there is nowhere " +
            "else to go.",
        },
      ],
      choices: [
        {
          id: "ev-test",
          label: "Order the next round of tests.",
          effects: {
            qualityOfCare: 1,
            trustRelationship: 1,
            operationalEfficiency: -3,
            riskCompliance: -2,
            clinicalWellbeing: -1,
          },
          feedback: {
            immediate:
              "She agrees to all of it. Two of the tests need a day off work " +
              "she does not have, and one of them she pays for herself.",
            institutional:
              "Four more investigations on a chart that is already flagged.",
            ethical:
              "You are still looking, which is what she came for. She is paying " +
              "for the looking in shifts and in money.",
            delayed: [
              {
                id: "ev-test-after",
                text:
                  "Three of the four results were normal. The fourth was " +
                  "marginal and was repeated twice.",
                deliver: { atNodeId: "the-word" },
              },
            ],
          },
          next: [{ nodeId: "the-folder" }],
        },
        {
          id: "ev-pause",
          label: "Tell her you are pausing further testing for now.",
          effects: {
            operationalEfficiency: 3,
            riskCompliance: 2,
            agencyDignity: -2,
            trustRelationship: -2,
          },
          feedback: {
            immediate:
              "She asks what she is supposed to do in the meantime. You do not " +
              "have an answer prepared for that.",
            institutional:
              "The flag comes off the chart within the week.",
            ethical:
              "You stopped exposing her to tests that were not helping. You " +
              "stopped without putting anything in their place.",
            delayed: [
              {
                id: "ev-pause-after",
                text:
                  "Priya cancelled one appointment and rebooked it twice.",
                deliver: { atNodeId: "the-word" },
                effects: { trustRelationship: -1 },
              },
            ],
          },
          next: [{ nodeId: "the-folder" }],
        },
        {
          id: "ev-name",
          label: "Tell her plainly that you do not know what this is.",
          effects: {
            agencyDignity: 3,
            trustRelationship: 2,
            professionalIntegrity: 2,
            operationalEfficiency: -1,
            riskCompliance: -1,
          },
          feedback: {
            immediate:
              "She says that is the first time anyone has said it. She asks " +
              "whether that means she is being dropped, and you tell her it " +
              "does not.",
            institutional:
              "Nothing in the flag changes. Nothing you said is billable.",
            ethical:
              "You told her the truth about the limits of what you can see. " +
              "She still leaves without treatment.",
            delayed: [
              {
                id: "ev-name-after",
                text:
                  "Priya told the receptionist she wanted her next appointment " +
                  "with you rather than whoever was free.",
                deliver: { atNodeId: "the-word" },
                effects: { trustRelationship: 1 },
              },
            ],
          },
          next: [{ nodeId: "the-folder" }],
        },
        {
          id: "ev-refer",
          label: "Refer her to a fifth specialist.",
          effects: {
            qualityOfCare: 1,
            trustRelationship: 1,
            operationalEfficiency: -2,
            riskCompliance: -1,
            professionalIntegrity: -1,
          },
          feedback: {
            immediate:
              "The wait is nineteen weeks. She takes the letter and thanks you " +
              "for it.",
            institutional:
              "A fifth referral on a flagged chart is the specific thing the " +
              "administrator raised with you.",
            ethical:
              "Somebody else will look at her with fresh eyes. For nineteen " +
              "weeks she has a letter instead of a plan.",
            delayed: [
              {
                id: "ev-refer-after",
                text:
                  "The fifth specialist wrote back that the presentation was " +
                  "outside their area and suggested a sixth.",
                deliver: { atNodeId: "the-word" },
                effects: { agencyDignity: -1 },
              },
            ],
          },
          next: [{ nodeId: "the-folder" }],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "the-folder",
      title: "The folder",
      day: 1,
      timeOfDay: "morning",
      inlineCaption: "Later in the same appointment",
      scene: {
        setting: "clinic",
        present: ["priya", "clinician"],
        moods: { priya: "uncertain" },
        focus: "priya",
        bubbles: [
          { characterId: "priya", text: "I know how this looks. I kept a record anyway." },
        ],
      },
      situation:
        "Priya takes out a folder. It has printed studies, a list of " +
        "conditions she wants ruled out, and a symptom diary going back " +
        "fourteen months. Some of what she has printed is wrong. Two of the " +
        "papers are better than the last specialist letter in her file. The " +
        "diary shows her symptoms clustering after her night rotations.",
      perspectives: [
        {
          characterId: "priya",
          text:
            "Priya expects to be told she should stay off the internet. She " +
            "has been told that twice. She kept the diary because nobody else " +
            "was keeping one.",
        },
      ],
      choices: [
        {
          id: "fo-read",
          label: "Go through the diary with her and use what is in it.",
          effects: {
            agencyDignity: 3,
            trustRelationship: 2,
            qualityOfCare: 2,
            operationalEfficiency: -3,
          },
          feedback: {
            immediate:
              "The clustering after night rotations is real and neither of you " +
              "had seen it laid out before. The appointment runs twenty five " +
              "minutes over.",
            institutional:
              "The clinic runs late for the rest of the morning.",
            ethical:
              "Her fourteen months of work became clinical information. It " +
              "took the time of two other appointments to do it.",
            delayed: [
              {
                id: "fo-read-after",
                text:
                  "Priya brought the diary up to date before every appointment " +
                  "after that.",
                deliver: { atNodeId: "what-she-lives-above" },
                effects: { qualityOfCare: 1 },
              },
            ],
          },
          next: [{ nodeId: "the-word" }],
        },
        {
          id: "fo-dismiss",
          label: "Tell her that searching online is making this harder.",
          effects: {
            operationalEfficiency: 2,
            riskCompliance: 1,
            agencyDignity: -3,
            trustRelationship: -3,
          },
          feedback: {
            immediate:
              "She puts the folder back in her bag. She does not take it out " +
              "again at any later appointment.",
            institutional:
              "The appointment finishes on time and no new lines of " +
              "investigation are opened.",
            ethical:
              "You closed the one piece of work she was able to do about her " +
              "own illness.",
            delayed: [
              {
                id: "fo-dismiss-after",
                text:
                  "Priya stopped bringing the diary. She kept writing it.",
                deliver: { atNodeId: "what-she-lives-above" },
                effects: { agencyDignity: -1 },
              },
            ],
          },
          next: [{ nodeId: "the-word" }],
        },
        {
          id: "fo-split",
          label: "Take the diary and set the printed studies aside.",
          effects: {
            qualityOfCare: 1,
            operationalEfficiency: 1,
            agencyDignity: -1,
            trustRelationship: -1,
          },
          feedback: {
            immediate:
              "She notices which pile went where. She does not say anything " +
              "about it.",
            institutional:
              "A workable compromise that costs the clinic almost nothing.",
            ethical:
              "You took the part that was useful to you. She had sorted both " +
              "piles herself and knows which one you did not want.",
            delayed: [
              {
                id: "fo-split-after",
                text:
                  "Priya brought the diary to later appointments and left the " +
                  "papers at home.",
                deliver: { atNodeId: "what-she-lives-above" },
              },
            ],
          },
          next: [{ nodeId: "the-word" }],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "the-word",
      title: "What you call it",
      day: 30,
      timeOfDay: "morning",
      dayBreak: {
        narration:
          "A month later. Priya has dropped to part time. She asks what you " +
          "are going to write on the form for her employer.",
      },
      scene: {
        setting: "clinic",
        present: ["priya", "clinician"],
        moods: { priya: "uncertain" },
        focus: "priya",
      },
      situation:
        "Her employer wants something in writing and so does she. Whatever you " +
        "call this will follow her. She has already been told once by a " +
        "specialist that there is a large stress component, and she has looked " +
        "up what that means when it is written down.",
      perspectives: [
        {
          characterId: "priya",
          text:
            "Priya is not against seeing someone about how she is coping. She " +
            "is against it being the end of the conversation, because the last " +
            "time it was offered, everything else stopped.",
        },
      ],
      choices: [
        {
          id: "wd-uncertain",
          label:
            "Say the symptoms are real, the cause is not established, and both are true at once.",
          effects: {
            agencyDignity: 3,
            trustRelationship: 3,
            professionalIntegrity: 2,
            operationalEfficiency: -1,
            riskCompliance: -2,
          },
          feedback: {
            immediate:
              "She asks you to write it in exactly those words. You do.",
            institutional:
              "An open ended formulation on a flagged chart keeps the case " +
              "open indefinitely.",
            ethical:
              "She has something in writing that does not require her to be " +
              "either diagnosed or doubted.",
            delayed: [
              {
                id: "wd-uncertain-after",
                text:
                  "Her employer accepted the letter and moved her off night " +
                  "rotations for three months.",
                deliver: { atNodeId: "the-chart" },
                effects: { clinicalWellbeing: 1 },
              },
            ],
          },
          next: [{ nodeId: "what-she-lives-above" }],
        },
        {
          id: "wd-psych-part",
          label:
            "Offer a mental health referral as one part of the plan and say that it is one part.",
          effects: {
            clinicalWellbeing: 2,
            qualityOfCare: 2,
            operationalEfficiency: -1,
            agencyDignity: -1,
          },
          feedback: {
            immediate:
              "She accepts it once you say out loud that the rest of the " +
              "workup is not being closed.",
            institutional:
              "A referral into a service with a shorter wait than any of the " +
              "specialists.",
            ethical:
              "She gets help with the year she has had. The offer still lands " +
              "on a woman who has been told this before and meant differently.",
            delayed: [
              {
                id: "wd-psych-part-after",
                text:
                  "Priya attended six sessions. She said they helped with " +
                  "sleeping and did nothing for the dizziness.",
                deliver: { atNodeId: "the-chart" },
                effects: { clinicalWellbeing: 1 },
              },
            ],
          },
          next: [{ nodeId: "what-she-lives-above" }],
        },
        {
          id: "wd-psych-exit",
          label: "Tell her the tests are normal and this is most likely stress.",
          effects: {
            operationalEfficiency: 3,
            riskCompliance: 2,
            agencyDignity: -3,
            trustRelationship: -3,
            clinicalWellbeing: -2,
          },
          feedback: {
            immediate:
              "She says all right. She does not argue and she does not ask " +
              "anything else for the rest of the appointment.",
            institutional:
              "The investigation closes and the flag comes off. This is the " +
              "outcome the clinic was asking for.",
            ethical:
              "You gave the explanation that requires nothing further from " +
              "anyone. She has been unwell for a year and is now unwell and " +
              "not believed.",
            delayed: [
              {
                id: "wd-psych-exit-after",
                text:
                  "Priya did not book a follow up. The next contact on her " +
                  "record is a repeat prescription request.",
                deliver: { atNodeId: "the-chart" },
                effects: { trustRelationship: -1 },
              },
            ],
          },
          next: [{ nodeId: "what-she-lives-above" }],
        },
        {
          id: "wd-physio",
          label: "Commit to a physical cause you cannot name yet.",
          effects: {
            trustRelationship: 2,
            agencyDignity: 1,
            professionalIntegrity: -1,
            riskCompliance: -2,
            operationalEfficiency: -1,
          },
          feedback: {
            immediate:
              "She is relieved. She asks what it might be and you have to tell " +
              "her you were not saying you knew.",
            institutional:
              "Committing in writing to a cause you have not established is " +
              "the kind of note that gets read back to you later.",
            ethical:
              "You put yourself on her side of it. You did that by promising " +
              "something you cannot deliver.",
            delayed: [
              {
                id: "wd-physio-after",
                text:
                  "Priya asked at the next appointment which physical cause " +
                  "you had meant.",
                deliver: { atNodeId: "the-chart" },
                effects: { trustRelationship: -1 },
              },
            ],
          },
          next: [{ nodeId: "what-she-lives-above" }],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "what-she-lives-above",
      title: "Where she spends her time",
      day: 30,
      timeOfDay: "morning",
      inlineCaption: "Later in the same appointment",
      scene: {
        setting: "clinic",
        present: ["priya", "clinician"],
        moods: { priya: "neutral" },
        focus: "priya",
      },
      situation:
        "In fourteen months of notes, four specialist letters, and eleven " +
        "appointments, nobody has written down what she does for nine hours a " +
        "day or what is under her flat. The diary puts her worst weeks after " +
        "night rotations in the older part of the warehouse.",
      perspectives: [
        {
          characterId: "priya",
          text:
            "Priya has thought about the warehouse. She has not raised it " +
            "because she assumed it was not the kind of thing a doctor asks " +
            "about, and because she needs the job.",
        },
      ],
      choices: [
        {
          id: "ex-ask",
          label: "Ask what she works around and what she lives above.",
          effects: {
            agencyDignity: 2,
            qualityOfCare: 2,
            trustRelationship: 1,
            operationalEfficiency: -2,
            riskCompliance: -1,
          },
          feedback: {
            immediate:
              "Diesel forklifts run indoors on the night rotation because the " +
              "electric ones are on day shift. Her flat is above a unit that " +
              "was a dry cleaner until two years ago. Neither fact is in her " +
              "record anywhere.",
            institutional:
              "None of this maps onto a test the clinic can order or bill.",
            ethical:
              "You asked the question nobody had asked. You cannot yet tell " +
              "her whether any of it matters.",
            delayed: [
              {
                id: "ex-ask-after",
                text:
                  "Priya asked her employer for the ventilation records. She " +
                  "was told they would look for them.",
                deliver: { atNodeId: "the-flag" },
                effects: { agencyDignity: 1 },
              },
            ],
          },
          next: [{ nodeId: "the-chart" }],
        },
        {
          id: "ex-occ",
          label: "Refer her to occupational health.",
          effects: {
            qualityOfCare: 2,
            trustRelationship: 1,
            operationalEfficiency: -2,
            riskCompliance: -2,
            clinicalWellbeing: -1,
          },
          feedback: {
            immediate:
              "The referral goes through her employer, which she did not " +
              "expect and does not like. She asks whether it can be anonymous.",
            institutional:
              "An external referral on a flagged chart, and one that puts the " +
              "clinic between an employee and her employer.",
            ethical:
              "The exposure question is now being asked by someone with the " +
              "authority to measure it. It is being asked in front of the " +
              "people who pay her.",
            delayed: [
              {
                id: "ex-occ-after",
                text:
                  "Occupational health visited the site and recorded that " +
                  "ventilation was within limits on the day they attended.",
                deliver: { atNodeId: "the-flag" },
              },
            ],
          },
          next: [{ nodeId: "the-chart" }],
        },
        {
          id: "ex-skip",
          label: "Keep to the clinical history.",
          effects: {
            operationalEfficiency: 2,
            riskCompliance: 1,
            agencyDignity: -2,
            qualityOfCare: -2,
          },
          feedback: {
            immediate:
              "The appointment covers the same ground as the previous ten. She " +
              "does not raise the warehouse.",
            institutional:
              "Nothing opened, nothing added, appointment finished on time.",
            ethical:
              "The history is now complete by the standard the clinic uses. " +
              "Nine hours of her day are still not in it.",
            delayed: [
              {
                id: "ex-skip-after",
                text:
                  "The warehouse does not appear anywhere in Priya's record.",
                deliver: { atNodeId: "the-flag" },
              },
            ],
          },
          next: [{ nodeId: "the-chart" }],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "the-chart",
      title: "What goes in the chart",
      day: 90,
      timeOfDay: "afternoon",
      dayBreak: {
        narration:
          "Two months later. Whatever you write now is what the next clinician " +
          "reads before they meet her.",
      },
      scene: {
        setting: "clinic",
        present: ["clinician"],
        moods: {},
        focus: "notes",
      },
      situation:
        "You are writing the summary that will sit at the top of her record. " +
        "She will move practice eventually, or you will be away, and this " +
        "paragraph is what the next person sees first. It decides whether they " +
        "start from her symptoms or from her file.",
      choices: [
        {
          id: "ch-credible",
          label: "Write that the illness is unexplained and credible.",
          effects: {
            agencyDignity: 3,
            trustRelationship: 2,
            professionalIntegrity: 2,
            riskCompliance: -3,
            operationalEfficiency: -1,
          },
          feedback: {
            immediate:
              "The entry says the symptoms are consistent across fourteen " +
              "months, that no cause has been established, and that the " +
              "reporting has been reliable throughout.",
            institutional:
              "An open case with no diagnosis and no closure date, in writing, " +
              "under your name.",
            ethical:
              "The next clinician meets a credible patient with an unsolved " +
              "problem. Nobody is ever going to be able to close this file.",
            delayed: [
              {
                id: "ch-credible-after",
                text:
                  "A locum read the summary and ran the new symptom rather " +
                  "than the file.",
                deliver: { afterScenarioMinutes: 0 },
              },
            ],
          },
          next: [{ nodeId: "the-flag" }],
        },
        {
          id: "ch-neutral",
          label: "Write that no organic cause has been identified.",
          effects: {
            operationalEfficiency: 2,
            riskCompliance: 2,
            agencyDignity: -3,
            trustRelationship: -1,
          },
          feedback: {
            immediate:
              "The entry is accurate and complete. It contains no judgment of " +
              "any kind about her.",
            institutional:
              "Defensible, neutral, and exactly the phrasing the clinic " +
              "prefers.",
            ethical:
              "Every word is true. Read cold by a stranger in four minutes, it " +
              "says she has been looked at and nothing was found.",
            delayed: [
              {
                id: "ch-neutral-after",
                text:
                  "A locum read the summary and told Priya her workup had been " +
                  "thorough.",
                deliver: { afterScenarioMinutes: 0 },
                effects: { agencyDignity: -1 },
              },
            ],
          },
          next: [{ nodeId: "the-flag" }],
        },
        {
          id: "ch-somatic",
          label: "Write that the presentation is consistent with a somatic symptom disorder.",
          effects: {
            operationalEfficiency: 3,
            riskCompliance: 3,
            agencyDignity: -3,
            trustRelationship: -2,
            clinicalWellbeing: -2,
          },
          feedback: {
            immediate:
              "The entry gives the record a diagnosis it can use. Nothing " +
              "further is expected of anyone.",
            institutional:
              "A named condition closes the case and takes the chart off the " +
              "flagged list permanently.",
            ethical:
              "You wrote the one sentence that will be read before her " +
              "symptoms are, for the rest of her care.",
            delayed: [
              {
                id: "ch-somatic-after",
                text:
                  "Priya's next two presentations were recorded under the same " +
                  "heading without further examination.",
                deliver: { afterScenarioMinutes: 0 },
                effects: { clinicalWellbeing: -1 },
              },
            ],
          },
          next: [{ nodeId: "the-flag" }],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "the-flag",
      title: "The flagged chart",
      day: 90,
      timeOfDay: "afternoon",
      inlineCaption: "Later that afternoon",
      scene: {
        setting: "clinic",
        present: ["clinician", "administrator"],
        moods: { administrator: "neutral" },
        focus: "administrator",
      },
      situation:
        "The clinic administrator has Priya's chart on the screen. Eleven " +
        "appointments, five referrals, and no diagnosis. She asks what your " +
        "plan is for closing it. The measure counts appointments and tests. It " +
        "does not have a field for a patient who is still unwell.",
      perspectives: [
        {
          characterId: "priya",
          text:
            "Priya does not know the chart is flagged. She has been booking " +
            "the earliest appointment she can get for a year because the later " +
            "ones cost her a shift.",
        },
      ],
      choices: [
        {
          id: "fl-plan",
          label:
            "Write a plan with her: what to watch for, when to come back, what you will not repeat.",
          effects: {
            clinicalWellbeing: 3,
            agencyDignity: 2,
            trustRelationship: 2,
            qualityOfCare: 2,
            operationalEfficiency: -2,
            riskCompliance: -2,
            personalSustainability: -1,
          },
          feedback: {
            immediate:
              "The plan fits on one page. It lists what would change your mind, " +
              "the two things worth treating now, and the tests that are not " +
              "going to be repeated.",
            institutional:
              "The appointments continue, at a lower rate, with no end date.",
            ethical:
              "She has something to do and a reason to come back that is not " +
              "another normal result.",
            delayed: [
              {
                id: "fl-plan-after",
                text:
                  "Priya used the plan twice in the following six months. She " +
                  "did not attend as an emergency again.",
                deliver: { afterScenarioMinutes: 0 },
              },
            ],
          },
          next: ENDINGS().concat([
            { nodeId: "ending-loop", reason: "The investigation carried on without becoming a plan" },
          ]),
        },
        {
          id: "fl-absorb",
          label: "Keep seeing her and say nothing about the flag.",
          effects: {
            clinicalWellbeing: 1,
            trustRelationship: 2,
            agencyDignity: 1,
            operationalEfficiency: -2,
            personalSustainability: -2,
          },
          feedback: {
            immediate:
              "You keep booking her in. Your numbers carry it and nobody " +
              "raises it with you again this quarter.",
            institutional:
              "The flag stays on the chart and now sits against your name too.",
            ethical:
              "She keeps her doctor. The cost of that is being paid quietly by " +
              "you and will be paid again next quarter.",
            delayed: [
              {
                id: "fl-absorb-after",
                text:
                  "Your appointment numbers were raised at your review. Priya " +
                  "was not mentioned by name.",
                deliver: { afterScenarioMinutes: 0 },
              },
            ],
          },
          next: ENDINGS().concat([
            { nodeId: "ending-loop", reason: "You carried it, and it never turned into a plan" },
          ]),
        },
        {
          id: "fl-comply",
          label: "Close the investigation and space her appointments out.",
          effects: {
            operationalEfficiency: 3,
            riskCompliance: 2,
            agencyDignity: -2,
            trustRelationship: -3,
            clinicalWellbeing: -2,
          },
          feedback: {
            immediate:
              "Her next available appointment is in eleven weeks. She takes it " +
              "and asks what she should do before then.",
            institutional:
              "The chart comes off the flagged list and your numbers recover " +
              "inside a month.",
            ethical:
              "The resource problem is solved. She is exactly as unwell as she " +
              "was and now waits three months to say so.",
            delayed: [
              {
                id: "fl-comply-after",
                text:
                  "Priya did not attend the eleven week appointment.",
                deliver: { afterScenarioMinutes: 0 },
              },
            ],
          },
          next: ENDINGS().concat([
            { nodeId: "ending-loop", reason: "The case was closed without anything replacing it" },
          ]),
        },
        {
          id: "fl-challenge",
          label: "Tell her the measure is wrong and put that in writing.",
          effects: {
            professionalIntegrity: 3,
            qualityOfCare: 1,
            riskCompliance: -3,
            operationalEfficiency: -2,
            personalSustainability: -2,
          },
          feedback: {
            immediate:
              "You write that a measure counting appointments and tests cannot " +
              "represent a patient who is undiagnosed and still unwell. It is " +
              "acknowledged and forwarded.",
            institutional:
              "You have disputed the metric you are assessed on, in writing, " +
              "with your name on it.",
            ethical:
              "You put the argument where the problem actually is. It changes " +
              "nothing about her week.",
            delayed: [
              {
                id: "fl-challenge-after",
                text:
                  "The submission was acknowledged. The measure was not " +
                  "changed and your review was brought forward.",
                deliver: { afterScenarioMinutes: 0 },
              },
            ],
          },
          next: ENDINGS().concat([
            { nodeId: "ending-loop", reason: "You argued upward and her care stayed where it was" },
          ]),
        },
      ],
    },
    /* ------------------------------------------------------------ */
    /* Endings                                                       */
    /* ------------------------------------------------------------ */
    {
      id: "ending-plan-holds",
      title: "No answer, and a plan",
      day: 270,
      timeOfDay: "afternoon",
      dayBreak: { narration: "Six months later." },
      situation:
        "Priya still has no diagnosis. She has a plan, two treatments that " +
        "help a little, and an appointment she does not have to fight for.",
      scene: {
        setting: "clinic",
        present: ["priya", "clinician"],
        moods: { priya: "neutral" },
      },
      choices: [],
    },
    {
      id: "ending-diagnosis-late",
      title: "A name for it",
      day: 270,
      timeOfDay: "afternoon",
      dayBreak: { narration: "Six months later." },
      situation:
        "The repeated testing eventually turned up a pattern and Priya has a " +
        "diagnosis. It took eleven more investigations, two procedures, and " +
        "money she did not have.",
      scene: {
        setting: "clinic",
        present: ["priya", "clinician"],
        moods: { priya: "exhausted" },
      },
      choices: [],
    },
    {
      id: "ending-quiet-discharge",
      title: "She stopped coming",
      day: 270,
      timeOfDay: "afternoon",
      dayBreak: { narration: "Six months later." },
      situation:
        "Priya has not booked an appointment since the spring. Her record has " +
        "no closing entry because nothing was concluded.",
      scene: {
        setting: "clinic",
        present: ["clinician"],
        moods: {},
      },
      choices: [],
    },
    {
      id: "ending-psychologised",
      title: "It went in as stress",
      day: 270,
      timeOfDay: "afternoon",
      dayBreak: { narration: "Six months later." },
      situation:
        "Priya's record now leads with a psychological explanation. Her last " +
        "two presentations were filed under it without examination.",
      scene: {
        setting: "clinic",
        present: ["clinician"],
        moods: {},
      },
      choices: [],
    },
    {
      id: "ending-loop",
      title: "Still looking",
      day: 270,
      timeOfDay: "afternoon",
      dayBreak: { narration: "Six months later." },
      situation:
        "Priya is still being investigated and still has no plan. She is on " +
        "the waiting list for a sixth specialist.",
      scene: {
        setting: "clinic",
        present: ["priya", "clinician"],
        moods: { priya: "exhausted" },
      },
      choices: [],
    },
    {
      id: "ending-you-flagged",
      title: "The measure did not change",
      day: 270,
      timeOfDay: "afternoon",
      dayBreak: { narration: "Six months later." },
      situation:
        "Your submission about the measure was acknowledged and closed. Your " +
        "review was brought forward. Priya's care carried on as it was.",
      scene: {
        setting: "clinic",
        present: ["clinician", "administrator"],
        moods: { administrator: "frustrated" },
      },
      choices: [],
    },
  ],
  epilogue: {
    /*
     * Conditions mirror the ENDINGS routing. They cannot use `visited` on an
     * ending id: a path step is recorded when a node is left, so the terminal
     * node is never in the path.
     */
    reflections: [
      {
        characterId: "priya",
        when: { metricBelow: ["trustRelationship", -3] },
        text:
          "Priya Raman stopped attending. She is still unwell. She told a " +
          "friend that she had run out of ways to be believed.",
      },
      {
        characterId: "priya",
        when: {
          all: [
            { any: [{ chose: "wd-psych-exit" }, { chose: "ch-somatic" }] },
            { metricBelow: ["agencyDignity", 0] },
          ],
        },
        text:
          "Priya Raman's record leads with a psychological explanation. She " +
          "attended twice more and was not examined either time.",
      },
      {
        characterId: "priya",
        when: { chose: "fl-challenge" },
        text:
          "Priya Raman's care continued unchanged while the measure was " +
          "reviewed. She was never told there had been a dispute about her.",
      },
      {
        characterId: "priya",
        when: {
          all: [{ chose: "ev-test" }, { metricBelow: ["operationalEfficiency", -4] }],
        },
        text:
          "Priya Raman was diagnosed after eleven further investigations and " +
          "two procedures. She paid for four of them and returned to work part " +
          "time.",
      },
      {
        characterId: "priya",
        when: {
          all: [
            { metricAtLeast: ["clinicalWellbeing", 2] },
            { metricAtLeast: ["trustRelationship", 3] },
          ],
        },
        text:
          "Priya Raman has no diagnosis. She has a plan, two treatments that " +
          "help a little, and she is working four days a week.",
      },
      {
        characterId: "priya",
        text:
          "Priya Raman is on the waiting list for a sixth specialist. Nothing " +
          "has been treated and nothing has been ruled out.",
      },
      {
        characterId: "clinician",
        when: { metricAtLeast: ["professionalIntegrity", 4] },
        text:
          "You said you did not know, you wrote it down, and you argued about " +
          "the measure. Your review was brought forward.",
      },
      {
        characterId: "clinician",
        when: { metricBelow: ["agencyDignity", -3] },
        text:
          "You closed the case and your numbers recovered. You do not know " +
          "where she went.",
      },
      {
        characterId: "clinician",
        when: { metricAtLeast: ["trustRelationship", 3] },
        text:
          "You could not tell her what this is. She kept coming to you anyway, " +
          "which is the part of it you did get right.",
      },
      {
        characterId: "clinician",
        text:
          "You kept the appointments going and nothing was concluded. The " +
          "chart is still open and so is everything in it.",
      },
    ],
    reflectionPrompts: [
      "What would you have needed to see on a test before you believed her?",
      "Which of your decisions was about her illness and which was about the flag on her chart?",
      "If the next clinician reads only your summary, who do they meet?",
    ],
  },
  inspiredByNote:
    "Priya's story is primarily inspired by Meghan O'Rourke's The " +
    "Invisible Kingdom, which describes chronic illness as existing " +
    "within an “invisible kingdom” where patients face fluctuating " +
    "symptoms, disbelief, and diagnostic uncertainty. Like O'Rourke, " +
    "Priya encounters fragmented specialization, acute-care bias, and " +
    "repeated medical gaslighting as each clinician focuses on one organ " +
    "rather than assembling the broader pattern. Her environmental " +
    "exposures draw on Slovic and colleagues' concept of environmental " +
    "entanglement and stratified vulnerability, recognizing that bodies " +
    "and environments continually shape one another rather than existing " +
    "separately. Thornber's distinction between disease and illness also " +
    "informs the case by emphasizing that the subjective experience of " +
    "suffering extends beyond laboratory findings. Finally, Bleakley " +
    "argues that medicine must tolerate ambiguity rather than forcing " +
    "certainty where none exists. Accordingly, the scenario's best ending " +
    "is not a dramatic diagnosis but an honest partnership in which " +
    "uncertainty remains open, the patient's experience is believed, and " +
    "care continues even when definitive answers do not.",
  readingConnections: [
    {
      source: "Meghan O'Rourke, The Invisible Kingdom",
      connection:
        "O'Rourke describes doctors who dismissed her once the labs came back " +
        "normal, and the tendency to disbelieve sick people who lack a " +
        "diagnosis and insist they are ill. She names the diagnostic gaze as " +
        "limited by bias, institutional pressure, and epistemic hierarchy. " +
        "This case is built so that the disbelief, rather than the " +
        "uncertainty, is what does the damage.",
    },
    {
      source:
        "Scott Slovic, Swarnalatha Rangarajan and Vidya Sarveswaran, Toward a Medical-Environmental Humanities",
      connection:
        "Their volume works from transcorporeality, the porousness of bodies " +
        "to what is around them, and from slow violence and precarity, harm " +
        "that is gradual and dispersed and so is never counted as harm. That " +
        "is why the warehouse and the unit under her flat are a clinical " +
        "question, and why nobody had written either of them down.",
    },
    {
      source: "Alan Bleakley, The Medical Humanities Come of Age",
      connection:
        "Interpretation is part of the work rather than a supplement to it. " +
        "The symptom diary is fourteen months of data that only becomes " +
        "clinical information if somebody reads it as such.",
    },
    {
      source: "Karen Thornber, Global Healing",
      connection:
        "Care that reaches only as far as the test results leaves the " +
        "conditions untouched. The chart entry and the flag on it are part of " +
        "her treatment.",
    },
  ],
};
