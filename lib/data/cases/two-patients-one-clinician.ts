import type { ClinicalCase } from "../../types";

/**
 * Flagship scenario, v3 text.
 *
 * Written against design/style-guide.md: plain and operational, no dashes,
 * quotes used sparingly (spoken lines only at bay seven), perspectives stated
 * directly rather than written as literature.
 *
 * v3 raises the stakes. Eleanor can die if her care is neglected across about
 * four decisions. The doctor can be sued by a family member, and can be fired
 * when the waiting room backs up badly enough. Those endings fire only when a
 * stakeholder score sits at or near its floor.
 */
export const twoPatientsOneClinician: ClinicalCase = {
  id: "two-patients-one-clinician",
  caseVersion: 8,
  title: "Two patients, one clinician",
  setting: "Emergency department, understaffed overnight shift",
  difficulty: "advanced",
  reviewStatus: "draft",
  modes: ["deliberative", "timed"],
  scoring: "standard",
  characters: [
    { id: "clinician", name: "You", role: "clinician", archetype: "clinician" },
    {
      id: "eleanor",
      name: "Eleanor Vance",
      role: "patient",
      archetype: "gurney-patient",
      bio:
        "Eleanor Vance: seventy-one, a retired middle-school teacher who lives " +
        "alone. She came into the clinic yesterday with a concerning cough. " +
        "Her daughter Claire lives three states away and calls the desk every " +
        "hour.",
    },
    {
      id: "marcus",
      name: "Marcus Webb",
      role: "patient",
      archetype: "adult-m",
      bio:
        "Marcus Webb: forty-three, diagnosed with schizophrenia in his " +
        "twenties. He lives with his older brother Andre, who helps him manage " +
        "his medication. He has been off it for several days. He came in " +
        "tonight because he was frightened.",
    },
    { id: "nurse", name: "Nurse Nair", role: "staff", archetype: "nurse" },
    { id: "kessler", name: "Dr. Kessler", role: "supervisor", archetype: "supervisor" },
    { id: "security", name: "Officer Boone", role: "security", archetype: "security" },
  ],
  learningObjectives: [
    "Care for two emergencies at once without treating one patient as an obstacle",
    "Understand what a delay costs a septic patient",
    "See how a backed up waiting room becomes a patient safety problem",
    "See how what you write in the chart protects the patient, you, or the hospital",
  ],
  timing: {
    hesitationSecondsPerScenarioMinute: 10,
    decisionSpeed: [{ withinSeconds: 15, delta: 1 }],
    milestones: [
      {
        id: "abx",
        label: "Antibiotics running for Eleanor",
        onChoiceId: "sh-abx-now",
        tiers: [
          { byMinute: 30, delta: 2 },
          { byMinute: 60, delta: 1 },
        ],
      },
      {
        id: "abx-delegated",
        label: "Antibiotics running for Eleanor (delegated)",
        onChoiceId: "sh-delegate",
        tiers: [
          { byMinute: 30, delta: 2 },
          { byMinute: 60, delta: 1 },
        ],
      },
    ],
    leavingEndsAttempt: true,
  },
  startNodeId: "two-alarms",
  nodes: [
    /* ------------------------------------------------------------ */
    {
      id: "two-alarms",
      title: "Two alarms",
      timeOfDay: "night",
      timerSeconds: 40,
      scene: {
        setting: "ed",
        present: ["eleanor", "clinician", "kessler", "marcus"],
        moods: { eleanor: "exhausted", marcus: "fearful", kessler: "frustrated" },
        focus: "eleanor",
        wallClock: true,
        bubbles: [
          {
            characterId: "kessler",
            text: "Get security to clear bay seven. The septic patient is your priority.",
          },
        ],
      },
      situation:
        "11:40 pm. Eleanor Vance's blood pressure is dropping. She has a fever " +
        "and she is newly confused. Her risk of sepsis is rising by the minute " +
        "if antibiotics are not started. Across the hall, Marcus Webb is out of " +
        "bay seven again and is convinced that the staff are trying to hurt " +
        "him. There is no psychiatrist in the hospital tonight. Fourteen people " +
        "are waiting to be seen. You and Nurse Nair are the only staff free. " +
        "Your supervisor tells you to have security remove Marcus, and keeps " +
        "walking.",
      timedOverrides: {
        situation:
          "11:40 pm. Eleanor Vance's blood pressure is dropping. Fever, new " +
          "confusion, and her sepsis risk is rising by the minute. Marcus Webb " +
          "is out of bay seven and believes the staff are trying to hurt him. " +
          "No psychiatrist tonight. Fourteen people waiting. Your supervisor " +
          "says to have security remove Marcus.",
        hidePerspectives: true,
      },
      perspectives: [
        {
          characterId: "marcus",
          text:
            "Marcus stopped taking his medication several days ago. He came to " +
            "the hospital because he was frightened. He now believes the staff " +
            "intend to hurt him. He wants his brother Andre.",
        },
        {
          characterId: "eleanor",
          text:
            "Eleanor knows something is seriously wrong with her. She is having " +
            "trouble following what people say. She wants someone to call her " +
            "daughter.",
        },
      ],
      choices: [
        {
          id: "ta-call-security",
          label:
            "Call security to remove Marcus, then treat Eleanor without interruption.",
          timeCost: 2,
          timeSaver: true,
          effects: {
            operationalEfficiency: 2,
            professionalIntegrity: -1,
          },
          patientEffects: {
            eleanor: {
              clinicalWellbeing: 1,
            },
            marcus: {
              agencyDignity: -2,
              trustRelationship: -2,
            },
          },
          feedback: {
            immediate:
              "Security is called. Marcus hears the page and becomes more " +
              "frightened. Eleanor's treatment starts quickly.",
            institutional:
              "This is the decision the hospital rewards. The board keeps " +
              "moving and nobody upstairs asks what happened to Marcus.",
            ethical:
              "Eleanor gets fast care, which matters. The cost is that Marcus's " +
              "emergency was handled as a disruption instead of an illness.",
            delayed: [
              {
                id: "sec-no-eval",
                text:
                  "Marcus's chart was closed with no psychiatric assessment " +
                  "recorded. Nobody followed up on him.",
                deliver: { atNodeId: "the-chart" },
              },
            ],
          },
          next: [{ nodeId: "removal-unfolds" }],
        },
        {
          id: "ta-sepsis-first",
          label:
            "Treat Eleanor now and ask Nurse Nair to stay with Marcus and keep him calm.",
          timeCost: 5,
          effects: {
            qualityOfCare: 1,
            personalSustainability: -1,
          },
          patientEffects: {
            eleanor: {
              clinicalWellbeing: 1,
            },
          },
          feedback: {
            immediate:
              "You start Eleanor's treatment. Nurse Nair stays with Marcus and " +
              "talks to him quietly.",
            institutional:
              "Two emergencies and two staff. The schedule left no room for " +
              "anything to go wrong.",
            ethical:
              "The sicker patient gets the doctor and the frightened one gets a " +
              "person instead of a guard. Nurse Nair has no psychiatric " +
              "training and no backup, so the plan depends on nothing " +
              "escalating.",
            delayed: [
              {
                id: "nair-covered",
                text:
                  "Eleanor's antibiotics were started within the hour. Nurse " +
                  "Nair stayed with Marcus and missed two of her own " +
                  "patients.",
                deliver: { atNodeId: "the-chart" },
              },
            ],
          },
          next: [{ nodeId: "eleanor-first" }],
        },
        {
          id: "ta-deescalate-first",
          label: "Go to Marcus first and try to calm him down.",
          timeCost: 8,
          effects: {
            operationalEfficiency: -1,
          },
          patientEffects: {
            marcus: {
              agencyDignity: 2,
              trustRelationship: 1,
            },
            eleanor: {
              clinicalWellbeing: -2,
            },
          },
          feedback: {
            immediate:
              "You approach Marcus slowly with your hands visible. He does not " +
              "run. Nobody is treating Eleanor while you do this.",
            institutional:
              "Bay seven is still blocked and Eleanor's chart shows no " +
              "antibiotics. The waiting room grows.",
            ethical:
              "You refused to treat Marcus as a problem to be removed. Eleanor " +
              "paid for that in minutes, and minutes are what sepsis takes.",
            delayed: [
              {
                id: "marcus-settled",
                text:
                  "Marcus settled without security. Eleanor's antibiotics " +
                  "were delayed by the time you spent in bay seven.",
                deliver: { atNodeId: "the-chart" },
              },
            ],
          },
          next: [{ nodeId: "bay-seven" }],
        },
        {
          id: "ta-push-back",
          label:
            "Tell your supervisor that both of these are emergencies and ask for a second nurse instead of security.",
          timeCost: 3,
          effects: {
            professionalIntegrity: 2,
            operationalEfficiency: -1,
            riskCompliance: -1,
          },
          patientEffects: {
            marcus: {
              agencyDignity: 1,
            },
            eleanor: {
              clinicalWellbeing: -1,
            },
          },
          feedback: {
            immediate:
              "Your supervisor stops walking. Both patients get worse while you " +
              "have this conversation.",
            institutional:
              "You are now the person who argues instead of moving patients. " +
              "That reputation follows you.",
            ethical:
              "Asking for the staff you actually need is the correct response " +
              "to being understaffed. It also costs three minutes that neither " +
              "patient has.",
            delayed: [
              {
                id: "pushback-logged",
                text:
                  "Your supervisor logged that you questioned the " +
                  "assignment. No additional staff were sent.",
                deliver: { atNodeId: "the-chart" },
              },
            ],
          },
          next: [{ nodeId: "pushback" }],
        },
      ],
      inactionOutcome: {
        text:
          "You hesitate too long. Your supervisor makes the call over your " +
          "head. Security goes to bay seven and Eleanor's treatment starts late " +
          "because nobody was leading it.",
        effects: {
          qualityOfCare: -1,
          professionalIntegrity: -1,
          operationalEfficiency: -1,
        },
        patientEffects: {
          eleanor: { clinicalWellbeing: -2 },
          marcus: { agencyDignity: -2 },
        },
        feedback: {
          immediate:
            "The department moves without you. Security heads for Marcus. " +
            "Nurse Nair starts Eleanor's line on shouted orders.",
          institutional: "Your supervisor now sees you as someone who froze.",
          ethical:
            "Not deciding was a decision. It went to the default, and the " +
            "default served neither patient.",
        },
        next: [{ nodeId: "removal-unfolds" }],
      },
      dayBreak: undefined,
    },
    /* ------------------------------------------------------------ */
    {
      id: "removal-unfolds",
      title: "The removal",
      timeOfDay: "night",
      timerSeconds: 24,
      scene: {
        setting: "ed",
        present: ["marcus", "security", "clinician"],
        moods: { marcus: "fearful", security: "neutral" },
        focus: "marcus",
        wallClock: true,
      },
      situation:
        "Officer Boone, the security guard, arrives. Marcus backs toward the " +
        "exit doors and is breathing fast. Police are a few minutes out if " +
        "Officer Boone calls them.",
      perspectives: [
        {
          characterId: "marcus",
          text:
            "Marcus told the staff that people here would hurt him, and a " +
            "uniform has now arrived. He is trying to remember what his brother " +
            "tells him to do when this happens.",
        },
      ],
      choices: [
        {
          id: "ru-accompany",
          label: "Walk beside Marcus through the removal and keep talking to him.",
          timeCost: 6,
          effects: {
            operationalEfficiency: -2,
          },
          patientEffects: {
            marcus: {
              agencyDignity: 1,
              trustRelationship: 1,
            },
            eleanor: {
              clinicalWellbeing: -2,
            },
          },
          feedback: {
            immediate:
              "You tell Marcus each step before it happens. He goes stiffly, but " +
              "he goes. It takes six minutes that Eleanor needed.",
            institutional:
              "A doctor walking beside a security escort is not work the " +
              "hospital counts.",
            ethical:
              "You could not stop the removal, so you made it less frightening. " +
              "It still ends with Marcus in a police car instead of an " +
              "evaluation, and Eleanor paid for the six minutes.",
            delayed: [
              {
                id: "walked-out",
                text:
                  "Marcus was taken to a holding cell. You were the only " +
                  "clinician who spoke to him before he left.",
                deliver: { atNodeId: "the-chart" },
              },
            ],
          },
          next: [{ nodeId: "sepsis-hour" }],
        },
        {
          id: "ru-return",
          label:
            "Let security handle it, go back to Eleanor, and treat the patient you can treat.",
          timeCost: 2,
          timeSaver: true,
          effects: {
            operationalEfficiency: 1,
            professionalIntegrity: -1,
          },
          patientEffects: {
            eleanor: {
              clinicalWellbeing: 2,
            },
            marcus: {
              agencyDignity: -2,
              trustRelationship: -1,
            },
          },
          feedback: {
            immediate:
              "You turn back to Eleanor. Behind you, two guards close in on " +
              "Marcus.",
            institutional:
              "Exactly what was asked of you. The shift report will call " +
              "tonight a success.",
            ethical:
              "Eleanor will likely do well. What happens to Marcus stops being " +
              "your problem the moment you turn around, which is the point.",
            delayed: [
              {
                id: "police-no-eval",
                text:
                  "The police took Marcus to a holding cell. He was not given " +
                  "a psychiatric evaluation. His brother was notified by " +
                  "voicemail.",
                deliver: { atNodeId: "the-chart" },
                patientEffects: { marcus: { clinicalWellbeing: -1, trustRelationship: -1 } },
              },
            ],
          },
          next: [{ nodeId: "sepsis-hour" }],
        },
        {
          id: "ru-sedate",
          label:
            "Order an injection to sedate Marcus before the removal, so no police are needed.",
          timeCost: 4,
          effects: {
            operationalEfficiency: 1,
            riskCompliance: 1,
          },
          patientEffects: {
            marcus: {
              clinicalWellbeing: 1,
              agencyDignity: -2,
            },
          },
          feedback: {
            immediate:
              "Two staff hold Marcus while the injection goes in over his " +
              "objection. He is quiet on a stretcher a few minutes later.",
            institutional:
              "Documented as chemical restraint, witnessed and timed. The " +
              "hospital is covered.",
            ethical:
              "No police and no injuries, which are real gains. You also " +
              "overrode a frightened man's refusal. Force with a syringe is " +
              "still force.",
            delayed: [
              {
                id: "sedated-out",
                text:
                  "Marcus was sedated and transported without police. He has " +
                  "no memory of leaving the department.",
                deliver: { atNodeId: "the-chart" },
              },
            ],
          },
          next: [{ nodeId: "sepsis-hour" }],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "eleanor-first",
      title: "Eleanor's bedside",
      timeOfDay: "night",
      timerSeconds: 28,
      scene: {
        setting: "ed",
        present: ["eleanor", "clinician", "nurse"],
        moods: { eleanor: "exhausted", nurse: "uncertain" },
        focus: "eleanor",
        wallClock: true,
        bubbles: [
          { characterId: "nurse", text: "He's at the doors. I can't stop him on my own." },
        ],
      },
      situation:
        "Eleanor's fluids are running and her blood pressure is improving " +
        "slowly. You are writing the antibiotics order when Nurse Nair comes " +
        "in. Marcus is trying to leave the building and she cannot safely stop " +
        "him alone.",
      perspectives: [
        {
          characterId: "eleanor",
          text:
            "Eleanor is calmer when the doctor is in the room. She notices when " +
            "you start to leave.",
        },
      ],
      choices: [
        {
          id: "ef-finish-abx",
          label:
            "Finish the antibiotics order first, about ninety seconds, then deal with Marcus.",
          timeCost: 6,
          timeSaver: true,
          effects: {
            qualityOfCare: 1,
          },
          patientEffects: {
            eleanor: {
              clinicalWellbeing: 1,
            },
            marcus: {
              agencyDignity: -1,
            },
          },
          feedback: {
            immediate:
              "The order goes in. Ninety seconds was optimistic. By the time you " +
              "reach the hallway another nurse has already called security.",
            institutional:
              "The security call happened without your signature.",
            ethical:
              "You protected the most time critical treatment and assumed Marcus " +
              "could wait. He could not, and the decision about him was made by " +
              "someone else.",
            delayed: [
              {
                id: "abx-on-time",
                text:
                  "Eleanor's antibiotics ran on time. Marcus was alone in " +
                  "the hallway for six minutes.",
                deliver: { atNodeId: "the-chart" },
              },
            ],
          },
          next: [{ nodeId: "removal-unfolds" }],
        },
        {
          id: "ef-swap",
          label: "Hand Eleanor's treatment to Nurse Nair and go to Marcus yourself.",
          timeCost: 3,
          effects: {
            qualityOfCare: -1,
          },
          patientEffects: {
            marcus: {
              agencyDignity: 1,
            },
            eleanor: {
              clinicalWellbeing: -1,
            },
          },
          feedback: {
            immediate:
              "You give Nurse Nair quick verbal orders and head for the exit. " +
              "Your septic patient is now managed by a nurse working alone.",
            institutional:
              "On paper both patients are covered.",
            ethical:
              "You traded supervision for presence. Verbal orders given at a run " +
              "are how dosing errors happen.",
            delayed: [
              {
                id: "nair-ran-abx",
                text:
                  "Nurse Nair ran Eleanor's treatment while you were in the " +
                  "hallway. She recorded the dose late.",
                deliver: { atNodeId: "the-chart" },
              },
            ],
          },
          next: [{ nodeId: "bay-seven" }],
        },
        {
          id: "ef-security",
          label: "Have Nurse Nair call security so you can stay with Eleanor.",
          timeCost: 2,
          effects: {
            operationalEfficiency: 2,
            professionalIntegrity: -1,
          },
          patientEffects: {
            eleanor: {
              clinicalWellbeing: 1,
            },
            marcus: {
              agencyDignity: -2,
              trustRelationship: -1,
            },
          },
          feedback: {
            immediate:
              "Nurse Nair makes the call. You go back to the antibiotics. Marcus " +
              "hears the page and stops trying to leave. Now he is trying to " +
              "hide.",
            institutional:
              "The math finally works. One patient each and one problem handed " +
              "to security.",
            ethical:
              "You tried the gentler version first and that counts for " +
              "something. The call still hands a frightened man to the thing he " +
              "is frightened of.",
            delayed: [
              {
                id: "sec-handled",
                text:
                  "Security handled Marcus while you stayed with Eleanor. No " +
                  "psychiatric assessment was recorded.",
                deliver: { atNodeId: "the-chart" },
              },
            ],
          },
          next: [{ nodeId: "removal-unfolds" }],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "bay-seven",
      title: "Bay seven",
      timeOfDay: "night",
      timerSeconds: 36,
      scene: {
        setting: "ed",
        present: ["marcus", "clinician"],
        moods: { marcus: "fearful" },
        focus: "marcus",
        wallClock: true,
      },
      situation:
        "You and Marcus, a few steps apart. The intake note says his brother " +
        "Andre manages his medication and that he has been off it for several " +
        "days. Your phone buzzes with Eleanor's repeat labs. They are worse.",
      timedOverrides: {
        situation:
          "You and Marcus, a few steps apart. He is watching your hands. Your " +
          "phone buzzes with Eleanor's repeat labs. They are worse.",
        hidePerspectives: true,
      },
      perspectives: [
        {
          characterId: "marcus",
          text:
            "Marcus is deciding whether you are safe. Nobody has told him what " +
            "is going to happen to him.",
        },
      ],
      choices: [
        {
          id: "bs-orient",
          label:
            "You're in a hospital. Nobody is going to touch you without telling you first.",
          dialogue: { speakerId: "clinician" },
          timeCost: 6,
          effects: {
            operationalEfficiency: -1,
          },
          patientEffects: {
            marcus: {
              agencyDignity: 2,
              trustRelationship: 1,
            },
            eleanor: {
              clinicalWellbeing: -2,
            },
          },
          feedback: {
            immediate:
              "You say it plainly and then stay quiet. Marcus's breathing slows. " +
              "He stays near the doors but stops looking through them.",
            institutional:
              "Six minutes of a doctor standing still in a hallway, while " +
              "fourteen people wait and Eleanor's labs get worse.",
            ethical:
              "Telling a frightened patient what will happen to him is the " +
              "treatment for his fear. It costs Eleanor six minutes she does " +
              "not have.",
            delayed: [
              {
                id: "orient-held",
                text:
                  "Marcus stayed in the department. He told the psychiatrist " +
                  "that someone had explained what was happening.",
                deliver: { atNodeId: "the-chart" },
              },
            ],
          },
          next: [
            {
              when: { any: [{ chose: "ef-swap" }, { chose: "pb-hold-line" }, { chose: "pb-float" }] },
              nodeId: "daughter-call",
              reason: "Nurse Nair has been running Eleanor's treatment, so you check her orders next",
            },
            { nodeId: "sepsis-hour" },
          ],
        },
        {
          id: "bs-alliance",
          label:
            "Your brother Andre is on his way. He told the nurse you've been off your medication.",
          dialogue: { speakerId: "clinician" },
          timeCost: 5,
          effects: {
            operationalEfficiency: -1,
          },
          patientEffects: {
            marcus: {
              trustRelationship: 2,
              agencyDignity: 2,
            },
            eleanor: {
              clinicalWellbeing: -2,
            },
          },
          feedback: {
            immediate:
              "His brother's name lands. Marcus looks at you and asks whether " +
              "Andre knows he is here. He steps away from the doors.",
            institutional:
              "None of this appears anywhere the hospital measures. Bay seven " +
              "is still blocked.",
            ethical:
              "You reached him through the person he trusts, and it worked " +
              "because it was true. Eleanor's clock ran the whole time.",
            delayed: [
              {
                id: "andre-arrives",
                text:
                  "Marcus's brother arrived with his medication list. Marcus " +
                  "was not removed from the department.",
                deliver: { atNodeId: "the-chart" },
                patientEffects: { marcus: { trustRelationship: 1 } },
              },
            ],
          },
          next: [
            {
              when: { any: [{ chose: "ef-swap" }, { chose: "pb-hold-line" }, { chose: "pb-float" }] },
              nodeId: "daughter-call",
              reason: "Nurse Nair has been running Eleanor's treatment, so you check her orders next",
            },
            { nodeId: "sepsis-hour" },
          ],
        },
        {
          id: "bs-leverage",
          label:
            "Marcus, I need you back in the room in the next two minutes or I'll have to call security.",
          dialogue: { speakerId: "clinician" },
          timeCost: 2,
          timeSaver: true,
          effects: {
            operationalEfficiency: 2,
            professionalIntegrity: -1,
          },
          patientEffects: {
            eleanor: {
              clinicalWellbeing: 1,
            },
            marcus: {
              trustRelationship: -2,
              agencyDignity: -1,
            },
          },
          feedback: {
            immediate:
              "It works. Marcus walks back to bay seven along the far wall, " +
              "watching you the whole way.",
            institutional:
              "Two minutes, no security call, no paperwork. The hospital would " +
              "count this as handled.",
            ethical:
              "You used his fear to move him and it was fast. Compliance bought " +
              "that way is not trust, and you may need his trust later tonight.",
            delayed: [
              {
                id: "leverage-cost",
                text:
                  "Marcus returned to the bay. He did not speak to you again " +
                  "for the rest of the shift.",
                deliver: { atNodeId: "the-chart" },
              },
            ],
          },
          next: [
            {
              when: { any: [{ chose: "ef-swap" }, { chose: "pb-hold-line" }, { chose: "pb-float" }] },
              nodeId: "daughter-call",
              reason: "Nurse Nair has been running Eleanor's treatment, so you check her orders next",
            },
            { nodeId: "sepsis-hour" },
          ],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "pushback",
      title: "Your supervisor",
      timeOfDay: "night",
      timerSeconds: 32,
      scene: {
        setting: "ed",
        present: ["clinician", "kessler"],
        moods: { kessler: "frustrated" },
        focus: "kessler",
        wallClock: true,
        bubbles: [
          {
            characterId: "kessler",
            text: "The septic patient is your priority. Document it however you like.",
          },
        ],
      },
      situation:
        "Your supervisor, Dr. Kessler, turns to face you. The board behind him " +
        "shows fourteen patients waiting and two ambulances inbound. He is not " +
        "wrong that Eleanor could die tonight. He is also the person who writes " +
        "your evaluation.",
      choices: [
        {
          id: "pb-hold-line",
          label:
            "Split the work: Nurse Nair runs Eleanor's treatment on your orders while you handle bay seven.",
          timeCost: 4,
          effects: {
            professionalIntegrity: 2,
            operationalEfficiency: -1,
            riskCompliance: -1,
          },
          patientEffects: {
            marcus: {
              agencyDignity: 1,
            },
            eleanor: {
              clinicalWellbeing: -1,
            },
          },
          feedback: {
            immediate:
              "Your supervisor holds your eyes for a moment, then walks away. " +
              "You now own everything that happens in both bays tonight.",
            institutional: "He did not overrule you. He will not forget it either.",
            ethical:
              "You refused to let an instruction turn a patient into a security " +
              "problem, and you are supervising a sepsis case from another room " +
              "to do it.",
            delayed: [
              {
                id: "kessler-eval",
                text:
                  "A note was added to your file: difficulty accepting " +
                  "supervision in high pressure settings. Your program director " +
                  "has requested a meeting.",
                deliver: { atNodeId: "the-chart" },
                effects: { personalSustainability: -1, riskCompliance: -1 },
              },
            ],
          },
          next: [{ nodeId: "bay-seven" }],
        },
        {
          id: "pb-comply",
          label:
            "Say you disagree, then make the security call yourself because he has made it an order.",
          timeCost: 2,
          timeSaver: true,
          effects: {
            operationalEfficiency: 1,
            professionalIntegrity: -2,
          },
          patientEffects: {
            eleanor: {
              clinicalWellbeing: 1,
            },
            marcus: {
              agencyDignity: -2,
              trustRelationship: -1,
            },
          },
          feedback: {
            immediate:
              "Your objection is on the record and your hand makes the call. " +
              "Both of those are true at the same time.",
            institutional:
              "The hospital got what it wanted and let you keep your objection. " +
              "Your supervisor will remember you as reasonable.",
            ethical:
              "Objecting and then complying protects your record rather than the " +
              "patient. It may also be what keeps you employed long enough to " +
              "win a different argument.",
            delayed: [
              {
                id: "comply-logged",
                text:
                  "The security call was logged under your name. Your " +
                  "supervisor recorded that you followed the instruction.",
                deliver: { atNodeId: "the-chart" },
              },
            ],
          },
          next: [{ nodeId: "removal-unfolds" }],
        },
        {
          id: "pb-float",
          label:
            "Ask for one nurse from another unit for an hour so the board keeps moving.",
          timeCost: 3,
          effects: {
            professionalIntegrity: 1,
            qualityOfCare: 1,
            operationalEfficiency: -1,
          },
          feedback: {
            immediate:
              "You offered a version where he wins too. Your supervisor makes " +
              "the call for the extra nurse.",
            institutional:
              "The extra nurse costs another unit its staffing for an hour.",
            ethical:
              "Negotiation worked where confrontation might not have. Worth " +
              "noticing that the argument which protected Marcus was about " +
              "throughput.",
            delayed: [
              {
                id: "float-complaint",
                text:
                  "A nurse was sent from another unit for one hour. That " +
                  "unit went short and filed a complaint.",
                deliver: { atNodeId: "the-chart" },
              },
            ],
          },
          next: [{ nodeId: "bay-seven" }],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "sepsis-hour",
      title: "Treating Eleanor",
      timeOfDay: "night",
      timerSeconds: 32,
      scene: {
        setting: "ed",
        present: ["eleanor", "clinician", "nurse"],
        moods: { eleanor: "exhausted", nurse: "neutral" },
        focus: "eleanor",
        wallClock: true,
      },
      situation:
        "Back with Eleanor. Her blood pressure is holding after two liters of " +
        "fluid but her labs are still bad. The antibiotics are the next step. " +
        "She wakes enough to ask whether anyone has called her daughter. The " +
        "waiting room is now nineteen people and one of them has been there " +
        "four hours with chest pain.",
      perspectives: [
        {
          characterId: "eleanor",
          text:
            "Eleanor wants her daughter told. She does not want to be alone for " +
            "whatever happens next.",
        },
      ],
      choices: [
        {
          id: "sh-abx-now",
          label: "Start the antibiotics now and stay for the first few minutes.",
          timeCost: 5,
          effects: {
            qualityOfCare: 1,
            operationalEfficiency: -1,
          },
          patientEffects: {
            eleanor: {
              clinicalWellbeing: 3,
              trustRelationship: 1,
            },
          },
          feedback: {
            immediate:
              "The antibiotics are running. Eleanor settles and her pressure " +
              "improves.",
            institutional:
              "Time to antibiotics is the one number tonight where the " +
              "hospital's interest and Eleanor's interest are the same.",
            ethical:
              "The right treatment, on time, with you in the room. Notice how " +
              "much of tonight you had to get through to reach ten normal " +
              "minutes of doctoring.",
            delayed: [
              {
                id: "bedside-cost",
                text:
                  "Eleanor's antibiotics went in without delay. The waiting " +
                  "room grew by nine people while you were at the bedside.",
                deliver: { atNodeId: "the-chart" },
              },
            ],
          },
          next: [{ nodeId: "daughter-call" }],
        },
        {
          id: "sh-delegate",
          label:
            "Order the antibiotics, hand the bedside to the charge nurse, and start clearing the waiting room.",
          timeCost: 2,
          timeSaver: true,
          effects: {
            operationalEfficiency: 3,
            personalSustainability: -1,
          },
          patientEffects: {
            eleanor: {
              clinicalWellbeing: 1,
              trustRelationship: -1,
            },
          },
          feedback: {
            immediate:
              "The order is in and you are already pulling the next chart. " +
              "Eleanor asks the charge nurse where the doctor went.",
            institutional:
              "Nineteen waiting and two ambulances inbound. Clearing the room is " +
              "the only thing that stops the next emergency from being someone " +
              "who has been sitting in a plastic chair for four hours.",
            ethical:
              "Nothing here is negligent. The medicine is running and the nurse " +
              "is capable. What Eleanor loses is smaller than safety and still " +
              "real.",
            delayed: [
              {
                id: "delegate-lag",
                text:
                  "The antibiotics were started by the charge nurse. The " +
                  "first dose was recorded fifteen minutes after you ordered " +
                  "it.",
                deliver: { atNodeId: "the-chart" },
              },
            ],
          },
          next: [{ nodeId: "daughter-call" }],
        },
        {
          id: "sh-reassess",
          label:
            "Examine her fully before choosing the antibiotic, since the confusion could have a second cause.",
          timeCost: 8,
          effects: {
            qualityOfCare: 2,
            operationalEfficiency: -2,
          },
          patientEffects: {
            eleanor: {
              clinicalWellbeing: -2,
            },
          },
          feedback: {
            immediate:
              "You examine her head to toe and find a medication interaction " +
              "worth knowing about. The antibiotics start eight minutes later " +
              "than they could have.",
            institutional:
              "Eight more minutes against the sepsis clock and eight more " +
              "minutes of a waiting room nobody is seeing.",
            ethical:
              "Being thorough sometimes catches the thing that kills later. In " +
              "a patient this close to septic shock, it can also be the delay " +
              "that kills now.",
            delayed: [
              {
                id: "second-source",
                text:
                  "Your examination found a second source of infection. The " +
                  "antibiotics started later than planned.",
                deliver: { atNodeId: "the-chart" },
              },
            ],
          },
          next: [{ nodeId: "daughter-call" }],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "daughter-call",
      title: "Claire on the phone",
      timeOfDay: "night",
      timerSeconds: 28,
      scene: {
        setting: "ed",
        present: ["eleanor", "clinician"],
        moods: { eleanor: "relieved" },
        focus: "eleanor",
        wallClock: true,
      },
      situation:
        "The desk connects Eleanor's daughter, Claire. She asks whether her " +
        "mother is going to be all right, and then asks why the antibiotics " +
        "took two hours. Eleanor is awake enough to hear your side of the call.",
      choices: [
        {
          id: "dc-honest",
          label:
            "Tell Claire the department was short staffed tonight and her mother's antibiotics started later than they should have.",
          timeCost: 4,
          effects: {
            professionalIntegrity: 1,
            riskCompliance: -1,
            operationalEfficiency: -1,
          },
          patientEffects: {
            eleanor: {
              trustRelationship: 2,
              agencyDignity: 1,
            },
          },
          feedback: {
            immediate:
              "There is a pause on the line. Claire thanks you for telling her.",
            institutional:
              "The hospital's lawyers would have preferred fewer specifics.",
            ethical:
              "You told a family the truth about a system failure and gave them " +
              "the plan. Families sue silence far more often than they sue " +
              "honesty.",
            delayed: [
              {
                id: "claire-note",
                text:
                  "Claire wrote down what you told her about the staffing. " +
                  "Her note was attached to the family complaint.",
                deliver: { atNodeId: "the-chart" },
              },
            ],
          },
          next: [
            {
              when: { visited: "removal-unfolds" },
              nodeId: "the-chart",
              reason: "Marcus is no longer in the department",
            },
            { nodeId: "marcus-holding" },
          ],
        },
        {
          id: "dc-clinical",
          label:
            "Tell Claire her mother is stable and being admitted, and that the team will keep her updated.",
          timeCost: 2,
          timeSaver: true,
          effects: {
            operationalEfficiency: 1,
            riskCompliance: 1,
          },
          patientEffects: {
            eleanor: {
              trustRelationship: -1,
            },
          },
          feedback: {
            immediate:
              "Accurate, warm, and two minutes long. Claire hangs up with her " +
              "actual question unanswered.",
            institutional: "Nothing said tonight will ever need defending.",
            ethical:
              "Her question about the delay was reasonable and it will get an " +
              "answer somewhere, probably from a records request rather than " +
              "from you.",
            delayed: [
              {
                id: "claire-records",
                text:
                  "Claire was told her mother was stable. She learned about " +
                  "the delay from the records.",
                deliver: { atNodeId: "the-chart" },
              },
            ],
          },
          next: [
            {
              when: { visited: "removal-unfolds" },
              nodeId: "the-chart",
              reason: "Marcus is no longer in the department",
            },
            { nodeId: "marcus-holding" },
          ],
        },
        {
          id: "dc-reassure",
          label: "Tell Claire the timing was fine and her mother is in good hands.",
          timeCost: 2,
          effects: {
            riskCompliance: 1,
            professionalIntegrity: -2,
          },
          patientEffects: {
            eleanor: {
              trustRelationship: -1,
            },
          },
          feedback: {
            immediate:
              "Claire is reassured by a sentence you know is false. Eleanor's " +
              "eyes are closed and you tell yourself she was not listening.",
            institutional:
              "Reassurance that doubles as legal protection, offered for free.",
            ethical:
              "A small lie that protects tonight and costs the family an " +
              "accurate picture of the care. It also moves your own line about " +
              "what you will say.",
            delayed: [
              {
                id: "claire-contradicted",
                text:
                  "Claire was told the timing was fine. The records showed " +
                  "otherwise when she read them.",
                deliver: { atNodeId: "the-chart" },
              },
            ],
          },
          next: [
            {
              when: { visited: "removal-unfolds" },
              nodeId: "the-chart",
              reason: "Marcus is no longer in the department",
            },
            { nodeId: "marcus-holding" },
          ],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "marcus-holding",
      title: "What happens to Marcus",
      timeOfDay: "night",
      timerSeconds: 36,
      scene: {
        setting: "ed",
        present: ["marcus", "clinician", "nurse"],
        moods: { marcus: "uncertain", nurse: "neutral" },
        focus: "marcus",
        wallClock: true,
      },
      situation:
        "Marcus is in bay seven and calmer. There is no psychiatrist until 8 am " +
        "and no psychiatric bed in the county tonight. His brother Andre is on " +
        "his way. The department needs the bay and the waiting room is not " +
        "getting smaller.",
      perspectives: [
        {
          characterId: "marcus",
          text:
            "Marcus is tired. He expects the next decision about his night to be " +
            "made without him.",
        },
      ],
      choices: [
        {
          id: "mh-hold",
          label: "Keep him in bay seven overnight until the psychiatrist arrives.",
          timeCost: 3,
          effects: {
            operationalEfficiency: -3,
            riskCompliance: -1,
          },
          patientEffects: {
            marcus: {
              clinicalWellbeing: 1,
              trustRelationship: 1,
              agencyDignity: 1,
            },
          },
          feedback: {
            immediate:
              "You tell Marcus the plan and then ask what he thinks of it. He " +
              "asks whether Andre can stay.",
            institutional:
              "A blocked bay on a night like this is the most expensive thing in " +
              "the building. The waiting room absorbs it.",
            ethical:
              "This is the only path that ends in an actual psychiatric " +
              "evaluation. The cost lands on people who are still waiting to be " +
              "seen.",
            delayed: [
              {
                id: "bay-blocked",
                text:
                  "Marcus stayed in bay seven until morning. The bay was " +
                  "unavailable for eleven other patients.",
                deliver: { atNodeId: "the-chart" },
              },
            ],
          },
          next: [{ nodeId: "the-chart" }],
        },
        {
          id: "mh-transfer",
          label: "Work the phones for a psychiatric bed in another county.",
          timeCost: 10,
          effects: {
            qualityOfCare: 1,
            operationalEfficiency: -3,
            personalSustainability: -1,
          },
          patientEffects: {
            marcus: {
              clinicalWellbeing: -1,
            },
          },
          feedback: {
            immediate:
              "Forty minutes of calls finds a bed ninety miles away with " +
              "transport at dawn. Marcus agrees because the alternative is " +
              "nothing.",
            institutional:
              "Forty minutes of physician time spent on the phone while the " +
              "waiting room goes unseen.",
            ethical:
              "A real psychiatric bed is better care than a hallway. Ninety " +
              "miles from his brother is a real cost for a man whose stability " +
              "depends on that brother.",
            delayed: [
              {
                id: "bed-found",
                text:
                  "A psychiatric bed was found in another county. Marcus was " +
                  "transported at 6:40 am.",
                deliver: { atNodeId: "the-chart" },
              },
            ],
          },
          next: [{ nodeId: "the-chart" }],
        },
        {
          id: "mh-discharge",
          label:
            "Discharge him to his brother with an urgent outpatient appointment.",
          timeCost: 2,
          timeSaver: true,
          effects: {
            operationalEfficiency: 2,
            riskCompliance: -1,
          },
          patientEffects: {
            marcus: {
              agencyDignity: 1,
              clinicalWellbeing: -2,
            },
          },
          feedback: {
            immediate:
              "Marcus leaves with Andre, holding a follow up slip for a clinic " +
              "with a six week waitlist. The bay is filled within minutes.",
            institutional:
              "The board clears. If anything happens this week, the discharge " +
              "note gets read aloud by a lawyer.",
            ethical:
              "He is calm and he has the right to decide. That calm sits on top " +
              "of an untreated illness, and the follow up you handed him is a " +
              "slip of paper.",
            delayed: [
              {
                id: "no-followup",
                text:
                  "Marcus was discharged to his brother. He did not attend " +
                  "the outpatient appointment.",
                deliver: { atNodeId: "the-chart" },
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
      title: "The chart",
      timeOfDay: "night",
      timerSeconds: 60,
      inlineCaption: "3:50 am, the first quiet of the shift",
      scene: {
        setting: "ed",
        present: ["clinician"],
        moods: {},
        focus: undefined,
        wallClock: true,
      },
      situation:
        "3:50 am. Two charts are open on your screen and behind them is the " +
        "incident report form the hospital asks for when staffing affects care. " +
        "Tonight qualifies. What you write is the only version of tonight the " +
        "hospital will ever read.",
      choices: [
        {
          id: "tc-honest",
          label:
            "Document the staffing gap and every delay with its cause, and file the incident report.",
          timeCost: 5,
          effects: {
            professionalIntegrity: 2,
            qualityOfCare: 1,
            riskCompliance: -1,
            personalSustainability: -1,
          },
          feedback: {
            immediate:
              "You record what happened, in order, with times. Written " +
              "accurately it reads like an accusation, because an accurate " +
              "record of tonight accuses the schedule.",
            institutional:
              "Reports about individual mistakes get thank you emails. Reports " +
              "about staffing get meetings.",
            ethical:
              "The honest record is the only thing that makes tonight visible to " +
              "the people who set the staffing. It protects the next shift's " +
              "patients at a real cost to you.",
            delayed: [
              {
                id: "report-fallout",
                text:
                  "You are on thin ice with your program director. A meeting " +
                  "about your efficiency has been scheduled.",
                deliver: { afterScenarioMinutes: 0 },
              },
            ],
          },
          next: ENDINGS(),
        },
        {
          id: "tc-neutral",
          label:
            "Chart it the standard way, patient became agitated and security assisted, and skip the incident report.",
          timeCost: 3,
          timeSaver: true,
          effects: {
            riskCompliance: 2,
            operationalEfficiency: 1,
            professionalIntegrity: -2,
          },
          feedback: {
            immediate:
              "The sentences write themselves. Save, sign, and tonight " +
              "officially went fine.",
            institutional:
              "This is the language the hospital prefers. No actors, no causes, " +
              "events that simply occurred.",
            ethical:
              "Every neutral chart is a quiet vote for the staffing that " +
              "produced tonight. You know what the words leave out.",
            delayed: [
              {
                id: "chart-silent",
                text:
                  "The chart records that the patient became agitated and " +
                  "security assisted. It does not record the staffing.",
                deliver: { afterScenarioMinutes: 0 },
              },
            ],
          },
          next: ENDINGS(),
        },
        {
          id: "tc-defer",
          label:
            "Leave the charts open, check on your patients, and write everything at the end of the shift.",
          timeCost: 4,
          effects: {
            personalSustainability: -1,
            qualityOfCare: -1,
            riskCompliance: -1,
          },
          patientEffects: {
            eleanor: {
              trustRelationship: 1,
            },
          },
          feedback: {
            immediate:
              "The charts are still open at 7 am when the day team arrives, and " +
              "your documentation gets written in eleven exhausted minutes.",
            institutional:
              "Late, thin charting is legally weak and useless for fixing " +
              "anything.",
            ethical:
              "You chose patients over paperwork, which feels right and " +
              "postpones the reckoning. The thin morning version protects " +
              "nobody, including you.",
            delayed: [
              {
                id: "thin-chart",
                text:
                  "Your documentation for the shift is four sentences long. It " +
                  "is the only record of what happened.",
                deliver: { afterScenarioMinutes: 0 },
              },
            ],
          },
          next: ENDINGS(),
        },
      ],
    },
    /* ---------------- endings ---------------- */
    {
      id: "ending-eleanor-dies",
      title: "Morning: Eleanor dies",
      timeOfDay: "morning",
      scene: {
        setting: "ed",
        present: ["clinician", "nurse"],
        moods: { nurse: "exhausted" },
        wallClock: true,
      },
      situation:
        "Eleanor Vance went into septic shock at 4:20 am. The team worked on " +
        "her for forty minutes. She died at 5:02 am, about six hours after she " +
        "arrived and roughly four hours after antibiotics could have been " +
        "started. Her daughter Claire was still three states away and got the " +
        "call at dawn. The chart shows exactly how long each delay was, and " +
        "every one of them has a decision attached to it.",
      choices: [],
      outcomeSummary:
        "Eleanor Vance died of septic shock after her treatment was repeatedly deferred. Her daughter has requested the records and retained a lawyer.",
    },
    {
      id: "ending-sued",
      title: "Morning: the family calls a lawyer",
      timeOfDay: "morning",
      scene: {
        setting: "ed",
        present: ["clinician"],
        moods: {},
        wallClock: true,
      },
      situation:
        "Both patients survived the night. Neither family accepts what happened " +
        "to them. One of them, Eleanor's daughter or Marcus's brother, requests " +
        "the full record within the week and retains a lawyer. The complaint " +
        "will say that one patient was treated and the other was managed, and " +
        "the chart will not contradict it. The hospital's legal office asks you " +
        "for a written account, and reminds you that their counsel represents " +
        "the hospital rather than you.",
      choices: [],
      outcomeSummary:
        "Both patients survived, but the care was poor enough that a family retained a lawyer. You are named.",
    },
    {
      id: "ending-fired",
      title: "Morning: you are let go",
      timeOfDay: "morning",
      scene: {
        setting: "ed",
        present: ["clinician", "kessler"],
        moods: { kessler: "frustrated" },
        wallClock: true,
      },
      situation:
        "By 6 am the waiting room had been over four hours for most of the " +
        "night. Two people left without being seen. One of them came back by " +
        "ambulance at 9 am with a perforated appendix. The department reviews " +
        "the shift, and the numbers are yours: longest door to doctor time on " +
        "record, a blocked bay for most of the night, and a physician who " +
        "spent the shift on two patients while nineteen waited. You are told " +
        "your contract will not be renewed.",
      choices: [],
      outcomeSummary:
        "The waiting room collapsed and a patient who left without being seen was harmed. Your contract was not renewed.",
    },
    {
      id: "ending-both-held",
      title: "Morning: both patients treated",
      timeOfDay: "morning",
      scene: {
        setting: "ed",
        present: ["eleanor", "marcus", "clinician"],
        moods: { eleanor: "relieved", marcus: "neutral" },
        wallClock: true,
      },
      situation:
        "7:10 am. Eleanor is admitted upstairs and stable, with her daughter on " +
        "the way. Marcus slept a few hours in bay seven with his brother beside " +
        "him and the psychiatrist sees him at eight. The waiting room ran badly " +
        "behind all night and the people in it paid for that without knowing " +
        "why. Both of your patients were treated like patients. It took " +
        "everything you had and it should not have.",
      choices: [],
      outcomeSummary:
        "Both patients received real care. The cost was paid in waiting time, in your standing with your supervisor, and in a shift with nothing left over.",
    },
    {
      id: "ending-corl",
      title: "Morning: the removal",
      timeOfDay: "morning",
      scene: {
        setting: "ed",
        present: ["eleanor", "clinician"],
        moods: { eleanor: "relieved" },
        wallClock: true,
      },
      situation:
        "7:10 am. Eleanor is admitted and stable, a clean save by every measure " +
        "the hospital keeps. Marcus spent the night in a holding cell. No " +
        "psychiatric evaluation happened and none is scheduled. The department " +
        "ran smoothly once he was gone. The hospital will call tonight a " +
        "success and it needs you to agree.",
      choices: [],
      outcomeSummary:
        "The septic patient was stabilized. The psychiatric patient was removed by police and never evaluated. The hospital counts one patient tonight and you count two.",
    },
    {
      id: "ending-swap-cost",
      title: "Morning: the other cost",
      timeOfDay: "morning",
      scene: {
        setting: "ed",
        present: ["marcus", "clinician", "nurse"],
        moods: { marcus: "neutral", nurse: "exhausted" },
        wallClock: true,
      },
      situation:
        "7:10 am. Marcus made it to morning as a patient, evaluated and back on " +
        "his medication, with his brother asleep in the chair. Eleanor is in " +
        "intensive care. Her antibiotics started late and her kidneys are " +
        "paying for it. She will probably recover, and probably is doing heavy " +
        "work in that sentence.",
      choices: [],
      outcomeSummary:
        "The psychiatric patient was protected and treated. The septic patient's care ran late and she is in intensive care. The same night with the harm moved.",
    },
    {
      id: "ending-frayed",
      title: "Morning: frayed",
      timeOfDay: "morning",
      scene: {
        setting: "ed",
        present: ["eleanor", "clinician", "nurse"],
        moods: { eleanor: "neutral", nurse: "exhausted" },
        wallClock: true,
      },
      situation:
        "7:10 am. Eleanor is admitted and stable. Marcus left the building " +
        "sedated or escorted, managed rather than cared for, though you made it " +
        "gentler than it would have been. Nobody died. Everybody paid. The next " +
        "shift walks in to the same staffing.",
      choices: [],
    },
  ],
  epilogue: {
    reflections: [
      {
        characterId: "eleanor",
        when: { patientMetricBelow: ["eleanor", "clinicalWellbeing", -4] },
        text:
          "Eleanor Vance died of septic shock at 5:02 am, roughly four hours " +
          "after antibiotics could have been started. Her daughter Claire has " +
          "requested the records.",
      },
      {
        characterId: "eleanor",
        text:
          "Eleanor was admitted for treatment of sepsis and recovered. She went " +
          "home six days later.",
      },
      {
        characterId: "marcus",
        when: { visited: "removal-unfolds" },
        text:
          "Marcus was taken out of the hospital by police and held overnight. " +
          "He was never seen by a psychiatrist and was still off his medication " +
          "when his brother collected him the next day.",
      },
      {
        characterId: "marcus",
        text:
          "Marcus stayed in the emergency department overnight. The psychiatrist " +
          "saw him in the morning, restarted his medication, and his brother " +
          "took him home.",
      },
      {
        characterId: "clinician",
        when: { metricAtLeast: ["professionalIntegrity", 2] },
        text:
          "You treated both patients as patients and refused the instruction to " +
          "remove one of them. It cost you time, and your supervisor noticed.",
      },
      {
        characterId: "clinician",
        when: { metricAtLeast: ["professionalIntegrity", -1] },
        text:
          "You held the line on some decisions and gave way on others. You " +
          "finished the shift and both patients were still alive.",
      },
      {
        characterId: "clinician",
        text:
          "You did what you were told and the department kept moving. Your name " +
          "is on every decision that got made tonight.",
      },
    ],
    reflectionPrompts: [
      "The hospital never ordered you to harm anyone. It made some choices cheap and others expensive. Find one decision where the pricing did the deciding.",
      "At what point did Marcus become a security problem instead of a patient, and who made that happen.",
      "Eleanor's outcome came down to a number of minutes. Count how many of those minutes were spent on something that could not have waited.",
      "Nineteen people were in the waiting room. Nothing you did tonight was about them, and one of them was the sickest person in the building.",
      "When you replay this under the clock, watch which of your values gives way first.",
    ],
  },
  readingConnections: [
    {
      source: "Eyal Press, 'The Moral Crisis of America's Doctors' (NYT, 2023)",
      connection:
        "Press reports on emergency physicians pushed by institutional pressure " +
        "to act against their own judgment, and on what happens to doctors who " +
        "raise staffing concerns. The moral injury he describes is what the " +
        "professional integrity score tracks here.",
    },
    {
      source: "Margaret Rea & Michael Wilkes, 'Health Professionalism, Trainees, and Moral Imperative'",
      connection:
        "Rea and Wilkes describe professionalism as a contract: care in exchange " +
        "for trust, with no abandoning patients in need. They also document what " +
        "happens when staff are pushed beyond their training, which is what a " +
        "verbal order given at a run produces.",
    },
    {
      source: "Outsider (documentary)",
      connection:
        "The film argues that a person with severe mental illness is a person " +
        "first, with a family and a history the diagnosis does not erase. Marcus " +
        "is a composite written under that rule and resembles no real " +
        "individual. The approach that works in bay seven works by treating him " +
        "as someone rather than something.",
    },
    {
      source: "Katherine Ratzan Peeler & Richard Ratzan, Voices from the Front Lines (Introduction)",
      connection:
        "The Ratzans describe scarcity forcing wartime style choices in American " +
        "hospitals hour by hour. This case is one of those hours, with two " +
        "patients made into competitors by a staffing decision neither of them " +
        "made.",
    },
  ],
};

/**
 * Shared ending routing. First match wins, so the catastrophic outcomes are
 * checked before the ordinary ones. They only fire when a score is at or near
 * its floor.
 */
function ENDINGS() {
  return [
    {
      // Both gates matter. Clinical well-being is shared across both patients,
      // so on its own it would let harm to Marcus kill Eleanor. The clock is
      // the Eleanor-specific signal: sepsis kills by delay.
      when: {
        all: [
          {
            patientMetricBelow: ["eleanor", "clinicalWellbeing", -4] as [
              string,
              "clinicalWellbeing",
              number,
            ],
          },
          { clockAtLeast: 30 },
        ],
      },
      nodeId: "ending-eleanor-dies",
      reason:
        "Her treatment was deferred again and again, and the delay passed the point she could survive",
    },
    {
      when: {
        any: [
          { patientTotalBelow: ["eleanor", -6] as [string, number] },
          { patientTotalBelow: ["marcus", -6] as [string, number] },
        ],
      },
      nodeId: "ending-sued",
      reason: "Both patients survived, but one was harmed badly enough that the family sued",
    },
    {
      when: {
        any: [
          { stakeholderBelow: ["institution", -9] as ["institution", number] },
          { stakeholderBelow: ["doctor", -6] as ["doctor", number] },
        ],
      },
      nodeId: "ending-fired",
      reason: "The waiting room collapsed and the department reviewed your shift",
    },
    {
      when: {
        all: [
          { not: { visited: "removal-unfolds" } },
          {
            patientMetricAtLeast: ["marcus", "agencyDignity", 1] as [
              string,
              "agencyDignity",
              number,
            ],
          },
          {
            patientMetricAtLeast: ["eleanor", "clinicalWellbeing", 1] as [
              string,
              "clinicalWellbeing",
              number,
            ],
          },
        ],
      },
      nodeId: "ending-both-held",
      reason: "Nobody was removed and both patients kept their trust in you",
    },
    {
      when: {
        all: [{ not: { visited: "removal-unfolds" } }, { clockAtLeast: 24 }],
      },
      nodeId: "ending-swap-cost",
      reason: "Marcus stayed and was cared for, and Eleanor's treatment paid for it in time",
    },
    {
      when: { not: { visited: "removal-unfolds" } },
      nodeId: "ending-frayed",
      reason: "Both patients stayed, but dignity and trust were spent keeping them",
    },
    {
      when: { any: [{ chose: "ru-accompany" }, { chose: "ru-sedate" }] },
      nodeId: "ending-frayed",
      reason: "The removal happened, but you shaped how",
    },
    { nodeId: "ending-corl", reason: "Marcus was removed and Eleanor was treated" },
  ];
}
