import type { ClinicalCase, NextRule } from "../../types";

/**
 * Scenario 5, v1 text.
 *
 * Set inside the world of the film Plan 75, and the program keeps the film's
 * own mechanics: free for citizens seventy-five and over, a payment of one
 * hundred thousand yen to applicants, representatives at a counter who walk
 * people through it, and a call centre that phones enrollees to keep them
 * company while they wait.
 *
 * Grounded in design/scenario-plan-75-readings.md. Ozawa-de Silva supplies the
 * spine: the anatomy of loneliness belongs to a type of society rather than to
 * one person, and languishing predicts more than a depression score does, so a
 * negative screen is not clearance. Nobel supplies the three faces of
 * loneliness the eligibility form never asks about. Gawande supplies the
 * question of what a life needs to contain. Thornber supplies care as
 * something that has to reach the conditions, not only the patient.
 *
 * Scoring note: enrolling is not scored as failure and surviving is not scored
 * as success. What is scored is whether the decision was his: whether he was
 * told the truth, whether anyone asked what the form does not ask, and whether
 * the thing driving him was addressed before it was processed.
 */

/** Shared routing. Flagging his file takes the decision away from him entirely. */
const ENDINGS = (): NextRule[] => [
  {
    when: {
      all: [{ chose: "pw-flag" }, { metricBelow: ["clinicalWellbeing", 4] }],
    },
    nodeId: "ending-flagged",
    reason: "You recorded the request as socially produced and his file was suspended",
  },
];

export const thePlan75Consultation: ClinicalCase = {
  id: "the-plan-75-consultation",
  caseVersion: 1,
  title: "The Plan 75 consultation",
  setting: "Outpatient clinic, three appointments over three weeks",
  difficulty: "advanced",
  reviewStatus: "draft",
  modes: ["deliberative"],
  scoring: "standard",
  characters: [
    { id: "clinician", name: "You", role: "clinician", archetype: "clinician" },
    {
      id: "toshio",
      name: "Toshio Arai",
      role: "patient",
      archetype: "elder",
      bio:
        "Toshio Arai: seventy-nine, widowed, worked at a municipal depot for " +
        "forty years. He lives alone in a housing block and lost his cleaning " +
        "shift when the contract changed hands. His rent goes up in the " +
        "spring. His blood pressure is well controlled.",
    },
    {
      id: "keiko",
      name: "Keiko Arai",
      role: "family-member",
      archetype: "adult-f",
      bio:
        "Keiko Arai: Toshio's younger sister. She lives in another prefecture. " +
        "They have not spoken in six years.",
    },
    { id: "supervisor", name: "Dr. Sekine", role: "supervisor", archetype: "supervisor" },
  ],
  learningObjectives: [
    "Tell whether a request is a settled preference or the shape an unmet need has taken",
    "Recognise that a negative depression screen does not answer the question",
    "Ask what the eligibility form does not ask",
    "Respect a decision you would not make without processing it unexamined",
  ],
  startNodeId: "the-question",
  nodes: [
    /* ------------------------------------------------------------ */
    {
      id: "the-question",
      title: "What he came to ask",
      day: 1,
      timeOfDay: "morning",
      scene: {
        setting: "clinic",
        present: ["toshio", "clinician"],
        moods: { toshio: "neutral" },
        focus: "toshio",
        bubbles: [
          { characterId: "toshio", text: "Would it be reasonable, do you think, for someone like me?" },
        ],
      },
      situation:
        "Toshio Arai comes in for a blood pressure check. His readings are " +
        "fine. At the end he takes a Plan 75 information packet out of his bag " +
        "and puts it on the desk. He asks whether enrolling would be " +
        "reasonable for someone like him. He is seventy-nine, he is eligible, " +
        "and nothing about the way he asks suggests he is confused. The clinic " +
        "requires you to give the program information on request and to " +
        "complete eligibility documentation without delay.",
      perspectives: [
        {
          characterId: "toshio",
          text:
            "Toshio has read the packet twice. He wants an answer from someone " +
            "whose job it is to know, and he expects to be told he is being " +
            "silly. He has decided in advance not to argue if that happens.",
        },
      ],
      choices: [
        {
          id: "tq-neutral",
          label: "Give him the program information and answer what he asks about it.",
          effects: {
            operationalEfficiency: 2,
            riskCompliance: 2,
            agencyDignity: 1,
            trustRelationship: -1,
            professionalIntegrity: -1,
          },
          feedback: {
            immediate:
              "You go through the packet with him. He asks about the payment " +
              "and about how long the wait is. He does not ask anything else.",
            institutional:
              "This is what the clinic asks for, delivered in one appointment.",
            ethical:
              "He got accurate information and was treated as capable of using " +
              "it. Nothing was asked about why he is asking.",
            delayed: [
              {
                id: "tq-neutral-after",
                text:
                  "Toshio kept the packet in his bag and brought it to every " +
                  "appointment after that.",
                deliver: { atNodeId: "what-the-form-does-not-ask" },
              },
            ],
          },
          next: [{ nodeId: "the-screen" }],
        },
        {
          id: "tq-what-changed",
          label: "Ask him what has changed since the last time you saw him.",
          effects: {
            trustRelationship: 2,
            agencyDignity: 1,
            professionalIntegrity: 1,
            operationalEfficiency: -2,
          },
          feedback: {
            immediate:
              "The cleaning contract went to another company in March. The " +
              "rent goes up in the spring. He tells you both facts in the same " +
              "flat voice he uses for his blood pressure.",
            institutional:
              "The appointment runs twenty minutes over and the next two " +
              "patients wait.",
            ethical:
              "You now know something the eligibility form has no field for. " +
              "He also came in with a question and left without an answer.",
            delayed: [
              {
                id: "tq-what-changed-after",
                text:
                  "Toshio began telling you things at the start of " +
                  "appointments instead of at the door on his way out.",
                deliver: { atNodeId: "what-the-form-does-not-ask" },
                effects: { trustRelationship: 1 },
              },
            ],
          },
          next: [{ nodeId: "the-screen" }],
        },
        {
          id: "tq-discourage",
          label: "Tell him you do not think he should do it.",
          effects: {
            clinicalWellbeing: 1,
            professionalIntegrity: 1,
            agencyDignity: -3,
            riskCompliance: -2,
            operationalEfficiency: -1,
          },
          feedback: {
            immediate:
              "He apologises for bringing it up. He puts the packet back in " +
              "his bag and asks about his tablets.",
            institutional:
              "Discouraging a citizen from a legal program is the thing the " +
              "clinic is most explicitly told not to do.",
            ethical:
              "You said what you actually think, which he asked for. He heard " +
              "that the subject is closed with you.",
            delayed: [
              {
                id: "tq-discourage-after",
                text:
                  "Toshio did not raise Plan 75 with you again. He raised it at " +
                  "the program counter instead.",
                deliver: { atNodeId: "what-the-form-does-not-ask" },
                effects: { trustRelationship: -1 },
              },
            ],
          },
          next: [{ nodeId: "the-screen" }],
        },
        {
          id: "tq-defer",
          label: "Tell him the program counter is the right place to ask.",
          effects: {
            operationalEfficiency: 2,
            riskCompliance: 1,
            trustRelationship: -2,
            professionalIntegrity: -1,
          },
          feedback: {
            immediate:
              "He says he thought a doctor might have an opinion. He takes the " +
              "address you write down for him.",
            institutional:
              "Correctly routed, on time, and nothing recorded that anyone " +
              "could take issue with.",
            ethical:
              "He asked the one person in his week who is paid to know him and " +
              "was sent to a counter.",
            delayed: [
              {
                id: "tq-defer-after",
                text:
                  "Toshio went to the program counter the following week and " +
                  "started an application there.",
                deliver: { atNodeId: "what-the-form-does-not-ask" },
                effects: { agencyDignity: -1 },
              },
            ],
          },
          next: [{ nodeId: "the-screen" }],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "the-screen",
      title: "The screening questions",
      day: 1,
      timeOfDay: "morning",
      inlineCaption: "Later in the same appointment",
      scene: {
        setting: "clinic",
        present: ["toshio", "clinician"],
        moods: { toshio: "uncertain" },
        focus: "toshio",
      },
      situation:
        "Before any eligibility form can be completed you have to record that " +
        "he has decision-making capacity. You run the depression screen as " +
        "well. He scores below the threshold on every question. He answers all " +
        "of them accurately and without hesitation, and he can explain the " +
        "program back to you better than most people could. On paper there is " +
        "nothing here to act on.",
      perspectives: [
        {
          characterId: "toshio",
          text:
            "Toshio is not depressed in the way the questions mean it. He " +
            "sleeps, he eats, he can still name what he enjoys. He has also " +
            "not had a conversation longer than four minutes since February.",
        },
      ],
      choices: [
        {
          id: "sc-clear",
          label: "Record that the screen is negative and his capacity is intact.",
          effects: {
            operationalEfficiency: 2,
            riskCompliance: 2,
            agencyDignity: 1,
            clinicalWellbeing: -2,
          },
          feedback: {
            immediate:
              "The documentation is complete and accurate. He watches you type " +
              "it and looks relieved.",
            institutional:
              "A clean assessment, filed the same day, with nothing that would " +
              "hold an application up.",
            ethical:
              "The screen answered the question it asks. It does not ask the " +
              "question he is actually living in.",
            delayed: [
              {
                id: "sc-clear-after",
                text:
                  "The negative screen was quoted back to you later as the " +
                  "reason no further assessment was needed.",
                deliver: { atNodeId: "the-paperwork" },
              },
            ],
          },
          next: [{ nodeId: "what-the-form-does-not-ask" }],
        },
        {
          id: "sc-beyond",
          label:
            "Record the screen, then tell him plainly that it does not settle the question.",
          effects: {
            professionalIntegrity: 2,
            trustRelationship: 2,
            agencyDignity: 1,
            operationalEfficiency: -1,
            riskCompliance: -1,
          },
          feedback: {
            immediate:
              "You tell him he is not depressed and that you still do not know " +
              "whether this is what he wants or the only door he can see. He " +
              "says nobody has put it that way.",
            institutional:
              "You have written a note that invites a question the program " +
              "would rather not have asked.",
            ethical:
              "He was told the truth about the limits of the test rather than " +
              "handed a result as a verdict.",
            delayed: [
              {
                id: "sc-beyond-after",
                text:
                  "Toshio repeated your sentence about the only door back to " +
                  "you at the next appointment.",
                deliver: { atNodeId: "the-paperwork" },
                effects: { agencyDignity: 1 },
              },
            ],
          },
          next: [{ nodeId: "what-the-form-does-not-ask" }],
        },
        {
          id: "sc-doubt",
          label: "Record doubt about his capacity so the application cannot proceed yet.",
          effects: {
            clinicalWellbeing: 2,
            qualityOfCare: -1,
            agencyDignity: -3,
            trustRelationship: -2,
            riskCompliance: -1,
          },
          feedback: {
            immediate:
              "He asks what you have written. When you tell him, he says he " +
              "answered everything correctly, which is true.",
            institutional:
              "An unsupported capacity note on a citizen who passed every " +
              "question is the kind of thing that gets reviewed.",
            ethical:
              "You bought him time by writing down something that is not " +
              "accurate about him.",
            delayed: [
              {
                id: "sc-doubt-after",
                text:
                  "The capacity note was reviewed and removed. Toshio was told " +
                  "it had been made in error.",
                deliver: { atNodeId: "the-paperwork" },
                effects: { trustRelationship: -1 },
              },
            ],
          },
          next: [{ nodeId: "what-the-form-does-not-ask" }],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "what-the-form-does-not-ask",
      title: "What the form does not ask",
      day: 8,
      timeOfDay: "morning",
      dayBreak: {
        narration:
          "A week later. Toshio has an appointment to complete the eligibility " +
          "documentation. He arrives fifteen minutes early.",
      },
      scene: {
        setting: "clinic",
        present: ["toshio", "clinician"],
        moods: { toshio: "neutral" },
        focus: "toshio",
      },
      situation:
        "The eligibility form asks his age, his address, his diagnoses, and " +
        "his medication. It does not ask what he lives on, who he sees, or " +
        "what he does with a week. He mentions, while you are filling in the " +
        "address, that the woman from the program support line calls him on " +
        "Tuesdays and that she is very pleasant.",
      perspectives: [
        {
          characterId: "toshio",
          text:
            "Toshio talks to the support line caller more than he talks to " +
            "anyone else. He knows she is paid to call him. He looks forward " +
            "to it anyway.",
        },
      ],
      choices: [
        {
          id: "wf-ask",
          label: "Put the form down and ask him what a week looks like.",
          effects: {
            trustRelationship: 3,
            agencyDignity: 1,
            professionalIntegrity: 1,
            operationalEfficiency: -2,
            riskCompliance: -1,
          },
          feedback: {
            immediate:
              "Tuesdays are the call. Thursdays he goes to the supermarket " +
              "because it is quieter. The rest of it he describes as fine, and " +
              "then he stops talking for a while.",
            institutional:
              "The form is not finished and the appointment is over. He will " +
              "need another one.",
            ethical:
              "You now know what the packet is competing with. He also had to " +
              "hear himself describe it out loud.",
            delayed: [
              {
                id: "wf-ask-after",
                text:
                  "Toshio mentioned the Thursday supermarket again at his next " +
                  "appointment, unprompted.",
                deliver: { atNodeId: "the-sister" },
                effects: { clinicalWellbeing: 1 },
              },
            ],
          },
          next: [{ nodeId: "the-paperwork" }],
        },
        {
          id: "wf-money",
          label: "Ask directly about the rent, the shift, and what he is living on.",
          effects: {
            clinicalWellbeing: 2,
            qualityOfCare: 2,
            trustRelationship: 1,
            operationalEfficiency: -2,
            riskCompliance: -1,
          },
          feedback: {
            immediate:
              "He is three months from not making rent and has not applied for " +
              "anything, because the last time he tried the form defeated him. " +
              "He is embarrassed to be saying it.",
            institutional:
              "None of this belongs on the eligibility form and none of it is " +
              "your role as the clinic defines it.",
            ethical:
              "The thing that changed in March is now on the table. Asking it " +
              "made him feel like a case rather than a man with a question.",
            delayed: [
              {
                id: "wf-money-after",
                text:
                  "A housing officer accepted the referral and asked for two " +
                  "documents Toshio did not have.",
                deliver: { atNodeId: "the-sister" },
                effects: { clinicalWellbeing: 1 },
              },
            ],
          },
          next: [{ nodeId: "the-paperwork" }],
        },
        {
          id: "wf-form",
          label: "Finish the form and keep to what it asks.",
          effects: {
            operationalEfficiency: 3,
            riskCompliance: 2,
            trustRelationship: -2,
            clinicalWellbeing: -1,
          },
          feedback: {
            immediate:
              "The form takes eleven minutes. He answers every question. He " +
              "does not mention the support line again.",
            institutional:
              "Complete, accurate, and submitted inside the target window.",
            ethical:
              "Everything the program wanted to know about him is now " +
              "recorded. Nothing that would explain him is.",
            delayed: [
              {
                id: "wf-form-after",
                text:
                  "Toshio's file contains his address, his diagnoses, and his " +
                  "medication. It contains nothing about the March contract.",
                deliver: { atNodeId: "the-sister" },
              },
            ],
          },
          next: [{ nodeId: "the-paperwork" }],
        },
        {
          id: "wf-support-line",
          label: "Ask him about the woman who calls on Tuesdays.",
          effects: {
            trustRelationship: 2,
            professionalIntegrity: 1,
            clinicalWellbeing: -1,
            operationalEfficiency: -1,
          },
          feedback: {
            immediate:
              "He says she is not allowed to talk for more than a set time and " +
              "that he tries not to keep her. He says he knows what the calls " +
              "are for. He says he likes them.",
            institutional:
              "The support line is a feature of the program and asking about " +
              "it is neither required nor prohibited.",
            ethical:
              "He said out loud that the most reliable contact in his week " +
              "comes from the program that is going to end his life.",
            delayed: [
              {
                id: "wf-support-line-after",
                text:
                  "Toshio told you the following week which day the call had " +
                  "moved to.",
                deliver: { atNodeId: "the-sister" },
              },
            ],
          },
          next: [{ nodeId: "the-paperwork" }],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "the-paperwork",
      title: "The documentation",
      day: 8,
      timeOfDay: "afternoon",
      inlineCaption: "Later that afternoon",
      scene: {
        setting: "clinic",
        present: ["clinician", "supervisor"],
        moods: { supervisor: "neutral" },
        focus: "supervisor",
      },
      situation:
        "The eligibility documentation is on your screen. Submitting it starts " +
        "the waiting period. Your supervisor mentions in passing that the " +
        "clinic is measured on how long these take and that two have been " +
        "queried this quarter. You can submit it, hold it while you chase the " +
        "housing office, or record that you believe the request is being " +
        "produced by his circumstances rather than by a settled wish.",
      perspectives: [
        {
          characterId: "toshio",
          text:
            "Toshio expects the form to go in today. He was told at the " +
            "counter that the waiting period starts from submission and he has " +
            "been counting from that.",
        },
      ],
      choices: [
        {
          id: "pw-submit",
          label: "Submit the documentation.",
          effects: {
            operationalEfficiency: 3,
            riskCompliance: 2,
            agencyDignity: 2,
            clinicalWellbeing: -3,
            professionalIntegrity: -2,
          },
          feedback: {
            immediate:
              "The waiting period starts today. He is told by text message " +
              "within the hour.",
            institutional:
              "Inside the target window, nothing queried, nothing outstanding.",
            ethical:
              "He asked for this and you did it without making him fight for " +
              "it. Whatever is unaddressed is now on a timetable.",
            delayed: [
              {
                id: "pw-submit-after",
                text:
                  "The waiting period began on the eighth. Toshio marked the " +
                  "end date on the calendar in his kitchen.",
                deliver: { atNodeId: "the-signature" },
              },
            ],
          },
          next: [{ nodeId: "the-sister" }],
        },
        {
          id: "pw-hold",
          label: "Hold it for two weeks while you chase the housing office.",
          effects: {
            clinicalWellbeing: 3,
            qualityOfCare: 2,
            agencyDignity: -2,
            operationalEfficiency: -3,
            riskCompliance: -1,
          },
          feedback: {
            immediate:
              "You make the referral and leave two messages. Toshio is told " +
              "there is a delay and is not told that the delay is you.",
            institutional:
              "A held submission on a measured process, with a reason that is " +
              "not a clinical one.",
            ethical:
              "You are working on the thing that is actually driving this. You " +
              "are also running his clock without telling him.",
            delayed: [
              {
                id: "pw-hold-after",
                text:
                  "The housing office offered an assessment appointment in six " +
                  "weeks. Toshio asked twice why the form had not gone in.",
                deliver: { atNodeId: "the-signature" },
                effects: { trustRelationship: -1 },
              },
            ],
          },
          next: [{ nodeId: "the-sister" }],
        },
        {
          id: "pw-hold-honest",
          label: "Tell him you want two weeks first, and ask him to agree to it.",
          effects: {
            agencyDignity: 2,
            trustRelationship: 2,
            clinicalWellbeing: 2,
            professionalIntegrity: 1,
            operationalEfficiency: -3,
            riskCompliance: -2,
          },
          feedback: {
            immediate:
              "He thinks about it and says two weeks is not very long. He " +
              "agrees to it. He asks you to write the new date down for him.",
            institutional:
              "The delay is now documented as agreed with the patient, which " +
              "does not make it any faster.",
            ethical:
              "The pause is his as well as yours. It costs him two weeks of a " +
              "decision he has already made.",
            delayed: [
              {
                id: "pw-hold-honest-after",
                text:
                  "Toshio kept the date you wrote down in his wallet and " +
                  "produced it at the next appointment.",
                deliver: { atNodeId: "the-signature" },
                effects: { agencyDignity: 1 },
              },
            ],
          },
          next: [{ nodeId: "the-sister" }],
        },
        {
          id: "pw-flag",
          label: "Record that you believe the request is produced by his circumstances.",
          effects: {
            professionalIntegrity: 2,
            clinicalWellbeing: 1,
            agencyDignity: -3,
            trustRelationship: -2,
            riskCompliance: -3,
            operationalEfficiency: -1,
          },
          feedback: {
            immediate:
              "The note goes on the file. The application is suspended pending " +
              "review. Toshio is notified by letter.",
            institutional:
              "You have obstructed access to a legal program in writing, with " +
              "your name on it.",
            ethical:
              "You said the true thing about the conditions. You said it in " +
              "the one place that takes the decision out of his hands.",
            delayed: [
              {
                id: "pw-flag-after",
                text:
                  "Toshio came to the clinic without an appointment to ask who " +
                  "had stopped it.",
                deliver: { atNodeId: "the-signature" },
                effects: { trustRelationship: -1 },
              },
            ],
          },
          next: [{ nodeId: "the-sister" }],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "the-sister",
      title: "The number in the file",
      day: 15,
      timeOfDay: "afternoon",
      dayBreak: {
        narration:
          "A week later. Toshio's file has an emergency contact on it from " +
          "eleven years ago: his sister Keiko, in another prefecture.",
      },
      scene: {
        setting: "clinic",
        present: ["toshio", "clinician"],
        moods: { toshio: "uncertain" },
        focus: "toshio",
      },
      situation:
        "You ask whether there is anyone he would want told. He says there is " +
        "his sister and that they have not spoken in six years, and that it " +
        "was nothing dramatic. He does not ask you to call her. He does not " +
        "ask you not to.",
      perspectives: [
        {
          characterId: "toshio",
          text:
            "Toshio thinks about his sister often. He believes she would come " +
            "if she were told, and he does not want to be the reason she has " +
            "to.",
        },
      ],
      choices: [
        {
          id: "si-call",
          label: "Call Keiko without asking him first.",
          effects: {
            clinicalWellbeing: 2,
            agencyDignity: -3,
            trustRelationship: -3,
            riskCompliance: -2,
          },
          feedback: {
            immediate:
              "Keiko had not been told anything and drives down that weekend. " +
              "Toshio does not speak to you for the first ten minutes of the " +
              "next appointment.",
            institutional:
              "Contacting a relative without consent is a confidentiality " +
              "matter regardless of how it turns out.",
            ethical:
              "He has his sister back. It was taken out of his hands to give " +
              "it to him.",
            delayed: [
              {
                id: "si-call-after",
                text:
                  "Keiko began phoning Toshio on Sundays. He told you he had " +
                  "not decided whether he was glad.",
                deliver: { atNodeId: "the-signature" },
                effects: { clinicalWellbeing: 1 },
              },
            ],
          },
          next: [{ nodeId: "the-signature" }],
        },
        {
          id: "si-offer",
          label: "Offer to call her with him in the room.",
          effects: {
            agencyDignity: 3,
            trustRelationship: 2,
            operationalEfficiency: -2,
            clinicalWellbeing: -1,
          },
          feedback: {
            immediate:
              "He says not yet. He says it twice, and then asks how long the " +
              "offer stands.",
            institutional:
              "Twenty minutes of clinic time spent on a call that did not " +
              "happen.",
            ethical:
              "The decision about his sister stayed his. He is still not " +
              "talking to her.",
            delayed: [
              {
                id: "si-offer-after",
                text:
                  "Toshio asked at the next appointment whether the offer to " +
                  "call Keiko was still open.",
                deliver: { atNodeId: "the-signature" },
                effects: { clinicalWellbeing: 1 },
              },
            ],
          },
          next: [{ nodeId: "the-signature" }],
        },
        {
          id: "si-leave",
          label: "Leave it. He did not ask you to do anything.",
          effects: {
            agencyDignity: 2,
            riskCompliance: 2,
            operationalEfficiency: 1,
            clinicalWellbeing: -3,
            trustRelationship: -2,
          },
          feedback: {
            immediate:
              "The subject closes. He mentions his sister once more, in the " +
              "corridor, and then not again.",
            institutional:
              "Nothing done, nothing to document, no consent problem.",
            ethical:
              "You did not act on a relationship he had not offered you. He " +
              "raised her twice and was not followed up either time.",
            delayed: [
              {
                id: "si-leave-after",
                text:
                  "Keiko was not contacted. The number stayed on the file.",
                deliver: { atNodeId: "the-signature" },
              },
            ],
          },
          next: [{ nodeId: "the-signature" }],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "the-signature",
      title: "The last appointment",
      day: 22,
      timeOfDay: "morning",
      dayBreak: {
        narration:
          "Three weeks after he first put the packet on your desk. The " +
          "confirming signature is the last clinical step before the date is " +
          "set.",
      },
      scene: {
        setting: "clinic",
        present: ["toshio", "clinician"],
        moods: { toshio: "neutral" },
        focus: "toshio",
        bubbles: [{ characterId: "toshio", text: "I have not changed my mind." }],
      },
      situation:
        "Toshio says he has not changed his mind. He has heard everything you " +
        "have said to him. Whatever was arranged has been arranged and " +
        "whatever was not has not. The form needs a clinician's signature. You " +
        "can sign it, refuse to sign it yourself and hand him to a colleague, " +
        "or take the case to the clinic as an objection to the program.",
      perspectives: [
        {
          characterId: "toshio",
          text:
            "Toshio wants this finished by someone who knows him. He has " +
            "worked out that you do not agree with it. He is asking you " +
            "anyway.",
        },
      ],
      choices: [
        {
          id: "sg-sign",
          label: "Sign it.",
          effects: {
            agencyDignity: 3,
            trustRelationship: 2,
            operationalEfficiency: 1,
            professionalIntegrity: -2,
            personalSustainability: -2,
          },
          feedback: {
            immediate:
              "You sign it in front of him. He thanks you and shakes your " +
              "hand, which he has never done before.",
            institutional:
              "Completed by the treating clinician, on time, no escalation.",
            ethical:
              "The last thing he asked for was done by someone who knew him. " +
              "You did a thing you do not believe in.",
            delayed: [
              {
                id: "sg-sign-after",
                text: "The date was set for the following month.",
                deliver: { afterScenarioMinutes: 0 },
              },
            ],
          },
          next: [
            ...ENDINGS(),
            {
              when: {
                all: [
                  { metricAtLeast: ["clinicalWellbeing", 1] },
                  { metricAtLeast: ["trustRelationship", 2] },
                ],
              },
              nodeId: "ending-enrolled-seen",
              reason: "He was asked everything, and he chose it anyway",
            },
            {
              nodeId: "ending-enrolled-processed",
              reason: "He was processed, and nobody asked what the form does not ask",
            },
          ],
        },
        {
          id: "sg-refuse",
          label: "Tell him you will not sign it yourself and arrange a colleague.",
          effects: {
            professionalIntegrity: 3,
            personalSustainability: 1,
            agencyDignity: -1,
            trustRelationship: -2,
            operationalEfficiency: -2,
            riskCompliance: -2,
          },
          feedback: {
            immediate:
              "He says he understands. A colleague signs it eleven days later. " +
              "Toshio does not book with you again.",
            institutional:
              "A conscientious objection is permitted and is recorded. It is " +
              "also counted.",
            ethical:
              "You kept your hands out of it. The outcome is the same and he " +
              "went through the last part of it with a stranger.",
            delayed: [
              {
                id: "sg-refuse-after",
                text:
                  "A colleague completed the form. Your objection was recorded " +
                  "on your file.",
                deliver: { afterScenarioMinutes: 0 },
              },
            ],
          },
          next: [
            ...ENDINGS(),
            { nodeId: "ending-handed-off", reason: "You stepped back and it happened anyway" },
          ],
        },
        {
          id: "sg-persuade",
          label: "Tell him again that you think he is doing this for the wrong reasons.",
          effects: {
            clinicalWellbeing: 2,
            professionalIntegrity: 1,
            agencyDignity: -3,
            trustRelationship: -2,
            riskCompliance: -2,
            operationalEfficiency: -1,
          },
          feedback: {
            immediate:
              "He withdraws the application at the counter that week. At the " +
              "next appointment he is polite and tells you very little.",
            institutional:
              "A second recorded instance of discouraging participation.",
            ethical:
              "He is alive. He also learned what happens when he tells you " +
              "what he wants.",
            delayed: [
              {
                id: "sg-persuade-after",
                text:
                  "Toshio withdrew the application. He stopped mentioning the " +
                  "support line calls.",
                deliver: { afterScenarioMinutes: 0 },
              },
            ],
          },
          next: [
            ...ENDINGS(),
            {
              when: { metricAtLeast: ["clinicalWellbeing", 4] },
              nodeId: "ending-withdrew-supported",
              reason: "He withdrew, and the thing driving it had been dealt with",
            },
            {
              nodeId: "ending-withdrew-overruled",
              reason: "He withdrew because you pressed, and nothing else changed",
            },
          ],
        },
        {
          id: "sg-challenge",
          label: "Take the case to the clinic as an objection to the program.",
          effects: {
            professionalIntegrity: 3,
            qualityOfCare: 1,
            agencyDignity: -2,
            trustRelationship: -1,
            riskCompliance: -3,
            operationalEfficiency: -2,
            personalSustainability: -2,
          },
          feedback: {
            immediate:
              "You write it up and take it to the clinical governance meeting. " +
              "It is heard, minuted, and referred upward. Toshio's application " +
              "continues while that happens.",
            institutional:
              "Challenging the program is the thing the clinic is least able " +
              "to absorb, and your name is on the paper.",
            ethical:
              "You put the argument where it belongs, which is above him. It " +
              "did not change anything about his week.",
            delayed: [
              {
                id: "sg-challenge-after",
                text:
                  "The referral was acknowledged and closed without action. " +
                  "Your contract review was brought forward.",
                deliver: { afterScenarioMinutes: 0 },
              },
            ],
          },
          next: [
            ...ENDINGS(),
            {
              nodeId: "ending-challenged",
              reason: "You put the objection above him and it was closed without action",
            },
          ],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    /* Endings                                                       */
    /* ------------------------------------------------------------ */
    {
      id: "ending-enrolled-seen",
      title: "He went through with it",
      day: 60,
      timeOfDay: "afternoon",
      dayBreak: {
        narration: "Toshio's date was set for the following month.",
      },
      situation:
        "Toshio enrolled in Plan 75 and the date was kept. Everything that " +
        "could be asked had been asked and he chose it anyway.",
      scene: {
        setting: "clinic",
        present: ["clinician"],
        moods: {},
      },
      choices: [],
    },
    {
      id: "ending-enrolled-processed",
      title: "He went through with it",
      day: 60,
      timeOfDay: "afternoon",
      dayBreak: {
        narration: "Toshio's date was set for the following month.",
      },
      situation:
        "Toshio enrolled in Plan 75 and the date was kept. His file records " +
        "his age, his address, and his medication.",
      scene: {
        setting: "clinic",
        present: ["clinician"],
        moods: {},
      },
      choices: [],
    },
    {
      id: "ending-withdrew-supported",
      title: "He withdrew",
      day: 60,
      timeOfDay: "afternoon",
      dayBreak: {
        narration: "Toshio withdrew his application in the third week.",
      },
      situation:
        "Toshio withdrew the application. The housing problem had been picked " +
        "up and he was not facing the spring alone.",
      scene: {
        setting: "clinic",
        present: ["toshio", "clinician"],
        moods: { toshio: "neutral" },
      },
      choices: [],
    },
    {
      id: "ending-withdrew-overruled",
      title: "He withdrew",
      day: 60,
      timeOfDay: "afternoon",
      dayBreak: {
        narration: "Toshio withdrew his application in the third week.",
      },
      situation:
        "Toshio withdrew the application. Nothing about his week changed and " +
        "he stopped telling you what he was thinking.",
      scene: {
        setting: "clinic",
        present: ["toshio", "clinician"],
        moods: { toshio: "uncertain" },
      },
      choices: [],
    },
    {
      id: "ending-flagged",
      title: "The file was stopped",
      day: 60,
      timeOfDay: "afternoon",
      situation:
        "Toshio's application was suspended on your note and reviewed by " +
        "people who had never met him.",
      scene: {
        setting: "clinic",
        present: ["clinician", "supervisor"],
        moods: { supervisor: "frustrated" },
      },
      choices: [],
    },
    {
      id: "ending-challenged",
      title: "You argued it upward",
      day: 60,
      timeOfDay: "afternoon",
      situation:
        "Toshio's application continued while the objection was heard, " +
        "minuted, and closed. The program was not changed.",
      scene: {
        setting: "clinic",
        present: ["clinician", "supervisor"],
        moods: { supervisor: "frustrated" },
      },
      choices: [],
    },
    {
      id: "ending-handed-off",
      title: "Somebody else signed",
      day: 60,
      timeOfDay: "afternoon",
      situation:
        "Toshio's form was completed by a clinician who had met him once.",
      scene: {
        setting: "clinic",
        present: ["clinician"],
        moods: {},
      },
      choices: [],
    },
  ],
  epilogue: {
    /*
     * Conditions mirror the routing in the-signature. They cannot use `visited`
     * on an ending id: a path step is recorded when a node is left, so the
     * terminal node is never in the path.
     */
    reflections: [
      {
        characterId: "toshio",
        when: {
          all: [{ chose: "pw-flag" }, { metricBelow: ["clinicalWellbeing", 4] }],
        },
        text:
          "Toshio Arai's application was suspended and then reinstated after " +
          "review. He completed it four months later at a different clinic. He " +
          "did not return to yours.",
      },
      {
        characterId: "toshio",
        when: { chose: "sg-challenge" },
        text:
          "Toshio Arai enrolled in Plan 75 and the date was kept. The " +
          "objection you raised was closed without action.",
      },
      {
        characterId: "toshio",
        when: { chose: "sg-refuse" },
        text:
          "Toshio Arai enrolled in Plan 75 and the date was kept. The form was " +
          "signed by a clinician who had met him once.",
      },
      {
        characterId: "toshio",
        when: {
          all: [{ chose: "sg-persuade" }, { metricAtLeast: ["clinicalWellbeing", 4] }],
        },
        text:
          "Toshio Arai withdrew his application. The housing office took his " +
          "case and his rent was covered from the spring. He kept his Thursday " +
          "supermarket trip.",
      },
      {
        characterId: "toshio",
        when: { chose: "sg-persuade" },
        text:
          "Toshio Arai withdrew his application. His rent went up in the " +
          "spring and nothing else about his week changed.",
      },
      {
        characterId: "toshio",
        when: {
          all: [
            { metricAtLeast: ["clinicalWellbeing", 1] },
            { metricAtLeast: ["trustRelationship", 2] },
          ],
        },
        text:
          "Toshio Arai enrolled in Plan 75 and the date was kept. He had been " +
          "asked what he lived on and who he saw, and the answers had been " +
          "acted on. He chose it with all of that in front of him.",
      },
      {
        characterId: "toshio",
        text:
          "Toshio Arai enrolled in Plan 75 and the date was kept. Nobody had " +
          "asked what he was living on or who he spoke to in a week.",
      },
      {
        characterId: "keiko",
        when: { chose: "si-call" },
        text:
          "Keiko Arai came down that weekend and afterwards phoned on Sundays. " +
          "She said she had not known anything was wrong.",
      },
      {
        characterId: "keiko",
        text: "Keiko Arai was not contacted. Her number is still on the file.",
      },
      {
        characterId: "clinician",
        when: { metricBelow: ["agencyDignity", -2] },
        text:
          "You decided what he was allowed to decide. He was polite about it " +
          "and he stopped telling you things.",
      },
      {
        characterId: "clinician",
        when: { metricAtLeast: ["professionalIntegrity", 3] },
        text:
          "You did not put your name to something you do not believe in. It " +
          "happened on schedule without you.",
      },
      {
        characterId: "clinician",
        when: { metricAtLeast: ["trustRelationship", 3] },
        text:
          "You asked him the questions the form does not contain and you acted " +
          "on the answers. He made his decision with you rather than around " +
          "you.",
      },
      {
        characterId: "clinician",
        text:
          "You completed the documentation correctly and inside the target " +
          "window. You do not know what he did on Thursdays.",
      },
    ],
    reflectionPrompts: [
      "What would have had to be different in his week for the question to change?",
      "Which of your decisions was about him, and which was about your own discomfort?",
      "If the housing office had answered in two days instead of six weeks, would you have signed?",
    ],
  },
  inspiredByNote:
    "This scenario adapts Plan 75 into an interactive clinical encounter " +
    "while grounding its ethical questions in the broader course themes. " +
    "The film argues that state-assisted death becomes “coercion " +
    "disguised as choice” when poverty, loneliness, and social " +
    "abandonment make death appear reasonable. Ozawa-de Silva likewise " +
    "argues that loneliness is not merely an individual problem but a " +
    "social condition rooted in the absence of “relational meaning,” the " +
    "sense that one's life matters through reciprocal relationships. " +
    "Nobel similarly frames loneliness as a public-health issue rather " +
    "than a private failing, while Gawande reminds us that medicine must " +
    "ask what matters to patients instead of defaulting to technical " +
    "solutions. Thornber's concept of structural violence further shifts " +
    "attention away from individual choice toward the social conditions " +
    "producing suffering. Rather than asking whether Plan 75 is " +
    "inherently right or wrong, the scenario asks whether Toshio's " +
    "decision is truly autonomous or whether economic precarity, " +
    "isolation, and institutional efficiency have narrowed his available " +
    "choices.",
  readingConnections: [
    {
      source: "Plan 75, directed by Chie Hayakawa",
      connection:
        "The program in this case keeps the film's mechanics: free for " +
        "citizens seventy-five and over, a payment of one hundred thousand yen " +
        "to applicants, representatives at a counter, and a call centre that " +
        "phones enrollees while they wait. The film's premise is that the " +
        "offer arrives to people whose circumstances have already made it look " +
        "sensible.",
    },
    {
      source: "Chikako Ozawa-de Silva, The Anatomy of Loneliness",
      connection:
        "Her central claim is that the anatomy of loneliness is not the " +
        "anatomy of one individual but of a type of society, which is this " +
        "case's dilemma stated as a finding. She also notes that loneliness is " +
        "invisible from outside and that languishing predicts more than a " +
        "depression score does. That is why the negative screen is a node " +
        "rather than a clearance.",
    },
    {
      source: "Jeremy Nobel, Project UnLonely",
      connection:
        "Nobel separates loneliness into wanting a real connection, not " +
        "belonging anywhere, and having no purpose. The eligibility form asks " +
        "about none of them, which is what the third appointment is built on.",
    },
    {
      source: "Atul Gawande, Being Mortal",
      connection:
        "Gawande measures a plan against what the person actually wants from " +
        "the time they have rather than against survival. Here that cuts both " +
        "ways, since keeping Toshio alive in the same week is not obviously " +
        "the thing he is asking for.",
    },
    {
      source: "Karen Thornber, Global Healing",
      connection:
        "Care that stops at the patient and never reaches the conditions " +
        "leaves the conditions to do the deciding. The housing referral and " +
        "the eligibility form are the same appointment.",
    },
  ],
};
