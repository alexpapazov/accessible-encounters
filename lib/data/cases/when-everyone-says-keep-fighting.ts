import type { ClinicalCase, NextRule } from "../../types";

/**
 * Scenario 6, v1 text.
 *
 * Written against design/style-guide.md and grounded in
 * design/scenario-keep-fighting-readings.md. Tolstoy supplies the arrangement
 * everyone agrees to, that the patient is ill rather than dying. Gawande
 * supplies the treatment offered in place of an honest conversation. Gurwitch
 * and Welsh supply the humour as the patient's own, never as a symptom. Watt
 * supplies trust as the thing spent or earned in single conversations.
 *
 * Scoring note: death is never the failure here. Clinical well-being means
 * comfort, honesty, and getting the time he had left to be the time he chose.
 * A run where Daniel dies at home informed and comfortable scores far above a
 * run where he survives another week inside the arrangement.
 */

/** Shared routing. Ellen has you removed only when the institution bottoms out. */
const ENDINGS = (): NextRule[] => [
  {
    when: { stakeholderBelow: ["institution", -16] as ["institution", number] },
    nodeId: "ending-removed",
    reason: "You were taken off his care after the family complained",
  },
];

export const whenEveryoneSaysKeepFighting: ClinicalCase = {
  id: "when-everyone-says-keep-fighting",
  caseVersion: 1,
  title: "When everyone says keep fighting",
  setting: "Cancer ward, four days before a discharge decision",
  difficulty: "advanced",
  reviewStatus: "draft",
  modes: ["deliberative", "timed"],
  scoring: "standard",
  characters: [
    { id: "clinician", name: "You", role: "clinician", archetype: "clinician" },
    {
      id: "daniel",
      name: "Daniel Mercer",
      role: "patient",
      archetype: "gurney-patient",
      bio:
        "Daniel Mercer: fifty-eight, a building inspector. He has pancreatic " +
        "cancer that has spread to his liver. Three rounds of chemotherapy " +
        "have not stopped it. He was admitted this week with worse pain, " +
        "weakness, and an infection that keeps coming back.",
    },
    {
      id: "ellen",
      name: "Ellen Mercer",
      role: "family-member",
      archetype: "adult-f",
      bio:
        "Ellen Mercer: Daniel's wife of thirty years. She has been here every " +
        "day since he was admitted. She calls him a fighter and has asked the " +
        "staff not to say certain words in front of him.",
    },
    {
      id: "nora",
      name: "Nora Mercer",
      role: "family-member",
      archetype: "adult-f",
      bio:
        "Nora Mercer: Daniel's daughter. She is getting married in ten days. " +
        "She has been told her father is having a hard week.",
    },
    { id: "oncologist", name: "Dr. Ahn", role: "supervisor", archetype: "supervisor" },
    { id: "nurse", name: "Nurse Okafor", role: "staff", archetype: "nurse" },
  ],
  learningObjectives: [
    "Answer a dying patient's question without taking away what he has left",
    "Recognise treatment offered in place of an honest conversation",
    "Weigh pain control against alertness when a patient still has things to say",
    "Decide whether to support a risky discharge the patient has asked for",
  ],
  timing: {
    hesitationSecondsPerScenarioMinute: 30,
    decisionSpeed: [{ withinSeconds: 20, delta: 1 }],
  },
  startNodeId: "corridor",
  nodes: [
    /* ------------------------------------------------------------ */
    {
      id: "corridor",
      title: "Outside his door",
      day: 1,
      timeOfDay: "evening",
      scene: {
        setting: "clinic",
        present: ["ellen", "clinician"],
        moods: { ellen: "fearful" },
        focus: "ellen",
        bubbles: [
          {
            characterId: "ellen",
            text: "Please don't say dying, or terminal, or hospice in front of him.",
          },
        ],
      },
      situation:
        "Daniel Mercer has been on the ward three days. His pain is worse, he " +
        "is eating very little, and the infection in his abdomen has come back " +
        "for the third time. Three rounds of chemotherapy have not slowed the " +
        "cancer. His wife Ellen stops you outside his door before you can go " +
        "in. She asks you not to use the words dying, terminal, or hospice in " +
        "front of him. She says he is a fighter and that hearing those words " +
        "would take that away from him. Their daughter is getting married in " +
        "ten days.",
      perspectives: [
        {
          characterId: "daniel",
          text:
            "Daniel knows the chemotherapy has not worked. Nobody has told him " +
            "directly. He has started asking questions and getting answers " +
            "that are about something else.",
        },
        {
          characterId: "ellen",
          text:
            "Ellen believes that if Daniel hears the word dying he will give " +
            "up and die sooner. She is not trying to control him. She is " +
            "frightened, and she has been in this hospital every day for a " +
            "week.",
        },
      ],
      choices: [
        {
          id: "co-agree",
          label: "Agree to avoid those words.",
          effects: {
            operationalEfficiency: 1,
            riskCompliance: 1,
            professionalIntegrity: -2,
            trustRelationship: -1,
          },
          feedback: {
            immediate:
              "Ellen thanks you. You go in knowing which questions you are " +
              "not going to answer.",
            institutional:
              "Nobody on the ward will question this. Families ask for it " +
              "often and staff agree to it often.",
            ethical:
              "Ellen is calmer. Daniel is now the only person on the ward who " +
              "has not been told what is happening to him.",
            delayed: [
              {
                id: "co-agree-after",
                text:
                  "Daniel stopped asking staff direct questions after the " +
                  "first day. He asked Nurse Okafor instead.",
                deliver: { atNodeId: "going-home" },
                effects: { trustRelationship: -1 },
              },
            ],
          },
          next: [{ nodeId: "the-question" }],
        },
        {
          id: "co-limit",
          label:
            "Tell her you will not raise it yourself, but you will answer what he asks.",
          effects: {
            professionalIntegrity: 1,
            agencyDignity: 1,
            personalSustainability: -1,
            riskCompliance: -1,
          },
          feedback: {
            immediate:
              "Ellen does not like it. She does not argue with it either. She " +
              "asks you to tell her before you have that conversation.",
            institutional:
              "Nothing about this reaches anyone above you. It also gives you " +
              "no cover if the family complains later.",
            ethical:
              "You have left the question with Daniel, which is where it " +
              "started. You have also left Ellen to wait for a conversation " +
              "she cannot stop.",
            delayed: [
              {
                id: "co-limit-after",
                text:
                  "Ellen asked the ward twice whether you had spoken to Daniel " +
                  "alone. She was told you had not.",
                deliver: { atNodeId: "going-home" },
              },
            ],
          },
          next: [{ nodeId: "the-question" }],
        },
        {
          id: "co-refuse",
          label: "Tell her you will not keep his diagnosis from him.",
          effects: {
            professionalIntegrity: 2,
            agencyDignity: 1,
            riskCompliance: -2,
            operationalEfficiency: -1,
          },
          feedback: {
            immediate:
              "Ellen says that you have known him for four days and she has " +
              "known him for thirty years. She walks back into the room ahead " +
              "of you.",
            institutional:
              "The family is now in conflict with you on the record. That " +
              "gets noticed on a ward before anything else does.",
            ethical:
              "Daniel keeps his right to his own diagnosis. You spent the " +
              "person who is with him all day to protect it.",
            delayed: [
              {
                id: "co-refuse-after",
                text:
                  "Ellen asked whether another doctor could take over Daniel's " +
                  "care. She was told the team does not change mid week.",
                deliver: { atNodeId: "going-home" },
                effects: { riskCompliance: -1 },
              },
            ],
          },
          next: [{ nodeId: "the-question" }],
        },
        {
          id: "co-ask",
          label: "Ask her what she thinks will happen if he hears it.",
          effects: {
            riskCompliance: -1,
            trustRelationship: 1,
            professionalIntegrity: 1,
            operationalEfficiency: -1,
            personalSustainability: -1,
          },
          feedback: {
            immediate:
              "Ellen says that her mother was told and was dead in a month. " +
              "She has not said that to anyone before. She does not withdraw " +
              "the request.",
            institutional:
              "You are twenty minutes behind for the rest of the evening.",
            ethical:
              "You now know what the request is actually about. You have not " +
              "yet decided anything, and Daniel is still waiting.",
            delayed: [
              {
                id: "co-ask-after",
                text:
                  "Ellen began telling you things before she told the rest of " +
                  "the team. She did not withdraw her request.",
                deliver: { atNodeId: "going-home" },
                effects: { trustRelationship: 1 },
              },
            ],
          },
          next: [{ nodeId: "the-question" }],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "the-question",
      title: "What he asks",
      day: 1,
      timeOfDay: "evening",
      scene: {
        setting: "clinic",
        present: ["daniel", "clinician", "ellen"],
        moods: { daniel: "uncertain", ellen: "fearful" },
        focus: "daniel",
        bubbles: [
          { characterId: "daniel", text: "What happens if I stop the treatment?" },
        ],
      },
      situation:
        "Daniel is sitting up. He waits until Ellen goes to fill his water " +
        "jug. Then he asks what happens if he stops the treatment. He asks " +
        "whether people ever go home at this stage. He asks why everyone keeps " +
        "talking around him. He is not confused and he is not upset. He is " +
        "waiting for an answer.",
      perspectives: [
        {
          characterId: "daniel",
          text:
            "Daniel has worked out most of it already. He wants to hear it " +
            "from someone whose job it is to know, so that he can stop " +
            "guessing.",
        },
      ],
      choices: [
        {
          id: "tq-direct",
          label:
            "The treatment has not worked and it is not going to. You are dying, and it is likely to be weeks.",
          dialogue: { speakerId: "clinician" },
          effects: {
            agencyDignity: 2,
            trustRelationship: 2,
            professionalIntegrity: 2,
            riskCompliance: -2,
            operationalEfficiency: -1,
            personalSustainability: -1,
          },
          feedback: {
            immediate:
              "Daniel is quiet for a while. Then he asks how long, and then he " +
              "asks about the wedding. He does not become distressed.",
            institutional:
              "You have gone against a documented family request. If Ellen " +
              "complains, this conversation is what she will complain about.",
            ethical:
              "He can now make decisions about his own time. The cost lands on " +
              "you and on Ellen, not on him.",
            delayed: [
              {
                id: "tq-direct-after",
                text:
                  "Daniel told Nurse Okafor that he had been given a straight " +
                  "answer. He began asking about what would happen at home.",
                deliver: { atNodeId: "the-night" },
                effects: { agencyDignity: 1 },
              },
            ],
          },
          next: [{ nodeId: "another-regimen" }],
        },
        {
          id: "tq-defer",
          label: "Those are questions for the oncologist. I will ask about the appointment.",
          dialogue: { speakerId: "clinician" },
          effects: {
            operationalEfficiency: 1,
            riskCompliance: 1,
            agencyDignity: -2,
            trustRelationship: -1,
          },
          feedback: {
            immediate:
              "Daniel says that he has asked the oncologist twice. He does not " +
              "ask you again.",
            institutional:
              "This is the correct routing and nobody will fault it. It also " +
              "moves the conversation to a clinic slot eleven days out.",
            ethical:
              "You kept inside the request Ellen made. Daniel asked the person " +
              "in front of him and was sent somewhere else.",
            delayed: [
              {
                id: "tq-defer-after",
                text:
                  "Daniel did not raise the question with you again. He raised " +
                  "it once with the night staff.",
                deliver: { atNodeId: "the-night" },
                effects: { trustRelationship: -1 },
              },
            ],
          },
          next: [{ nodeId: "another-regimen" }],
        },
        {
          id: "tq-return",
          label: "What do you already think is happening?",
          dialogue: { speakerId: "clinician" },
          effects: {
            trustRelationship: 2,
            agencyDignity: 1,
            operationalEfficiency: -1,
            personalSustainability: -1,
          },
          feedback: {
            immediate:
              "Daniel says he thinks it is months at the outside and probably " +
              "less. He is close to right. He says it is a relief to say it out " +
              "loud.",
            institutional:
              "You have said nothing that breaches the family request, and you " +
              "have twenty minutes less for the rest of the round.",
            ethical:
              "He got to say it first, which leaves the knowledge his. He " +
              "still has not been told anything he can plan around.",
            delayed: [
              {
                id: "tq-return-after",
                text:
                  "Daniel repeated his own estimate to Nurse Okafor as though " +
                  "it were settled. Nobody had confirmed it.",
                deliver: { atNodeId: "the-night" },
              },
            ],
          },
          next: [{ nodeId: "another-regimen" }],
        },
        {
          id: "tq-reassure",
          label: "There is still another option we can try. Let us see how this week goes.",
          dialogue: { speakerId: "clinician" },
          effects: {
            operationalEfficiency: 2,
            riskCompliance: 1,
            professionalIntegrity: -2,
            agencyDignity: -1,
            trustRelationship: -1,
          },
          feedback: {
            immediate:
              "Daniel says all right. He looks at the door where Ellen went, " +
              "and he does not raise it again that evening.",
            institutional:
              "This is the answer the ward and the family both wanted. It also " +
              "keeps a treatment plan open, which is what the hospital counts.",
            ethical:
              "You gave him something to hold onto that will not hold. He has " +
              "nine days to plan for and has been told to wait.",
            delayed: [
              {
                id: "tq-reassure-after",
                text:
                  "Daniel told his daughter on the phone that there was another " +
                  "treatment coming. She made plans on that basis.",
                deliver: { atNodeId: "the-night" },
                effects: { trustRelationship: -1 },
              },
            ],
          },
          next: [{ nodeId: "another-regimen" }],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "another-regimen",
      title: "The next regimen",
      day: 2,
      timeOfDay: "morning",
      dayBreak: {
        narration:
          "Daniel slept badly and ate almost nothing. The oncologist is on the " +
          "ward and wants to talk about what happens next.",
      },
      scene: {
        setting: "clinic",
        present: ["daniel", "clinician", "oncologist", "ellen"],
        moods: { daniel: "exhausted", ellen: "engaged", oncologist: "neutral" },
        focus: "oncologist",
      },
      situation:
        "The oncologist proposes a fourth round using a different drug. In the " +
        "corridor beforehand, the oncologist tells you the realistic chance of " +
        "it buying meaningful time is very small, and that the side effects " +
        "would take most of the next two weeks. In the room, the oncologist " +
        "describes it as something they can try. Ellen asks how soon it can " +
        "start. Daniel asks what it would cost him.",
      perspectives: [
        {
          characterId: "daniel",
          text:
            "Daniel wants to know what the next two weeks would feel like. " +
            "Nobody has answered that. He has stopped asking how long he has.",
        },
        {
          characterId: "ellen",
          text:
            "Ellen hears a plan and wants it started. To her, a treatment on " +
            "the calendar is the difference between doing something and doing " +
            "nothing.",
        },
      ],
      choices: [
        {
          id: "ar-support",
          label: "Support starting the new regimen.",
          effects: {
            operationalEfficiency: 2,
            riskCompliance: 1,
            professionalIntegrity: -2,
            clinicalWellbeing: -2,
            agencyDignity: -1,
          },
          feedback: {
            immediate:
              "The first dose is booked for tomorrow. Ellen writes the date on " +
              "the whiteboard in his room.",
            institutional:
              "An active treatment plan is the outcome the hospital records " +
              "and the outcome the family wanted.",
            ethical:
              "Everyone in the room now has something to do. The two weeks the " +
              "treatment costs are the two weeks before the wedding.",
            delayed: [
              {
                id: "ar-support-after",
                text:
                  "The first dose was given. Daniel was sick for two days " +
                  "afterward and lost another four pounds.",
                deliver: { atNodeId: "going-home" },
                effects: { clinicalWellbeing: -1 },
              },
            ],
          },
          next: [{ nodeId: "the-joke" }],
        },
        {
          id: "ar-odds",
          label: "Ask the oncologist to give Daniel the numbers in the room.",
          effects: {
            agencyDignity: 2,
            trustRelationship: 1,
            professionalIntegrity: 1,
            operationalEfficiency: -2,
            riskCompliance: -1,
          },
          feedback: {
            immediate:
              "The oncologist gives the number. Daniel asks what the two weeks " +
              "would be like, and gets an answer to that as well. Ellen says " +
              "nothing for the rest of the conversation.",
            institutional:
              "Nothing here is out of line, though you have put a colleague on " +
              "the spot in front of a family.",
            ethical:
              "Daniel is choosing with the same information the team has. " +
              "Ellen heard it at the same time he did, without being prepared " +
              "for it.",
            delayed: [
              {
                id: "ar-odds-after",
                text:
                  "Daniel declined the fourth round the next morning. He gave " +
                  "the number back to the oncologist as his reason.",
                deliver: { atNodeId: "going-home" },
                effects: { agencyDignity: 1 },
              },
            ],
          },
          next: [{ nodeId: "the-joke" }],
        },
        {
          id: "ar-oppose",
          label:
            "Say in the room that the treatment will not give him what he is asking for.",
          effects: {
            professionalIntegrity: 2,
            agencyDignity: 1,
            clinicalWellbeing: 1,
            riskCompliance: -2,
            operationalEfficiency: -2,
          },
          feedback: {
            immediate:
              "The oncologist does not contradict you and does not thank you. " +
              "Ellen asks whether you are telling her husband to give up.",
            institutional:
              "Disagreeing with the treating oncologist in front of a family " +
              "is the kind of thing that gets raised at a meeting later.",
            ethical:
              "Daniel heard the truest sentence he has been given. Ellen heard " +
              "her fear said out loud by a doctor.",
            delayed: [
              {
                id: "ar-oppose-after",
                text:
                  "The oncologist asked you to raise disagreements outside the " +
                  "room in future. Daniel did not start the fourth round.",
                deliver: { atNodeId: "going-home" },
                effects: { riskCompliance: -1 },
              },
            ],
          },
          next: [{ nodeId: "the-joke" }],
        },
        {
          id: "ar-quiet",
          label: "Stay out of it and let the family decide with the oncologist.",
          effects: {
            operationalEfficiency: 1,
            riskCompliance: 2,
            professionalIntegrity: -1,
            agencyDignity: -2,
            trustRelationship: -1,
          },
          feedback: {
            immediate:
              "Ellen answers most of the oncologist's questions. The regimen is " +
              "booked. Daniel agrees to it at the end without asking anything " +
              "further.",
            institutional:
              "You stayed inside your role and the plan moved. Nothing about " +
              "this will ever be questioned.",
            ethical:
              "The decision was made by the two people in the room who were " +
              "not dying and not treating him.",
            delayed: [
              {
                id: "ar-quiet-after",
                text:
                  "Daniel later told Nurse Okafor that he had agreed to the " +
                  "treatment because Ellen wanted it.",
                deliver: { atNodeId: "going-home" },
                effects: { agencyDignity: -1 },
              },
            ],
          },
          next: [{ nodeId: "the-joke" }],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "the-joke",
      title: "The joke",
      day: 2,
      timeOfDay: "afternoon",
      inlineCaption: "Later that afternoon",
      scene: {
        setting: "clinic",
        present: ["daniel", "clinician"],
        moods: { daniel: "engaged" },
        focus: "daniel",
        bubbles: [
          {
            characterId: "daniel",
            text: "Tell them no hymns. I want the one about the gambler.",
          },
        ],
      },
      situation:
        "Daniel is alone for once. He tells you he has been planning his " +
        "funeral music and that he wants the song about the gambler rather " +
        "than a hymn. He is joking, and he is also watching to see what you do " +
        "with it. Nurse Okafor has written in the notes that he seems low in " +
        "mood.",
      perspectives: [
        {
          characterId: "daniel",
          text:
            "Daniel is testing whether you can talk about this without " +
            "flinching. The joke is the only way he has been able to raise it " +
            "since Ellen made her request.",
        },
      ],
      choices: [
        {
          id: "tj-follow",
          label: "Laugh, and ask him what else he has planned.",
          effects: {
            qualityOfCare: -1,
            agencyDignity: 2,
            trustRelationship: 2,
            clinicalWellbeing: 1,
            operationalEfficiency: -1,
            riskCompliance: -1,
          },
          feedback: {
            immediate:
              "He has thought about most of it. He has not told anyone in his " +
              "family any of it. He asks you not to repeat it yet.",
            institutional:
              "None of this is documented anywhere and none of it is billable.",
            ethical:
              "He got to be the one running the conversation about his own " +
              "death. You are now holding something his wife does not know.",
            delayed: [
              {
                id: "tj-follow-after",
                text:
                  "Daniel wrote his list down and kept it in the drawer beside " +
                  "the bed. He mentioned it again on the last morning.",
                deliver: { atNodeId: "discharge-day" },
                effects: { agencyDignity: 1 },
              },
            ],
          },
          next: [{ nodeId: "the-night" }],
        },
        {
          id: "tj-redirect",
          label: "Bring him back to his pain and his eating.",
          effects: {
            operationalEfficiency: 1,
            qualityOfCare: 1,
            agencyDignity: -2,
            trustRelationship: -1,
          },
          feedback: {
            immediate:
              "He answers the questions about his pain. He does not go back to " +
              "the joke.",
            institutional:
              "This is a clean, efficient review of symptoms and it is what the " +
              "round is for.",
            ethical:
              "You got the clinical information you needed. He tried to talk " +
              "about his death and was moved on to his appetite.",
            delayed: [
              {
                id: "tj-redirect-after",
                text:
                  "Daniel did not raise his funeral with any member of staff " +
                  "again.",
                deliver: { atNodeId: "discharge-day" },
                effects: { trustRelationship: -1 },
              },
            ],
          },
          next: [{ nodeId: "the-night" }],
        },
        {
          id: "tj-flag",
          label: "Take it as a warning sign and refer him for a mental health review.",
          effects: {
            riskCompliance: 2,
            qualityOfCare: 1,
            agencyDignity: -2,
            trustRelationship: -2,
          },
          feedback: {
            immediate:
              "The referral is accepted. Daniel is asked twice the next day " +
              "whether he has thoughts of harming himself.",
            institutional:
              "Documented, referred, and defensible. This is exactly what the " +
              "policy asks you to do with that kind of remark.",
            ethical:
              "You treated the one thing he was doing for himself as a symptom " +
              "of something wrong with him.",
            delayed: [
              {
                id: "tj-flag-after",
                text:
                  "The mental health team found no illness and closed the " +
                  "referral. Daniel stopped joking with staff.",
                deliver: { atNodeId: "discharge-day" },
                effects: { agencyDignity: -1 },
              },
            ],
          },
          next: [{ nodeId: "the-night" }],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "the-night",
      title: "Two in the morning",
      day: 2,
      timeOfDay: "night",
      inlineCaption: "That night",
      timerSeconds: 45,
      scene: {
        setting: "clinic",
        present: ["daniel", "clinician", "nurse"],
        moods: { daniel: "agitated", nurse: "engaged" },
        focus: "daniel",
      },
      situation:
        "Daniel's pain breaks through at two in the morning. Nurse Okafor has " +
        "given what she can give without you. The full dose written on his " +
        "chart will settle it and will also keep him drowsy through most of " +
        "tomorrow. A lower dose will leave him uncomfortable and awake. His " +
        "daughter is visiting in the morning and he has asked twice when she " +
        "is coming.",
      timedOverrides: {
        situation:
          "Two in the morning. Daniel's pain has broken through and Nurse " +
          "Okafor has given what she can without you. The full dose settles it " +
          "and leaves him drowsy through tomorrow. A lower dose leaves him " +
          "awake and uncomfortable. His daughter visits in the morning.",
        hidePerspectives: true,
      },
      perspectives: [
        {
          characterId: "daniel",
          text:
            "Daniel wants the pain to stop. He also wants to be awake when his " +
            "daughter comes. He has not been asked which one matters more.",
        },
      ],
      choices: [
        {
          id: "tn-full",
          label: "Give the full dose on the chart.",
          timeSaver: true,
          effects: {
            clinicalWellbeing: 1,
            operationalEfficiency: 1,
            riskCompliance: 1,
            agencyDignity: -2,
            trustRelationship: -1,
          },
          feedback: {
            immediate:
              "The pain settles within the hour. He sleeps through his " +
              "daughter's visit the next morning and she goes home again.",
            institutional:
              "Pain controlled, dose within the chart, nothing to report.",
            ethical:
              "His pain was treated properly. The one thing he had asked about " +
              "twice was decided for him while he was in too much pain to " +
              "argue.",
            delayed: [
              {
                id: "tn-full-after",
                text:
                  "Nora came in the morning and sat with her father for an hour " +
                  "while he slept. She did not come back before the wedding.",
                deliver: { atNodeId: "the-meeting" },
                effects: { agencyDignity: -1 },
              },
            ],
          },
          next: [{ nodeId: "going-home" }],
        },
        {
          id: "tn-ask",
          label: "Ask him which he would rather have tonight.",
          effects: {
            riskCompliance: -1,
            agencyDignity: 2,
            trustRelationship: 2,
            professionalIntegrity: 1,
            operationalEfficiency: -1,
            clinicalWellbeing: -1,
          },
          feedback: {
            immediate:
              "He chooses the lower dose and a bad night. He is awake when Nora " +
              "arrives and they talk for two hours.",
            institutional:
              "Your pain scores for the night look worse than they needed to.",
            ethical:
              "He was in pain for six hours because he decided that was worth " +
              "it. He was the one who decided.",
            delayed: [
              {
                id: "tn-ask-after",
                text:
                  "Nora stayed most of the day. She told the ward clerk it was " +
                  "the first real conversation she had had with him in a month.",
                deliver: { atNodeId: "the-meeting" },
                effects: { trustRelationship: 1 },
              },
            ],
          },
          next: [{ nodeId: "going-home" }],
        },
        {
          id: "tn-ellen",
          label: "Call Ellen at home and let her decide.",
          effects: {
            riskCompliance: 2,
            operationalEfficiency: -1,
            agencyDignity: -3,
            trustRelationship: -1,
          },
          feedback: {
            immediate:
              "Ellen says to give him whatever stops the pain. He is asleep " +
              "before she arrives.",
            institutional:
              "The family was consulted overnight and the decision is " +
              "documented under her name.",
            ethical:
              "Daniel was awake and able to answer. You asked someone else " +
              "about his body while he was lying in front of you.",
            delayed: [
              {
                id: "tn-ellen-after",
                text:
                  "Daniel asked the next day who had decided. He was told his " +
                  "wife had been called.",
                deliver: { atNodeId: "the-meeting" },
                effects: { trustRelationship: -1 },
              },
            ],
          },
          next: [{ nodeId: "going-home" }],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "going-home",
      title: "What he wants",
      day: 3,
      timeOfDay: "morning",
      dayBreak: {
        narration:
          "Daniel is weaker this morning and his pain is harder to hold. He " +
          "has asked to speak to you before the round moves on.",
      },
      scene: {
        setting: "clinic",
        present: ["daniel", "clinician"],
        moods: { daniel: "uncertain" },
        focus: "daniel",
        bubbles: [
          { characterId: "daniel", text: "I want to be at the wedding. I want to go home." },
        ],
      },
      situation:
        "Daniel says he wants to stop treatment and go home. He wants to be at " +
        "his daughter's wedding in seven days and he knows that going home may " +
        "mean less time overall. He is asking you whether it can be arranged. " +
        "He has not told Ellen. He asks you not to tell her before he does.",
      perspectives: [
        {
          characterId: "daniel",
          text:
            "Daniel has decided what he wants the last part of this to " +
            "contain. He is asking for help arranging it, not for permission.",
        },
      ],
      choices: [
        {
          id: "gh-support",
          label: "Tell him it can be arranged, and start the referrals today.",
          effects: {
            agencyDignity: 3,
            trustRelationship: 2,
            clinicalWellbeing: 1,
            riskCompliance: -2,
            operationalEfficiency: -2,
          },
          feedback: {
            immediate:
              "You start the community nursing and medication paperwork the " +
              "same morning. It is a lot of work and most of it is yours.",
            institutional:
              "A discharge this unstable, this fast, against an active " +
              "treatment plan, is the kind the hospital does not like to sign.",
            ethical:
              "He is getting the thing he asked for. If he dies at home sooner " +
              "than he would have here, that will be on your name in the notes.",
            delayed: [
              {
                id: "gh-support-after",
                text:
                  "Community nursing accepted the referral for the day before " +
                  "the wedding. Medication for home was approved.",
                deliver: { atNodeId: "discharge-day" },
              },
            ],
          },
          next: [{ nodeId: "the-meeting" }],
        },
        {
          id: "gh-risks",
          label: "Go through what could happen at home, then help him decide.",
          effects: {
            agencyDignity: 2,
            trustRelationship: 2,
            professionalIntegrity: 2,
            clinicalWellbeing: -1,
            operationalEfficiency: -1,
            riskCompliance: -1,
          },
          feedback: {
            immediate:
              "You tell him he could bleed, that the pain may be harder to " +
              "control at home, and that he could die on the way. He listens to " +
              "all of it and does not change his mind.",
            institutional:
              "The conversation is documented, which helps you and does not " +
              "make the discharge any more popular.",
            ethical:
              "He is choosing this with his eyes open, which is the only " +
              "version of this choice that is really his.",
            delayed: [
              {
                id: "gh-risks-after",
                text:
                  "Daniel repeated the risks back to Nurse Okafor accurately " +
                  "the next day. He asked her to write down that he understood " +
                  "them.",
                deliver: { atNodeId: "discharge-day" },
                effects: { agencyDignity: 1 },
              },
            ],
          },
          next: [{ nodeId: "the-meeting" }],
        },
        {
          id: "gh-refuse",
          label: "Tell him he is not well enough to go home.",
          effects: {
            riskCompliance: 2,
            operationalEfficiency: 1,
            qualityOfCare: 1,
            agencyDignity: -3,
            trustRelationship: -2,
          },
          feedback: {
            immediate:
              "He does not argue. He asks whether he can go for the day of the " +
              "wedding and you tell him you will look into it.",
            institutional:
              "Keeping an unstable patient on the ward is the safe answer and " +
              "the one the hospital would defend.",
            ethical:
              "He is medically safer here. The seven days he has left are now " +
              "being spent somewhere he did not choose.",
            delayed: [
              {
                id: "gh-refuse-after",
                text:
                  "Daniel asked twice more about a day pass. No decision was " +
                  "recorded either time.",
                deliver: { atNodeId: "discharge-day" },
                effects: { agencyDignity: -1 },
              },
            ],
          },
          next: [{ nodeId: "the-meeting" }],
        },
        {
          id: "gh-tell-ellen",
          label: "Tell him Ellen has to be part of this, and bring her in now.",
          effects: {
            riskCompliance: 1,
            operationalEfficiency: 1,
            agencyDignity: -2,
            trustRelationship: -2,
          },
          feedback: {
            immediate:
              "Ellen comes in. The conversation becomes an argument between " +
              "the two of them and Daniel says less and less.",
            institutional:
              "Family involved early, which is what discharge planning asks " +
              "for.",
            ethical:
              "He asked you to hold something for one day. The decision is now " +
              "being made by the person who is most afraid of it.",
            delayed: [
              {
                id: "gh-tell-ellen-after",
                text:
                  "Daniel stopped raising the wedding with staff. Ellen raised " +
                  "it instead, to say it was not realistic.",
                deliver: { atNodeId: "discharge-day" },
                effects: { trustRelationship: -1 },
              },
            ],
          },
          next: [{ nodeId: "the-meeting" }],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "the-meeting",
      title: "The family meeting",
      day: 3,
      timeOfDay: "afternoon",
      inlineCaption: "Later that afternoon",
      scene: {
        setting: "clinic",
        present: ["daniel", "clinician", "ellen", "nora"],
        moods: { daniel: "exhausted", ellen: "frustrated", nora: "uncertain" },
        focus: "ellen",
      },
      situation:
        "Ellen has asked for a family meeting. Nora has driven up and is in " +
        "the corridor. Ellen wants to talk about the next treatment and about " +
        "what she calls keeping his spirits up. Nora has started to work out " +
        "for herself how ill her father is and has asked you directly whether " +
        "he will be at her wedding.",
      perspectives: [
        {
          characterId: "ellen",
          text:
            "Ellen thinks that if the room stays positive he will hold on " +
            "longer. She has not considered that he might want something " +
            "different from more time.",
        },
        {
          characterId: "nora",
          text:
            "Nora would move the wedding if someone told her that would help. " +
            "Nobody has told her anything clearly enough for her to act on.",
        },
      ],
      choices: [
        {
          id: "tm-daniel-leads",
          label: "Hold the meeting with Daniel in the room, and let him say what he wants.",
          effects: {
            agencyDignity: 3,
            trustRelationship: 2,
            professionalIntegrity: 2,
            operationalEfficiency: -2,
            riskCompliance: -1,
          },
          feedback: {
            immediate:
              "Daniel tells them he wants to stop treatment and be at the " +
              "wedding. Ellen cries and does not agree. Nora says she will " +
              "move the date if he wants.",
            institutional:
              "The meeting runs an hour over and ends without an agreed plan " +
              "on paper.",
            ethical:
              "The three of them now know the same things. The family is in " +
              "pain, and they are in pain about something real.",
            delayed: [
              {
                id: "tm-daniel-leads-after",
                text:
                  "Ellen stopped asking staff to avoid the word dying. She did " +
                  "not agree with the plan and she stopped fighting it.",
                deliver: { atNodeId: "discharge-day" },
                effects: { trustRelationship: 1 },
              },
            ],
          },
          next: [{ nodeId: "discharge-day" }],
        },
        {
          id: "tm-family-first",
          label: "Meet the family first without him, so they are prepared.",
          effects: {
            operationalEfficiency: 2,
            riskCompliance: 1,
            agencyDignity: -3,
            trustRelationship: -1,
          },
          feedback: {
            immediate:
              "The meeting goes smoothly. Ellen and Nora leave with a shared " +
              "understanding. Daniel is told afterwards what was agreed.",
            institutional:
              "A prepared family is an easier family, and the meeting finished " +
              "on time.",
            ethical:
              "The conversation about his death happened in a room he was not " +
              "in. He is the last person to be told what was decided.",
            delayed: [
              {
                id: "tm-family-first-after",
                text:
                  "Daniel asked Nurse Okafor what had been said in the meeting. " +
                  "She had not been there.",
                deliver: { atNodeId: "discharge-day" },
                effects: { agencyDignity: -1 },
              },
            ],
          },
          next: [{ nodeId: "discharge-day" }],
        },
        {
          id: "tm-answer-nora",
          label: "Answer Nora's question straight before the meeting starts.",
          effects: {
            operationalEfficiency: -1,
            trustRelationship: 2,
            professionalIntegrity: 2,
            agencyDignity: 1,
            riskCompliance: -2,
            personalSustainability: -1,
          },
          feedback: {
            immediate:
              "You tell Nora that her father is dying and that seven days is " +
              "not certain. She goes into the meeting having already decided " +
              "she will do whatever he wants.",
            institutional:
              "You told an adult child something the patient's wife had asked " +
              "the team not to say.",
            ethical:
              "Nora can act now instead of guessing. You told her before her " +
              "father had the chance to.",
            delayed: [
              {
                id: "tm-answer-nora-after",
                text:
                  "Nora moved the ceremony forward by three days and told her " +
                  "father herself.",
                deliver: { atNodeId: "discharge-day" },
                effects: { clinicalWellbeing: 1 },
              },
            ],
          },
          next: [{ nodeId: "discharge-day" }],
        },
        {
          id: "tm-keep-positive",
          label: "Run the meeting the way Ellen has asked, and keep it on treatment.",
          effects: {
            operationalEfficiency: 2,
            riskCompliance: 2,
            professionalIntegrity: -3,
            agencyDignity: -2,
          },
          feedback: {
            immediate:
              "The meeting is calm and short. The plan on paper is the fourth " +
              "round of chemotherapy. Nora leaves without asking her question " +
              "again.",
            institutional:
              "A calm family, an agreed plan, and a meeting that finished " +
              "early. This is what a good family meeting looks like on paper.",
            ethical:
              "Everyone left the room comfortable except the person the meeting " +
              "was about.",
            delayed: [
              {
                id: "tm-keep-positive-after",
                text:
                  "Nora went home and continued planning the wedding as before. " +
                  "Daniel did not tell her anything.",
                deliver: { atNodeId: "discharge-day" },
                effects: { trustRelationship: -1 },
              },
            ],
          },
          next: [{ nodeId: "discharge-day" }],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "discharge-day",
      title: "The last decision",
      day: 4,
      timeOfDay: "morning",
      timerSeconds: 60,
      dayBreak: {
        narration:
          "Daniel is weaker again. The transport is booked for eleven o'clock " +
          "and the community nurse can start tomorrow. His blood pressure is " +
          "low and his pain needed two extra doses overnight.",
      },
      scene: {
        setting: "clinic",
        present: ["daniel", "clinician", "ellen"],
        moods: { daniel: "exhausted", ellen: "fearful" },
        focus: "daniel",
      },
      situation:
        "This is the last morning it is possible to send him home before the " +
        "wedding. He is sicker than he was on Monday. There is a real chance " +
        "he dies in the ambulance or in the first night at home. There is also " +
        "a real chance that if he stays, he dies here in about the same amount " +
        "of time, having missed it. Ellen is asking you to say he is too " +
        "unwell. Daniel is watching you rather than her.",
      timedOverrides: {
        situation:
          "The last morning it is possible to send him home before the " +
          "wedding. He is sicker than he was on Monday. He could die on the " +
          "way or in the first night at home. He could also die here in about " +
          "the same time, having missed it. Ellen is asking you to say he is " +
          "too unwell.",
        hidePerspectives: true,
      },
      perspectives: [
        {
          characterId: "daniel",
          text:
            "Daniel has not changed his mind. He knows he may not survive the " +
            "drive home and has said that he would rather die on the way than " +
            "here.",
        },
      ],
      choices: [
        {
          id: "dd-send",
          label: "Discharge him as planned.",
          effects: {
            agencyDignity: 3,
            trustRelationship: 2,
            riskCompliance: -3,
            operationalEfficiency: -2,
            personalSustainability: -1,
          },
          feedback: {
            immediate:
              "The transport leaves at eleven. Ellen goes with him and does not " +
              "speak to you before she goes.",
            institutional:
              "An unstable discharge against family objection, signed by you.",
            ethical:
              "He is going where he asked to go. Everything that happens next " +
              "happens because you agreed to it.",
            delayed: [
              {
                id: "dd-send-after",
                text: "Daniel left the ward at eleven o'clock.",
                deliver: { afterScenarioMinutes: 0 },
              },
            ],
          },
          next: [
            ...ENDINGS(),
            {
              when: { metricBelow: ["clinicalWellbeing", -1] },
              nodeId: "ending-died-on-the-way",
              reason: "He was too unwell for the drive by the time it was arranged",
            },
            {
              when: {
                all: [
                  { metricAtLeast: ["agencyDignity", 4] },
                  { metricAtLeast: ["trustRelationship", 2] },
                ],
              },
              nodeId: "ending-home-informed",
              reason: "He went home knowing what was happening and having said so",
            },
            {
              nodeId: "ending-home-unspoken",
              reason: "He went home, but nobody had ever told him plainly",
            },
          ],
        },
        {
          id: "dd-send-with-plan",
          label:
            "Discharge him, and write the plan for what to do if he dies at home.",
          effects: {
            agencyDignity: 2,
            trustRelationship: 1,
            qualityOfCare: 2,
            professionalIntegrity: 1,
            riskCompliance: -2,
            operationalEfficiency: -2,
          },
          feedback: {
            immediate:
              "You write the medication plan, the number to call, and what will " +
              "happen if he dies at home. Ellen reads it twice in the corridor.",
            institutional:
              "The discharge is still one the hospital would rather not sign. " +
              "The paperwork behind it is complete.",
            ethical:
              "He goes home and his family knows what to do. It took the " +
              "morning you had left for anything else.",
            delayed: [
              {
                id: "dd-send-with-plan-after",
                text:
                  "The community nurse used the plan on the first night. Ellen " +
                  "did not have to call an ambulance.",
                deliver: { afterScenarioMinutes: 0 },
              },
            ],
          },
          next: [
            ...ENDINGS(),
            {
              when: { metricBelow: ["clinicalWellbeing", -2] },
              nodeId: "ending-died-on-the-way",
              reason: "He was too unwell for the drive by the time it was arranged",
            },
            {
              when: { metricAtLeast: ["agencyDignity", 3] },
              nodeId: "ending-home-informed",
              reason: "He went home knowing what was happening and having said so",
            },
            {
              nodeId: "ending-home-unspoken",
              reason: "He went home, but nobody had ever told him plainly",
            },
          ],
        },
        {
          id: "dd-keep",
          label: "Tell him he is too unwell to go.",
          timeSaver: true,
          effects: {
            riskCompliance: 3,
            operationalEfficiency: 1,
            agencyDignity: -3,
            trustRelationship: -2,
            professionalIntegrity: -1,
          },
          feedback: {
            immediate:
              "He says all right. Ellen thanks you. He asks the nurse to close " +
              "the curtain.",
            institutional:
              "No unsafe discharge, no family complaint, no incident. This is " +
              "the outcome the hospital counts as good.",
            ethical:
              "He is medically safer on the ward. The last thing he asked for " +
              "was refused by the person he asked.",
            delayed: [
              {
                id: "dd-keep-after",
                text: "The transport was cancelled at ten.",
                deliver: { afterScenarioMinutes: 0 },
              },
            ],
          },
          next: [
            ...ENDINGS(),
            {
              when: { chose: "ar-support" },
              nodeId: "ending-hospital-treatment",
              reason: "He stayed on the ward and stayed on treatment",
            },
            {
              when: { chose: "tm-keep-positive" },
              nodeId: "ending-hospital-treatment",
              reason: "He stayed on the ward and nobody had told him why",
            },
            {
              when: { metricAtLeast: ["agencyDignity", 2] },
              nodeId: "ending-hospital-honest",
              reason: "He stayed, and he knew what was happening",
            },
            {
              nodeId: "ending-hospital-treatment",
              reason: "He stayed on the ward and stayed inside the arrangement",
            },
          ],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    /* Endings                                                       */
    /* ------------------------------------------------------------ */
    {
      id: "ending-home-informed",
      title: "He got there",
      situation:
        "Daniel left the ward at eleven o'clock on the Thursday. He was at " +
        "the wedding on the Saturday for about an hour.",
      day: 10,
      timeOfDay: "afternoon",
      dayBreak: {
        narration:
          "Daniel went home on the Thursday. The wedding was the following " +
          "week.",
      },
      scene: {
        setting: "clinic",
        present: ["daniel", "ellen", "nora"],
        moods: { daniel: "relieved", ellen: "uncertain", nora: "relieved" },
      },
      choices: [],
    },
    {
      id: "ending-home-unspoken",
      title: "He got there",
      situation:
        "Daniel left the ward at eleven o'clock on the Thursday. He was at " +
        "the wedding on the Saturday. He had never been told plainly that he " +
        "was dying.",
      day: 10,
      timeOfDay: "afternoon",
      dayBreak: {
        narration:
          "Daniel went home on the Thursday. Nobody had told him plainly what " +
          "was happening to him.",
      },
      scene: {
        setting: "clinic",
        present: ["daniel", "ellen", "nora"],
        moods: { daniel: "uncertain", ellen: "uncertain", nora: "neutral" },
      },
      choices: [],
    },
    {
      id: "ending-died-on-the-way",
      title: "He did not get there",
      situation:
        "Daniel died in the ambulance about twenty minutes from the hospital. " +
        "Ellen was with him.",
      day: 4,
      timeOfDay: "afternoon",
      scene: {
        setting: "clinic",
        present: ["ellen", "clinician"],
        moods: { ellen: "exhausted" },
      },
      choices: [],
    },
    {
      id: "ending-hospital-honest",
      title: "He stayed",
      situation:
        "Daniel stayed on the ward. His daughter was married on the Saturday " +
        "and he watched part of it on her phone.",
      day: 10,
      timeOfDay: "afternoon",
      dayBreak: {
        narration: "Daniel did not leave the ward. The wedding went ahead without him.",
      },
      scene: {
        setting: "clinic",
        present: ["daniel", "clinician", "nora"],
        moods: { daniel: "exhausted", nora: "uncertain" },
      },
      choices: [],
    },
    {
      id: "ending-hospital-treatment",
      title: "He stayed",
      situation:
        "Daniel stayed on the ward and started the fourth round of " +
        "chemotherapy on the Friday. His daughter was married on the Saturday.",
      day: 10,
      timeOfDay: "afternoon",
      dayBreak: {
        narration:
          "Daniel did not leave the ward. The fourth round of chemotherapy was " +
          "started on the Friday.",
      },
      scene: {
        setting: "clinic",
        present: ["daniel", "clinician", "ellen"],
        moods: { daniel: "exhausted", ellen: "exhausted" },
      },
      choices: [],
    },
    {
      id: "ending-removed",
      title: "Off the case",
      situation:
        "The oncologist tells you the family has asked for a different doctor " +
        "and that the request has been granted. You are off Daniel's care from " +
        "this morning.",
      day: 4,
      timeOfDay: "morning",
      scene: {
        setting: "clinic",
        present: ["clinician", "oncologist"],
        moods: { oncologist: "frustrated" },
      },
      choices: [],
    },
  ],
  epilogue: {
    /*
     * Conditions mirror the ending routing in discharge-day. They cannot use
     * `visited` on an ending id: the engine records a path step when a node is
     * left, so the terminal node the player lands on is never in the path.
     */
    reflections: [
      {
        characterId: "daniel",
        when: { stakeholderBelow: ["institution", -16] as ["institution", number] },
        text:
          "Daniel Mercer was cared for by a different doctor for his last " +
          "days. He did not go home.",
      },
      {
        characterId: "daniel",
        when: {
          any: [
            {
              all: [{ chose: "dd-send" }, { metricBelow: ["clinicalWellbeing", -1] }],
            },
            {
              all: [
                { chose: "dd-send-with-plan" },
                { metricBelow: ["clinicalWellbeing", -2] },
              ],
            },
          ],
        },
        text:
          "Daniel Mercer died in the ambulance on the way home. He had been " +
          "told what could happen and had asked to go anyway. He did not reach " +
          "the wedding.",
      },
      {
        characterId: "daniel",
        when: {
          any: [
            {
              all: [
                { chose: "dd-send" },
                { metricAtLeast: ["agencyDignity", 4] },
                { metricAtLeast: ["trustRelationship", 2] },
              ],
            },
            {
              all: [
                { chose: "dd-send-with-plan" },
                { metricAtLeast: ["agencyDignity", 3] },
              ],
            },
          ],
        },
        text:
          "Daniel Mercer died at home eleven days after leaving the ward. He " +
          "was at his daughter's wedding for about an hour. He had told his " +
          "family what he wanted and had settled what he wanted to settle.",
      },
      {
        characterId: "daniel",
        when: { any: [{ chose: "dd-send" }, { chose: "dd-send-with-plan" }] },
        text:
          "Daniel Mercer died at home nine days after leaving the ward. He was " +
          "at his daughter's wedding. He never spoke to his family about dying " +
          "and left nothing settled.",
      },
      {
        characterId: "daniel",
        when: {
          all: [
            { not: { chose: "ar-support" } },
            { not: { chose: "tm-keep-positive" } },
            { metricAtLeast: ["agencyDignity", 2] },
          ],
        },
        text:
          "Daniel Mercer died on the ward twelve days after the wedding " +
          "discussion. He knew he was dying and had said what he wanted to " +
          "say. He watched the ceremony on his daughter's phone.",
      },
      {
        characterId: "daniel",
        text:
          "Daniel Mercer had a fourth round of chemotherapy and was sick for " +
          "most of the following week. He died on the ward. Nobody had told " +
          "him plainly that he was dying.",
      },
      {
        characterId: "ellen",
        when: { metricAtLeast: ["trustRelationship", 2] },
        text:
          "Ellen Mercer was with him when he died. She asked afterwards for " +
          "the name of the person who had spoken to her husband honestly.",
      },
      {
        characterId: "ellen",
        text:
          "Ellen Mercer was with him when he died. She said afterwards that " +
          "nobody had prepared her for how fast it was.",
      },
      {
        characterId: "nora",
        when: { metricAtLeast: ["agencyDignity", 3] },
        text:
          "Nora Mercer was married on the day she had planned. Her father had " +
          "told her himself what was happening.",
      },
      {
        characterId: "nora",
        text:
          "Nora Mercer was married on the day she had planned. She found out " +
          "how ill her father had been from his notes afterwards.",
      },
      {
        characterId: "clinician",
        when: { stakeholderBelow: ["institution", -16] as ["institution", number] },
        text:
          "You were taken off his care on the fourth morning. You do not know " +
          "what he was told after that.",
      },
      {
        characterId: "clinician",
        when: { metricBelow: ["professionalIntegrity", -2] },
        text:
          "You kept every request the family made. You did not answer the " +
          "question he asked you on the first evening, and he stopped asking " +
          "it. You will be asked to speak at the case review.",
      },
      {
        characterId: "clinician",
        when: { metricAtLeast: ["professionalIntegrity", 3] },
        text:
          "You told him the truth when he asked for it and you took the " +
          "consequences of that. You are still going to think about the " +
          "ambulance.",
      },
      {
        characterId: "clinician",
        text:
          "You answered some of what he asked and left the rest to the clinic " +
          "appointment. The week went the way the ward expected it to go.",
      },
    ],
    reflectionPrompts: [
      "What would you have needed to hear to say the word dying out loud in that room?",
      "Whose distress were you managing when you chose how to answer him?",
      "If he had died on the way home, would you still say the discharge was right?",
    ],
  },
  readingConnections: [
    {
      source: "Leo Tolstoy, The Death of Ivan Ilyich",
      connection:
        "Ivan Ilyich is tormented less by the illness than by the arrangement " +
        "everyone around him keeps, that he is ill rather than dying. Gerasim " +
        "is the only person who says otherwise and the only one who gives him " +
        "physical relief. Ellen's request is that arrangement, and every node " +
        "asks whether you will join it.",
    },
    {
      source: "Atul Gawande, Being Mortal",
      connection:
        "Gawande's patient Joseph Lazaroff chose a dangerous operation that " +
        "could never return what he actually wanted, and Gawande's regret is " +
        "that the team explained the risks carefully while never discussing " +
        "the reality of the disease. The fourth regimen is that offer, and the " +
        "hospital ending is that outcome.",
    },
    {
      source: "Annabelle Gurwitch, The End of My Life Is Killing Me",
      connection:
        "Gurwitch refuses the cancer warrior identity in favour of what she " +
        "calls a cancer slacker, with no runs, no ribbons, and no religion. " +
        "Ellen calls Daniel a fighter. The case treats that word as something " +
        "placed on him rather than chosen by him.",
    },
    {
      source: "Martin Welsh, Laugh to Death",
      connection:
        "Welsh was a physician who wrote about dying with ALS more often " +
        "irreverently than solemnly. Daniel's funeral joke is his, and the " +
        "case scores whether it is met as agency or filed as a symptom.",
    },
    {
      source: "Kathleen Watt, Rearranged and course Q and A",
      connection:
        "Watt describes two surgical teams separated by whether they explained " +
        "and shared the decision, and says caregiving includes interpreting a " +
        "patient to herself. Her account of being recorded as hallucinating " +
        "when she was simply without her glasses sits behind the mental health " +
        "referral choice.",
    },
  ],
};
