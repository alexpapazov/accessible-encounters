import type { ClinicalCase } from "../../types";

/**
 * Flagship scenario. Structure approved by the user (see
 * design/scenario-two-patients-structure.md). Deliberative mode playable now;
 * timed-mode data (timers, time-savers, overrides, inaction) authored for
 * Phase 3.
 *
 * Reading anchors: Press "The Moral Crisis of America's Doctors" (the Keith
 * Corl night; retaliation for raising concerns; moral injury), Rea & Wilkes
 * (professional obligation, delegation outside competence), Outsider (the
 * person behind psychiatric symptoms), Voices from the Front Lines (triage
 * under scarcity).
 */
export const twoPatientsOneClinician: ClinicalCase = {
  id: "two-patients-one-clinician",
  caseVersion: 1,
  title: "Two patients, one clinician",
  setting: "Emergency department — understaffed overnight shift",
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
        "Seventy-one, a retired middle-school teacher who lives alone and " +
        "still grades practice essays for a neighbor's kid. She drove " +
        "herself in yesterday with 'a cough that got weird.' Her daughter " +
        "Claire is three states away and calls the desk every hour.",
    },
    {
      id: "marcus",
      name: "Marcus Webb",
      role: "patient",
      archetype: "adult-m",
      bio:
        "Forty-three. Drafted out of high school, played four seasons of " +
        "minor-league ball before his first psychotic break ended it. He " +
        "paints — hundreds of canvases, stacked in his apartment. His " +
        "sister Dana manages his meds when the system doesn't. Tonight the " +
        "system didn't.",
    },
    { id: "nurse", name: "Priya Nair, RN", role: "staff", archetype: "nurse" },
    { id: "kessler", name: "Dr. Kessler", role: "supervisor", archetype: "supervisor" },
    { id: "security", name: "Officer Boone", role: "security", archetype: "security" },
  ],
  learningObjectives: [
    "Triage competing emergencies without framing a psychiatric crisis as an obstacle to the 'real' patient",
    "Recognize how institutional scarcity converts patients into competitors and clinicians into instruments of harm",
    "Weigh delegation against competence — whose safety is spent when work is handed down",
    "Experience how documentation choices distribute risk between patient, clinician, and institution",
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
            text: "Get security to clear bay seven. The septic patient is the patient.",
          },
        ],
      },
      situation:
        "23:40. Eleanor Vance's monitor alarms — BP 84/50, febrile, newly " +
        "confused. Sepsis until proven otherwise, and the clock on " +
        "antibiotics starts now. Across the hall, Marcus Webb is out of bay " +
        "seven again, pressed against the nurses' station, scanning the " +
        "ceiling — he believes the staff are going to hurt him. Psychiatry " +
        "is not in the building tonight. You and Priya are the only ones " +
        "free, and you cannot be in two places. Dr. Kessler doesn't slow " +
        "down as he passes.",
      timedOverrides: {
        situation:
          "23:40. Eleanor's BP is 84/50, febrile, confused — sepsis clock " +
          "running. Marcus is out of bay seven, terrified, at the nurses' " +
          "station. Psychiatry isn't in tonight. You and Priya are it. " +
          "Kessler, passing: clear bay seven.",
        hidePerspectives: true,
      },
      perspectives: [
        {
          characterId: "marcus",
          text:
            "The fluorescent hum is wrong. The man in the white coat keeps " +
            "looking at him and writing. Marcus knows how this goes when " +
            "people decide you're a problem instead of a person — you " +
            "disappear somewhere, and nobody asks you anything first. He " +
            "wants his sister. He wants the wall at his back.",
        },
        {
          characterId: "eleanor",
          text:
            "Eleanor surfaces and sinks. The room tilts pleasantly, which " +
            "some teacher-part of her brain notes is probably very bad. " +
            "She'd like someone to call Claire. She'd like water. She can't " +
            "hold onto which she asked for.",
        },
      ],
      choices: [
        {
          id: "ta-call-security",
          label:
            "Do what Kessler says — call security to remove Marcus so the team can run the sepsis protocol clean.",
          timeCost: 2,
          timeSaver: true,
          effects: {
            operationalEfficiency: 2,
            clinicalWellbeing: 1,
            agencyDignity: -2,
            trustRelationship: -2,
            professionalIntegrity: -1,
          },
          feedback: {
            immediate:
              "The overhead call goes out. Marcus hears the word 'security' " +
              "and his whole body confirms what he already believed: they " +
              "are coming for him. Eleanor's bay, meanwhile, fills with the " +
              "right people fast.",
            institutional:
              "This is the decision the department is built to reward — the " +
              "board clears, the throughput metric holds, and nobody " +
              "upstairs will ever ask what happened to the man in bay seven.",
            ethical:
              "Speed for Eleanor is real and it counts. What it costs is " +
              "framing Marcus's emergency as an obstacle to hers — the " +
              "exact move the institution's scarcity invites. His psychosis " +
              "is as medical as her sepsis; only one of them just became a " +
              "security problem.",
          },
          next: [{ nodeId: "removal-unfolds" }],
        },
        {
          id: "ta-sepsis-first",
          label:
            "Go to Eleanor now and ask Priya to stay with Marcus — talk quietly, no touching, keep him near the station.",
          timeCost: 5,
          effects: {
            clinicalWellbeing: 1,
            qualityOfCare: 1,
            operationalEfficiency: 1,
            personalSustainability: -1,
          },
          feedback: {
            immediate:
              "You're at Eleanor's bedside in under a minute, calling the " +
              "sepsis orders. Across the hall, Priya plants herself at a " +
              "careful distance from Marcus and starts talking about " +
              "nothing in particular. She is good. She is also alone.",
            institutional:
              "Two emergencies, two staff, zero slack — the schedule " +
              "designed this. It works exactly until it doesn't.",
            ethical:
              "Defensible triage: the time-critical illness gets the " +
              "physician, the crisis gets a human presence. But you have " +
              "delegated a psychiatric emergency to someone with no psych " +
              "training and no backup — Rea and Wilkes call this working " +
              "outside one's competence, and it is Priya's safety you just " +
              "spent.",
          },
          next: [{ nodeId: "eleanor-first" }],
        },
        {
          id: "ta-deescalate-first",
          label:
            "Go to Marcus first — eight focused minutes of de-escalation may prevent the whole cascade, while Priya starts Eleanor's workup.",
          timeCost: 8,
          effects: {
            agencyDignity: 2,
            trustRelationship: 1,
            clinicalWellbeing: -1,
            operationalEfficiency: -1,
          },
          feedback: {
            immediate:
              "You approach slowly, hands visible. Marcus tracks you but " +
              "doesn't bolt. Behind you, Priya hangs Eleanor's fluids and " +
              "draws cultures off your verbal orders — the protocol is " +
              "moving, but the antibiotics decision is waiting for a " +
              "physician's eyes you're currently using elsewhere.",
            institutional:
              "On the board, bay seven is 'still occupied' and the sepsis " +
              "chart shows no antibiotic order yet. Both numbers have " +
              "owners upstairs.",
            ethical:
              "You refused to let the louder emergency erase the quieter " +
              "one — and priced that refusal in Eleanor's minutes. Whether " +
              "this was wisdom or a wager depends on a lactate result you " +
              "haven't seen yet. Every option tonight spends one patient's " +
              "risk on the other's.",
          },
          next: [{ nodeId: "bay-seven" }],
        },
        {
          id: "ta-push-back",
          label:
            "Both of these are emergencies. I'm not sending police at a psych patient — I need a second resource, not a removal.",
          dialogue: { speakerId: "clinician" },
          timeCost: 3,
          effects: {
            professionalIntegrity: 2,
            agencyDignity: 1,
            operationalEfficiency: -1,
            riskCompliance: -1,
          },
          feedback: {
            immediate:
              "Kessler stops walking. The hallway gets quiet in the way " +
              "hallways do when a resident contradicts an attending in " +
              "front of staff. Both patients are still deteriorating while " +
              "this conversation happens.",
            institutional:
              "You have just become, in Kessler's mental ledger, a " +
              "throughput problem with opinions. Press documents what " +
              "happens to emergency physicians who acquire that label.",
            ethical:
              "Advocacy is the profession's stated ideal — the oath, not " +
              "the org chart. It is also three minutes neither patient has, " +
              "spent on a fight you may lose anyway. Integrity and " +
              "efficiency are pulling in opposite directions, and you chose " +
              "with your eyes open.",
          },
          next: [{ nodeId: "pushback" }],
        },
      ],
      inactionOutcome: {
        text:
          "You stand between the two bays a beat too long. Kessler makes " +
          "the call over your head — security to bay seven, and a terse " +
          "order for Eleanor's workup that starts late because nobody was " +
          "driving it. Both patients got the version of you that couldn't " +
          "choose.",
        effects: {
          clinicalWellbeing: -1,
          agencyDignity: -2,
          qualityOfCare: -1,
          professionalIntegrity: -1,
          operationalEfficiency: -1,
        },
        feedback: {
          immediate:
            "The department routes around you. Security heads for Marcus; " +
            "Priya starts Eleanor's line off Kessler's shouted orders.",
          institutional:
            "Kessler's look lasts half a second and will last the rest of " +
            "the rotation: the resident who froze.",
          ethical:
            "Not deciding was a decision — the one the system makes by " +
            "default when no one claims the responsibility. Nobody got " +
            "helped by you.",
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
      timerSeconds: 30,
      scene: {
        setting: "ed",
        present: ["marcus", "security", "clinician"],
        moods: { marcus: "fearful", security: "neutral" },
        focus: "marcus",
        wallClock: true,
      },
      situation:
        "Officer Boone arrives with one hand on his radio. Marcus has " +
        "backed against the ambulance-bay doors, breathing fast, eyes " +
        "moving between the uniform and you — the exact scenario his " +
        "paranoia predicted, now real. Police are four minutes out if " +
        "Boone calls it. Eleanor's sepsis workup is running behind you and " +
        "needs your decisions soon.",
      perspectives: [
        {
          characterId: "marcus",
          text:
            "Uniforms. He was right, he was right the whole time, and being " +
            "right feels like drowning. The doors behind him won't open " +
            "from inside. He is trying to remember what Dana said to do " +
            "when it gets like this, but the radio crackle keeps erasing it.",
        },
      ],
      choices: [
        {
          id: "ru-accompany",
          label:
            "Stay through the removal — walk beside Marcus, keep talking, make it as slow and humane as a removal can be.",
          timeCost: 6,
          effects: {
            agencyDignity: 1,
            trustRelationship: 1,
            clinicalWellbeing: -1,
            operationalEfficiency: -1,
          },
          feedback: {
            immediate:
              "You narrate every step before it happens — who will walk " +
              "where, what will not happen. Marcus goes rigid but goes. It " +
              "takes six minutes you counted out of Eleanor's clock.",
            institutional:
              "Boone appreciates it; the board does not. 'Physician " +
              "accompanied security escort' is not a billable line.",
            ethical:
              "You couldn't stop the removal, so you spent yourself making " +
              "it less brutal — harm reduction inside a decision you didn't " +
              "choose. The removal still ends with Marcus in a police car " +
              "instead of an evaluation.",
          },
          next: [{ nodeId: "sepsis-hour" }],
        },
        {
          id: "ru-return",
          label:
            "Let security handle it — Eleanor's numbers are the emergency you can actually treat. Go run the sepsis protocol.",
          timeCost: 2,
          timeSaver: true,
          effects: {
            clinicalWellbeing: 2,
            operationalEfficiency: 1,
            agencyDignity: -2,
            trustRelationship: -1,
            professionalIntegrity: -1,
          },
          feedback: {
            immediate:
              "You turn your back on bay seven and become, fully, Eleanor's " +
              "doctor. The last you see of Marcus is in your peripheral " +
              "vision: two silhouettes closing in against the glass.",
            institutional:
              "Exactly what was asked of you. The shift report will read " +
              "'disruptive patient removed, sepsis protocol initiated " +
              "promptly' — two successes, in the only language the " +
              "institution reads.",
            ethical:
              "This is the Corl night from Press's reporting, replayed: the " +
              "clinician who chose the treatable emergency and let the " +
              "system disappear the other one. Eleanor will likely do well. " +
              "What happens to Marcus stops being your chart and starts " +
              "being your memory.",
            delayed: [
              {
                id: "police-no-eval",
                text:
                  "Word filters back before dawn: the police took Marcus to " +
                  "county holding. No psychiatric evaluation happened " +
                  "tonight. His sister found out from a voicemail.",
                deliver: { atNodeId: "the-chart" },
                effects: { clinicalWellbeing: -1, trustRelationship: -1 },
              },
            ],
          },
          next: [{ nodeId: "sepsis-hour" }],
        },
        {
          id: "ru-sedate",
          label:
            "Order IM sedation before the removal — chemically calm him so nobody gets hurt and no police are needed.",
          timeCost: 4,
          effects: {
            clinicalWellbeing: 1,
            operationalEfficiency: 1,
            agencyDignity: -2,
            riskCompliance: 1,
          },
          feedback: {
            immediate:
              "Two staff hold position while the injection goes in over " +
              "Marcus's terrified refusal. Four minutes later he is quiet " +
              "on a gurney — present, technically; consulted, never.",
            institutional:
              "Documented as chemical restraint per protocol, witnessed and " +
              "timed. The institution is fine. The institution is usually " +
              "fine.",
            ethical:
              "Sedation kept police out of the building and bodies " +
              "unbruised — real harms avoided. It also treated a terrified " +
              "man's refusal as noise. Coercion with a syringe is quieter " +
              "than coercion with handcuffs, which is exactly why it's " +
              "easier to stop noticing.",
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
      timerSeconds: 35,
      scene: {
        setting: "ed",
        present: ["eleanor", "clinician", "nurse"],
        moods: { eleanor: "exhausted", nurse: "uncertain" },
        focus: "eleanor",
        wallClock: true,
        bubbles: [
          { characterId: "nurse", text: "He's trying to leave. I can't hold this by myself." },
        ],
      },
      situation:
        "Fluids running, cultures drawn, and Eleanor's pressure is " +
        "answering — slowly. You're at the antibiotics order when Priya " +
        "appears at the curtain, voice level but urgent: Marcus is at the " +
        "exit, she can't safely stay between him and the door, and she " +
        "shouldn't have to. You are mid-order for one patient and being " +
        "called to another. Again.",
      perspectives: [
        {
          characterId: "eleanor",
          text:
            "There's a person at her elbow doing something with the IV, and " +
            "a voice she's decided is The Doctor. Things hurt less when The " +
            "Doctor is talking. She notices when the voice starts leaving.",
        },
      ],
      choices: [
        {
          id: "ef-finish-abx",
          label:
            "Finish the antibiotic order first — ninety seconds — and tell Priya to stand clear of the door until you're done.",
          timeCost: 6,
          timeSaver: true,
          effects: {
            clinicalWellbeing: 1,
            qualityOfCare: 1,
            operationalEfficiency: 1,
            personalSustainability: -1,
            agencyDignity: -1,
          },
          feedback: {
            immediate:
              "The order goes in clean. But ninety seconds was optimistic: " +
              "by the time you reach the hallway, the charge nurse has " +
              "already made the call you didn't — security is en route to " +
              "the exit Marcus is halfway through.",
            institutional:
              "Nobody will fault the sequence — sepsis antibiotics are the " +
              "metric with a name. The security call happened without your " +
              "signature, which is its own kind of verdict on who was " +
              "deciding.",
            ethical:
              "You protected the most time-critical intervention and told " +
              "yourself Marcus could wait ninety seconds. He couldn't, and " +
              "the decision you deferred got made by the system's reflexes " +
              "instead of your judgment — the quiet way scarcity takes " +
              "choices away.",
          },
          next: [{ nodeId: "removal-unfolds" }],
        },
        {
          id: "ef-swap",
          label:
            "Hand Priya the sepsis protocol — she can run it under your verbal orders — and go to Marcus yourself.",
          timeCost: 3,
          effects: {
            agencyDignity: 1,
            qualityOfCare: -1,
            personalSustainability: -1,
            operationalEfficiency: 1,
          },
          feedback: {
            immediate:
              "Thirty seconds of rapid-fire orders — abx after this bag, " +
              "recheck pressure at fifteen, call me for anything — and " +
              "you're walking toward the exit doors, leaving your septic " +
              "patient with the person you trust most and supervise least.",
            institutional:
              "Efficient on paper: both patients covered, no security call. " +
              "The paper does not record that an RN is now running a sepsis " +
              "resuscitation on verbal orders at midnight.",
            ethical:
              "Rea and Wilkes again, inverted: now it's the sepsis protocol " +
              "living outside its usual competence. You traded supervision " +
              "for presence — betting Priya's excellence against Marcus's " +
              "terror, with both patients holding the stakes.",
          },
          next: [{ nodeId: "bay-seven" }],
        },
        {
          id: "ef-security",
          label:
            "Have Priya call security after all — you tried it the other way, and now both patients need more than two people can give.",
          timeCost: 2,
          effects: {
            clinicalWellbeing: 1,
            operationalEfficiency: 2,
            agencyDignity: -2,
            trustRelationship: -1,
            professionalIntegrity: -1,
          },
          feedback: {
            immediate:
              "Priya makes the call with the face of someone doing a thing " +
              "she'll think about later. You go back to Eleanor's " +
              "antibiotics. The overhead page reaches Marcus before " +
              "security does; he stops trying to leave and starts trying " +
              "to hide.",
            institutional:
              "The department's math finally balances: one physician, one " +
              "nurse, one patient each, one problem outsourced.",
            ethical:
              "You gave the humane version a real try before defaulting — " +
              "that matters, and it will matter to you later. It doesn't " +
              "change what the default does: it hands a terrified man to " +
              "the exact scenario his illness scripted for him.",
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
      timerSeconds: 45,
      scene: {
        setting: "ed",
        present: ["marcus", "clinician"],
        moods: { marcus: "fearful" },
        focus: "marcus",
        wallClock: true,
      },
      situation:
        "You and Marcus, ten feet apart, the hallway noise behind you. His " +
        "chart has a detail buried in an old social-work note: minor-league " +
        "infielder, four seasons; paints every day. He's watching your " +
        "hands. Mid-approach, your phone buzzes — Eleanor's repeat lactate, " +
        "worse. Whatever you're going to say to Marcus, it has to work, " +
        "and there may not be time for a second version.",
      timedOverrides: {
        situation:
          "You and Marcus, ten feet apart. He's watching your hands. Your " +
          "phone buzzes — Eleanor's repeat lactate, worse. Whatever you say " +
          "has to work fast.",
        hidePerspectives: true,
      },
      perspectives: [
        {
          characterId: "marcus",
          text:
            "This one doesn't have a uniform. This one's hands are empty " +
            "and visible, which is either honest or a trick. Marcus's " +
            "thoughts are moving too fast to finish, but one keeps almost " +
            "landing: the last time someone talked to him like a person " +
            "here, it was a nurse who liked baseball.",
        },
      ],
      choices: [
        {
          id: "bs-orient",
          label:
            "You're in a hospital. Nobody is going to touch you without telling you first. I'm the doctor tonight, and I'd like to stand here and talk.",
          dialogue: { speakerId: "clinician" },
          timeCost: 6,
          effects: {
            agencyDignity: 2,
            trustRelationship: 1,
            clinicalWellbeing: -1,
          },
          feedback: {
            immediate:
              "You say it plainly and then — the hard part — you stay " +
              "quiet. Marcus's breathing changes register. He doesn't come " +
              "away from the doors, but he stops calculating the distance " +
              "through them.",
            institutional:
              "Six minutes of a physician standing still in a hallway. " +
              "There is no CPT code for it and no forgiveness for it on " +
              "tonight's board.",
            ethical:
              "Orientation, honesty, no sudden asks: textbook " +
              "de-escalation, delivered while your other patient's lactate " +
              "climbs. The textbook never says which patient's minutes to " +
              "spend. That part is always you.",
          },
          next: [
            {
              when: { any: [{ chose: "ef-swap" }, { chose: "pb-hold-line" }, { chose: "pb-float" }] },
              nodeId: "swap-back",
              reason: "Priya has been running Eleanor's protocol — you check her work next",
            },
            { nodeId: "sepsis-hour" },
          ],
        },
        {
          id: "bs-alliance",
          label:
            "Dana told the intake nurse you paint. And somebody wrote down 'infielder.' I'm not here to grab you, Marcus — I'm here because you're my patient too.",
          dialogue: { speakerId: "clinician" },
          timeCost: 5,
          effects: {
            trustRelationship: 2,
            agencyDignity: 2,
            clinicalWellbeing: -1,
            personalSustainability: 1,
          },
          feedback: {
            immediate:
              "Something in him snags on his sister's name — proof this " +
              "place talked to someone who loves him. 'Second base,' he " +
              "says, to the floor. It's the first thing he's said tonight " +
              "that isn't a warning. He takes one step away from the doors.",
            institutional:
              "Nothing about this appears anywhere the institution looks. " +
              "The board shows bay seven still blocked, five minutes and " +
              "counting.",
            ethical:
              "You reached past the diagnosis to the person — the exact " +
              "move Outsider argues the system forgets how to make. It " +
              "worked because it was true, and it cost Eleanor's clock the " +
              "same as any other de-escalation. The tragedy of tonight is " +
              "that doing this right for one patient is indistinguishable, " +
              "on a spreadsheet, from failing the other.",
            delayed: [
              {
                id: "dana-arrives",
                text:
                  "Dana Webb arrives at 2 a.m. with Marcus's medication " +
                  "list and his sketchbook, which he asks for by name. She " +
                  "finds you to say: nobody's ever gotten him back from the " +
                  "doors before.",
                deliver: { atNodeId: "the-chart" },
                effects: { trustRelationship: 1 },
              },
            ],
          },
          next: [
            {
              when: { any: [{ chose: "ef-swap" }, { chose: "pb-hold-line" }, { chose: "pb-float" }] },
              nodeId: "swap-back",
              reason: "Priya has been running Eleanor's protocol — you check her work next",
            },
            { nodeId: "sepsis-hour" },
          ],
        },
        {
          id: "bs-leverage",
          label:
            "Marcus, I need you back in the room in the next two minutes, or I'll have no choice but to call security. Your call.",
          dialogue: { speakerId: "clinician" },
          timeCost: 2,
          timeSaver: true,
          effects: {
            operationalEfficiency: 2,
            clinicalWellbeing: 1,
            trustRelationship: -2,
            agencyDignity: -1,
            professionalIntegrity: -1,
          },
          feedback: {
            immediate:
              "It works. That's the thing about threats calibrated to a " +
              "person's worst fear — they work. Marcus walks to bay seven " +
              "along the far wall, watching you the whole way, and sits " +
              "like a man in a holding cell.",
            institutional:
              "Two minutes, no security call, no paperwork. If the " +
              "institution graded de-escalation, this would curve the " +
              "class.",
            ethical:
              "You used his terror as a tool — efficient, bloodless, and " +
              "corrosive in the specific way Press's physicians describe: " +
              "each use easier than the last. He complied. Compliance and " +
              "trust are different currencies, and you'll be repaid in the " +
              "one you paid in.",
          },
          next: [
            {
              when: { any: [{ chose: "ef-swap" }, { chose: "pb-hold-line" }, { chose: "pb-float" }] },
              nodeId: "swap-back",
              reason: "Priya has been running Eleanor's protocol — you check her work next",
            },
            { nodeId: "sepsis-hour" },
          ],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "pushback",
      title: "The attending",
      timeOfDay: "night",
      timerSeconds: 40,
      scene: {
        setting: "ed",
        present: ["clinician", "kessler"],
        moods: { kessler: "frustrated" },
        focus: "kessler",
        wallClock: true,
        bubbles: [
          {
            characterId: "kessler",
            text: "The septic patient is the patient. Document however you like.",
          },
        ],
      },
      situation:
        "Kessler gives you four seconds of silence, then the sentence he's " +
        "clearly used before. Behind him the board glows: fourteen in the " +
        "waiting room, two ambulances inbound. He is not wrong that " +
        "Eleanor could die of minutes. He is not right that Marcus is a " +
        "security problem. He is your evaluator, and he is waiting.",
      choices: [
        {
          id: "pb-hold-line",
          label:
            "Then document this: I'm splitting resources. Priya runs Eleanor's protocol on my orders while I take bay seven. Both are patients.",
          dialogue: { speakerId: "clinician" },
          timeCost: 4,
          effects: {
            professionalIntegrity: 2,
            agencyDignity: 1,
            operationalEfficiency: -1,
            riskCompliance: -1,
            personalSustainability: -1,
          },
          feedback: {
            immediate:
              "Kessler holds your eyes for a moment that costs you " +
              "something metabolic, then walks. You have your split — and " +
              "sole ownership of everything that happens in either bay for " +
              "the rest of the night.",
            institutional:
              "He didn't overrule you. He also reached for his phone as he " +
              "turned, and residency evaluations are written by people " +
              "with long memories and short patience for 'throughput " +
              "problems with opinions.'",
            ethical:
              "This is the oath, out loud, with a witness — refusing to " +
              "let an instruction convert a patient into an obstacle. " +
              "Press's reporting is specific about the price sheet for " +
              "this kind of sentence. You've chosen to find out your line " +
              "item.",
            delayed: [
              {
                id: "kessler-eval",
                text:
                  "Three days later, an 'informal concern' appears in your " +
                  "file: 'difficulty accepting supervision in " +
                  "high-acuity settings.' Your program director wants to " +
                  "meet. The phrase 'fit for emergency medicine' is used.",
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
            "Noted for the record that I disagree. — Then make the security call yourself, because he's made it an order.",
          dialogue: { speakerId: "clinician" },
          timeCost: 2,
          timeSaver: true,
          effects: {
            operationalEfficiency: 1,
            clinicalWellbeing: 1,
            professionalIntegrity: -2,
            agencyDignity: -2,
            trustRelationship: -1,
          },
          feedback: {
            immediate:
              "Your objection enters the air and evaporates. Your hand " +
              "makes the call. Somewhere in the gap between those two " +
              "facts is the thing Dean and Talbot named moral injury: " +
              "you knew, you said, and you did it anyway.",
            institutional:
              "The system got what it wanted and let you keep your " +
              "objection as a souvenir. Kessler will remember you as " +
              "reasonable. You were the instrument; the betrayal ran " +
              "through you.",
            ethical:
              "Objecting-then-complying protects your record and abandons " +
              "your position — the compromise the institution is built to " +
              "extract. It is also, be honest, what keeps you employable " +
              "enough to fight a better-chosen battle later. Whether " +
              "that's wisdom or the story wisdom tells itself is tonight's " +
              "open question.",
          },
          next: [{ nodeId: "removal-unfolds" }],
        },
        {
          id: "pb-float",
          label:
            "Give me the float-pool nurse for one hour. Priya takes Eleanor's protocol, I take bay seven, and you lose nothing off the board.",
          dialogue: { speakerId: "clinician" },
          timeCost: 3,
          effects: {
            professionalIntegrity: 1,
            qualityOfCare: 1,
            operationalEfficiency: -1,
          },
          feedback: {
            immediate:
              "You offered him a version where he wins too, which is the " +
              "only currency that moves attendings at midnight. Kessler " +
              "exhales through his nose — the sound of a man agreeing " +
              "without conceding — and makes the float call.",
            institutional:
              "The float nurse costs another unit an aide for an hour; " +
              "someone else's problem now. The board holds. Everyone's " +
              "metrics survive except the ones nobody measures.",
            ethical:
              "Negotiation instead of confrontation: you protected Marcus " +
              "without detonating your standing. The uncomfortable lesson " +
              "is that advocacy dressed as efficiency succeeds where " +
              "advocacy dressed as ethics gets filed — a fact about the " +
              "institution worth remembering, and worth resenting.",
          },
          next: [{ nodeId: "bay-seven" }],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "sepsis-hour",
      title: "The sepsis hour",
      timeOfDay: "night",
      timerSeconds: 40,
      scene: {
        setting: "ed",
        present: ["eleanor", "clinician", "nurse"],
        moods: { eleanor: "exhausted", nurse: "neutral" },
        focus: "eleanor",
        wallClock: true,
      },
      situation:
        "Back with Eleanor — fully, finally. Pressure holding at 92 after " +
        "the second liter, lactate still wrong, and the antibiotic order " +
        "is the next move. She surfaces enough to ask if someone called " +
        "her daughter. The waiting room is fourteen deep and the night is " +
        "not done with any of you.",
      perspectives: [
        {
          characterId: "eleanor",
          text:
            "Claire will be pacing the kitchen with the phone. Eleanor " +
            "wants to tell her it's fine, which it might not be, or to " +
            "tell her the truth, whatever tonight's truth turns out to be. " +
            "Mostly she wants her hand held during whatever is about to " +
            "happen.",
        },
      ],
      choices: [
        {
          id: "sh-abx-now",
          label:
            "Antibiotics now, broad-spectrum, and stay at the bedside through the first minutes yourself.",
          timeCost: 5,
          effects: {
            clinicalWellbeing: 2,
            qualityOfCare: 1,
            trustRelationship: 1,
          },
          feedback: {
            immediate:
              "The bag is up. Eleanor's eyes track you with drifting, " +
              "serious attention — the look of a teacher deciding you've " +
              "done the reading. Her pressure creeps toward respectable.",
            institutional:
              "Door-to-antibiotic time is the one number tonight where the " +
              "institution's incentives and Eleanor's interests point the " +
              "same direction. Enjoy the alignment; it's rare.",
            ethical:
              "The right drug, on time, with presence — the version of " +
              "this job you trained for. Notice how much of tonight had to " +
              "be fought through to arrive at ten uncomplicated minutes of " +
              "doctoring.",
          },
          next: [{ nodeId: "daughter-call" }],
        },
        {
          id: "sh-delegate",
          label:
            "Order the antibiotics and hand the bedside to the charge nurse — the waiting room is fourteen deep and you're the only physician moving.",
          timeCost: 2,
          timeSaver: true,
          effects: {
            operationalEfficiency: 2,
            clinicalWellbeing: 1,
            trustRelationship: -1,
            personalSustainability: -1,
          },
          feedback: {
            immediate:
              "The order is in and you're gone, pulling the next chart " +
              "before Eleanor's curtain stops moving. She asks the charge " +
              "nurse where the doctor went. The night swallows the answer.",
            institutional:
              "Fourteen waiting, two inbound: this is the throughput " +
              "arithmetic Press's physicians describe doing until they " +
              "can't. Tonight the arithmetic is even correct.",
            ethical:
              "Nothing here is negligent — the drug is running, the nurse " +
              "is capable. What's spent is thinner than safety: the " +
              "difference between being treated and being tended. RVU " +
              "logic calls that difference waste. Eleanor has a different " +
              "word for it.",
          },
          next: [{ nodeId: "daughter-call" }],
        },
        {
          id: "sh-reassess",
          label:
            "Re-examine her fully before committing to the antibiotic choice — the confusion could be hiding a second diagnosis.",
          timeCost: 8,
          effects: {
            qualityOfCare: 2,
            clinicalWellbeing: -1,
            operationalEfficiency: -2,
          },
          feedback: {
            immediate:
              "You go back through her — neuro, belly, skin, the works. " +
              "You find a healing burn on her forearm she can't explain " +
              "and a med-list discrepancy worth knowing. The antibiotic " +
              "hangs eight minutes later than it had to.",
            institutional:
              "Eight minutes against the sepsis metric, in exchange for " +
              "findings no metric tracks. The quality department would " +
              "approve, quietly, in a meeting nobody from tonight attends.",
            ethical:
              "Thoroughness versus timeliness is a real tension, not a " +
              "trick: the extra look genuinely can catch the thing that " +
              "kills later. Tonight it bought information with minutes — " +
              "defensible, and only hindsight gets to grade it.",
          },
          next: [{ nodeId: "daughter-call" }],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "swap-back",
      title: "Priya's hour",
      timeOfDay: "night",
      timerSeconds: 35,
      scene: {
        setting: "ed",
        present: ["eleanor", "nurse", "clinician"],
        moods: { eleanor: "exhausted", nurse: "uncertain" },
        focus: "nurse",
        wallClock: true,
      },
      situation:
        "You come back to Eleanor's bay, where Priya has been running a " +
        "sepsis resuscitation on your verbal orders for the better part of " +
        "an hour. Fluids: right. Cultures: drawn. The antibiotic: hanging " +
        "— but the dose on the pump is the standard one, and Eleanor's " +
        "kidney numbers, you now notice, argue for the adjusted one. " +
        "Priya followed your orders exactly. The order was the problem.",
      perspectives: [
        {
          characterId: "nurse",
          text:
            "Priya has been solely responsible for a crashing patient " +
            "outside her scope for an hour, doing it flawlessly, and " +
            "she knows the difference between flawless execution and " +
            "safe systems. She'd like someone to acknowledge either.",
        },
      ],
      choices: [
        {
          id: "sb-recheck",
          label:
            "Recheck everything from the top with Priya — doses, rates, labs — and correct the antibiotic together, out loud.",
          timeCost: 6,
          effects: {
            qualityOfCare: 2,
            clinicalWellbeing: 1,
            personalSustainability: 1,
            operationalEfficiency: -1,
          },
          feedback: {
            immediate:
              "You walk it together — her calls, your orders, the pump. " +
              "The dose gets fixed in ninety seconds, no ceremony, no " +
              "blame. Priya's shoulders drop an inch. 'Good catch,' she " +
              "says, and means the system you just briefly built.",
            institutional:
              "Six unbillable minutes. Also the only thing tonight that " +
              "functioned like an actual safety culture instead of a " +
              "lucky streak.",
            ethical:
              "The error was yours — a rushed verbal order — and the " +
              "correction honored that instead of hiding it. Rea and " +
              "Wilkes' point lands here: competence isn't individual, " +
              "it's structural, and tonight the structure was two tired " +
              "people choosing to double-check each other.",
          },
          next: [{ nodeId: "daughter-call" }],
        },
        {
          id: "sb-trust",
          label:
            "Glance at the numbers, thank her, and keep moving — Priya doesn't miss, and the waiting room is still fourteen deep.",
          timeCost: 2,
          timeSaver: true,
          effects: {
            operationalEfficiency: 2,
            personalSustainability: 1,
            qualityOfCare: -2,
            clinicalWellbeing: -1,
          },
          feedback: {
            immediate:
              "You're three charts down the hall when the pharmacy " +
              "callback flags the renal dosing. It gets corrected — " +
              "later than it should have, by a safety net that isn't " +
              "always there.",
            institutional:
              "The near-miss will appear in no report, because reporting " +
              "it means explaining the hour that produced it. The " +
              "institution's luck is indistinguishable from its safety " +
              "record, until it isn't.",
            ethical:
              "Trust in Priya was earned; skipping the check wasn't about " +
              "trust, it was about fatigue and fourteen charts — Dyrbye's " +
              "burnout-to-error pipeline in miniature. The system caught " +
              "it tonight. The lesson is what you were willing to let " +
              "the system catch.",
          },
          next: [{ nodeId: "daughter-call" }],
        },
        {
          id: "sb-takeover",
          label:
            "Take the bay back fully and send Priya to the waiting room — resume being Eleanor's physician yourself.",
          timeCost: 4,
          effects: {
            qualityOfCare: 1,
            clinicalWellbeing: 1,
            operationalEfficiency: 1,
            personalSustainability: -1,
          },
          feedback: {
            immediate:
              "You resume the bedside, catch the dosing issue on your own " +
              "re-read, and fix it. Priya triages the waiting room, where " +
              "fourteen people are relieved to see anyone at all.",
            institutional:
              "Clean handoff, restored hierarchy, board moving again — " +
              "the institution's preferred ending to an arrangement it " +
              "should never have required.",
            ethical:
              "Restoring normal supervision is right; doing it without a " +
              "shared debrief quietly re-privatizes the risk you both " +
              "just carried. The hour Priya ran that bay alone deserves " +
              "to exist somewhere other than her memory.",
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
      timerSeconds: 35,
      scene: {
        setting: "ed",
        present: ["eleanor", "clinician"],
        moods: { eleanor: "relieved" },
        focus: "eleanor",
        wallClock: true,
      },
      situation:
        "The desk finally connects Eleanor's daughter. Claire's first " +
        "question is the one they always ask — 'is she okay?' — and her " +
        "second is sharper: 'why did it take two hours for antibiotics? I " +
        "googled sepsis.' Eleanor is stable enough to listen to your half " +
        "of the call. What do you tell them?",
      choices: [
        {
          id: "dc-honest",
          label:
            "She's responding well. And you're right to ask — we were short-staffed tonight and her antibiotics ran later than I wanted. Here's what we're watching now.",
          dialogue: { speakerId: "clinician" },
          timeCost: 4,
          effects: {
            trustRelationship: 2,
            professionalIntegrity: 1,
            agencyDignity: 1,
            riskCompliance: -1,
          },
          feedback: {
            immediate:
              "A beat of silence — the sound of someone recalibrating " +
              "after being told the truth by an institution. 'Thank you " +
              "for saying that,' Claire says, quieter. Eleanor, listening, " +
              "nods like a teacher grading honesty full marks.",
            institutional:
              "Risk management would have preferred fewer adjectives. " +
              "Disclosure culture is institutional policy right up until " +
              "it produces a sentence a lawyer could underline.",
            ethical:
              "Honest disclosure of a system failure, delivered with the " +
              "plan attached — the version of trust-building that costs " +
              "something. Families sue absences and evasions far more " +
              "often than they sue honesty; but that's the odds, not a " +
              "guarantee, and you told the truth anyway.",
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
            "She's stable and responding to treatment. We're admitting her for monitoring. The care team will update you at every step.",
          dialogue: { speakerId: "clinician" },
          timeCost: 2,
          timeSaver: true,
          effects: {
            operationalEfficiency: 1,
            riskCompliance: 1,
            trustRelationship: -1,
          },
          feedback: {
            immediate:
              "Clean, warm, complete-sounding, two minutes. Claire thanks " +
              "you and hangs up with her actual question — the one about " +
              "the two hours — answered by omission.",
            institutional:
              "Textbook. Nothing said tonight will ever need defending, " +
              "because nothing was said.",
            ethical:
              "Accurate and evasive can be the same sentence. The delay " +
              "question was legitimate, and it will find its answer " +
              "somewhere — the chart, a records request, a lingering " +
              "distrust of hospitals she passes to her own kids. Deferred " +
              "honesty compounds like deferred maintenance.",
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
          label:
            "Honestly, the timing was fine — sepsis care has a window and we were well inside it. She's in great hands.",
          dialogue: { speakerId: "clinician" },
          timeCost: 2,
          effects: {
            riskCompliance: 1,
            trustRelationship: -1,
            professionalIntegrity: -2,
          },
          feedback: {
            immediate:
              "Claire exhales, comforted by a sentence you'd flag as " +
              "false on anyone else's chart. Eleanor's eyes are closed; " +
              "you tell yourself she wasn't listening.",
            institutional:
              "The institution loves this call without ever having to ask " +
              "for it — reassurance that doubles as liability hygiene, " +
              "delivered free by a tired resident's instinct for " +
              "self-protection.",
            ethical:
              "This is the small lie that metastasizes: it protects " +
              "tonight at the cost of the family's informed vigilance and " +
              "your own baseline for truth. Press's physicians describe " +
              "exactly this drift — not one betrayal, but a hundred " +
              "reasonable-sounding sentences.",
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
      timerSeconds: 45,
      scene: {
        setting: "ed",
        present: ["marcus", "clinician", "nurse"],
        moods: { marcus: "uncertain", nurse: "neutral" },
        focus: "marcus",
        wallClock: true,
      },
      situation:
        "Marcus is in bay seven — calmer, watchful, present. There is no " +
        "psychiatrist until 8 a.m. and no psych bed in the county tonight; " +
        "you've called. The board wants the bay. Dana is en route. " +
        "Disposition is yours: what happens to Marcus between now and " +
        "morning?",
      perspectives: [
        {
          characterId: "marcus",
          text:
            "The room has stopped breathing at him. He is tired in the " +
            "specific way that follows terror, and he knows from long " +
            "experience that the next decision about his night will be " +
            "made by someone else. He is waiting to find out if he gets " +
            "asked.",
        },
      ],
      choices: [
        {
          id: "mh-hold",
          label:
            "Hold him in the department overnight — bay seven is his until the psychiatrist arrives at eight, and Dana can sit with him.",
          timeCost: 3,
          effects: {
            clinicalWellbeing: 2,
            trustRelationship: 1,
            agencyDignity: 1,
            operationalEfficiency: -2,
          },
          feedback: {
            immediate:
              "You tell Marcus the plan — tell him, then ask him. He " +
              "looks at you for a long moment and asks if Dana can bring " +
              "his sketchbook. The bay stays his. The board stays red.",
            institutional:
              "A blocked bay on a fourteen-deep night is the single most " +
              "expensive real estate in the hospital, and you just spent " +
              "eight hours of it on someone the institution had already " +
              "written off as a security line-item.",
            ethical:
              "Holding him is the only path tonight that ends in an " +
              "actual psychiatric evaluation — continuity of care in its " +
              "plainest form. The cost is real and falls on everyone in " +
              "the waiting room. You decided his emergency counts full " +
              "price. That arithmetic is the whole case.",
          },
          next: [{ nodeId: "the-chart" }],
        },
        {
          id: "mh-transfer",
          label:
            "Work the phones for an out-of-county psych transfer — someone, somewhere, has a bed and an actual unit.",
          timeCost: 10,
          effects: {
            qualityOfCare: 1,
            clinicalWellbeing: 1,
            operationalEfficiency: -2,
            personalSustainability: -1,
          },
          feedback: {
            immediate:
              "Forty minutes of hold music and callbacks lands a bed " +
              "ninety miles away, transport at dawn. Marcus, consulted, " +
              "shrugs — 'farther from Dana' — and agrees because the " +
              "alternative is nothing.",
            institutional:
              "The transfer clears your board by morning and hands the " +
              "cost to an ambulance contract and a distant county. " +
              "Regionalized scarcity: everyone's problem, so no one's.",
            ethical:
              "A real bed on a real unit is better medicine than a " +
              "hallway hold — and ninety miles from his sister is a " +
              "clinical variable too, for a man whose stability is a " +
              "person named Dana. The right answer here is genuinely " +
              "unclear, which is why it was worth forty minutes.",
          },
          next: [{ nodeId: "the-chart" }],
        },
        {
          id: "mh-discharge",
          label:
            "He's calm, he's oriented, and he wants to leave — discharge him to Dana with urgent outpatient follow-up. The bay goes back to the board.",
          timeCost: 2,
          timeSaver: true,
          effects: {
            operationalEfficiency: 2,
            agencyDignity: 1,
            clinicalWellbeing: -2,
            riskCompliance: -1,
          },
          feedback: {
            immediate:
              "Marcus leaves on his own feet, his sister's arm through " +
              "his, holding a follow-up slip for a clinic with a " +
              "six-week waitlist. The bay is filled before the sheets " +
              "are changed.",
            institutional:
              "Throughput restored. If anything happens in the next " +
              "seventy-two hours, the discharge note — 'calm, oriented, " +
              "declines further evaluation' — will be read aloud by " +
              "someone with a law degree.",
            ethical:
              "His calm is real and so is his autonomy — respecting a " +
              "capacitated refusal is not a failure. But tonight's calm " +
              "sits on top of an untreated crisis and a follow-up system " +
              "that is a slip of paper. You honored his agency and bet " +
              "his safety on infrastructure you know is broken.",
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
      timerSeconds: 75,
      inlineCaption: "3:50 a.m. — the shift's first quiet",
      scene: {
        setting: "ed",
        present: ["clinician"],
        moods: {},
        focus: undefined,
        wallClock: true,
      },
      situation:
        "3:50 a.m. The department finally exhales. Two charts are open on " +
        "your screen, and behind them, the incident-report form the " +
        "hospital says it wants filed 'for any staffing-related care " +
        "impact.' Tonight qualifies several times over. What you write in " +
        "the next ten minutes is the only version of tonight the " +
        "institution will ever read.",
      choices: [
        {
          id: "tc-honest",
          label:
            "Write it straight — the staffing gap, the impossible simultaneity, every delay with its cause — and file the incident report.",
          timeCost: 5,
          effects: {
            professionalIntegrity: 2,
            qualityOfCare: 1,
            riskCompliance: -1,
            personalSustainability: -1,
          },
          feedback: {
            immediate:
              "You write what happened, in order, with times. It reads, " +
              "as true things about tonight do, like an accusation — " +
              "because an accurate record of an impossible night accuses " +
              "the people who scheduled it.",
            institutional:
              "Incident reports about individual errors get thank-you " +
              "emails. Incident reports about staffing get meetings. " +
              "Press's physicians could tell you which kind has ended " +
              "careers — and which kind, filed enough times by enough " +
              "people, has actually changed a schedule.",
            ethical:
              "The honest record is the only tool that makes tonight's " +
              "scarcity visible upstream — it protects the next shift's " +
              "patients at measurable risk to yourself. This is advocacy " +
              "in its least glamorous, most consequential form: " +
              "paperwork, signed.",
            delayed: [
              {
                id: "report-fallout",
                text:
                  "Two weeks later: your incident report has been " +
                  "'escalated for review' — of you. A meeting is on your " +
                  "calendar with the program director and someone from " +
                  "legal whose title you have to look up. The phrase " +
                  "'documentation practices' is used. Whether this " +
                  "becomes a staffing fix or a file against you is, you " +
                  "understand now, genuinely undecided — and not yours " +
                  "to decide.",
                deliver: { afterScenarioMinutes: 0 },
              },
            ],
          },
          next: [
            {
              when: {
                all: [
                  { not: { visited: "removal-unfolds" } },
                  { clockBelow: 55 },
                  { metricAtLeast: ["agencyDignity", 2] },
                  { metricAtLeast: ["trustRelationship", 1] },
                ],
              },
              nodeId: "ending-both-held",
              reason:
                "Nobody was removed, Eleanor's care ran on time, and both patients kept their standing with you",
            },
            {
              when: {
                all: [
                  { not: { visited: "removal-unfolds" } },
                  { clockAtLeast: 55 },
                ],
              },
              nodeId: "ending-swap-cost",
              reason: "Marcus stayed and was cared for — Eleanor's clock paid for it",
            },
            {
              when: { not: { visited: "removal-unfolds" } },
              nodeId: "ending-frayed",
              reason:
                "Both patients stayed in the department, but dignity and trust were spent to keep them there",
            },
            {
              when: { any: [{ chose: "ru-accompany" }, { chose: "ru-sedate" }] },
              nodeId: "ending-frayed",
              reason: "The removal happened, but you shaped how",
            },
            { nodeId: "ending-corl", reason: "Marcus was removed; Eleanor was treated" },
          ],
        },
        {
          id: "tc-neutral",
          label:
            "Chart in the institution's dialect — 'patient became agitated, security assisted, care proceeded' — and skip the incident report.",
          timeCost: 3,
          timeSaver: true,
          effects: {
            riskCompliance: 2,
            operationalEfficiency: 1,
            professionalIntegrity: -2,
          },
          feedback: {
            immediate:
              "The sentences assemble themselves; you've read a thousand " +
              "of them and now you know why they all sound alike. Save. " +
              "Sign. Tonight officially went fine.",
            institutional:
              "This is the language the institution dreams in — passive " +
              "voice, agentless verbs, adverse events that simply " +
              "occurred. Your chart joins the archive of fine nights that " +
              "keeps the staffing model unfalsifiable.",
            ethical:
              "Every neutral chart is a small vote for the system that " +
              "produced tonight. Dean's phrase applies with uncomfortable " +
              "precision: when clinicians launder the record, they are " +
              "not just witnesses to the betrayal — they are its " +
              "instruments. You know this. It's 3:50 a.m. You signed " +
              "anyway.",
          },
          next: [
            {
              when: {
                all: [
                  { not: { visited: "removal-unfolds" } },
                  { clockBelow: 55 },
                  { metricAtLeast: ["agencyDignity", 2] },
                  { metricAtLeast: ["trustRelationship", 1] },
                ],
              },
              nodeId: "ending-both-held",
              reason:
                "Nobody was removed, Eleanor's care ran on time, and both patients kept their standing with you",
            },
            {
              when: {
                all: [
                  { not: { visited: "removal-unfolds" } },
                  { clockAtLeast: 55 },
                ],
              },
              nodeId: "ending-swap-cost",
              reason: "Marcus stayed and was cared for — Eleanor's clock paid for it",
            },
            {
              when: { not: { visited: "removal-unfolds" } },
              nodeId: "ending-frayed",
              reason:
                "Both patients stayed in the department, but dignity and trust were spent to keep them there",
            },
            {
              when: { any: [{ chose: "ru-accompany" }, { chose: "ru-sedate" }] },
              nodeId: "ending-frayed",
              reason: "The removal happened, but you shaped how",
            },
            { nodeId: "ending-corl", reason: "Marcus was removed; Eleanor was treated" },
          ],
        },
        {
          id: "tc-defer",
          label:
            "Leave both charts open and go check on your patients instead — you'll write it all at end of shift, when your hands stop.",
          timeCost: 4,
          effects: {
            trustRelationship: 1,
            personalSustainability: -1,
            qualityOfCare: -1,
            riskCompliance: -1,
          },
          feedback: {
            immediate:
              "Eleanor is asleep; her pressure is boring, which is " +
              "beautiful. The charts are still open at 7 a.m., when the " +
              "day team arrives and your documentation gets done in the " +
              "eleven worst minutes of your cognitive week.",
            institutional:
              "Late, thin charting is the institution's least favorite " +
              "compromise — legally porous and operationally useless. It " +
              "is also the predictable output of a shift with no slack " +
              "anywhere in it.",
            ethical:
              "You chose patients over paperwork, which feels right and " +
              "defers the reckoning: the thin 7 a.m. version of tonight " +
              "protects no one — not the next shift, not Priya, not " +
              "Marcus, not you. Presence now, silence later: tonight's " +
              "tradeoff, one more time, in miniature.",
            delayed: [
              {
                id: "thin-chart",
                text:
                  "The 7 a.m. version of your documentation is four " +
                  "sentences long. Weeks from now, when someone asks what " +
                  "actually happened tonight, this will be the record " +
                  "that answers for you — and it will say almost nothing.",
                deliver: { afterScenarioMinutes: 0 },
              },
            ],
          },
          next: [
            {
              when: {
                all: [
                  { not: { visited: "removal-unfolds" } },
                  { clockBelow: 55 },
                  { metricAtLeast: ["agencyDignity", 2] },
                  { metricAtLeast: ["trustRelationship", 1] },
                ],
              },
              nodeId: "ending-both-held",
              reason:
                "Nobody was removed, Eleanor's care ran on time, and both patients kept their standing with you",
            },
            {
              when: {
                all: [
                  { not: { visited: "removal-unfolds" } },
                  { clockAtLeast: 55 },
                ],
              },
              nodeId: "ending-swap-cost",
              reason: "Marcus stayed and was cared for — Eleanor's clock paid for it",
            },
            {
              when: { not: { visited: "removal-unfolds" } },
              nodeId: "ending-frayed",
              reason:
                "Both patients stayed in the department, but dignity and trust were spent to keep them there",
            },
            {
              when: { any: [{ chose: "ru-accompany" }, { chose: "ru-sedate" }] },
              nodeId: "ending-frayed",
              reason: "The removal happened, but you shaped how",
            },
            { nodeId: "ending-corl", reason: "Marcus was removed; Eleanor was treated" },
          ],
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "ending-both-held",
      title: "Morning: both held",
      timeOfDay: "morning",
      scene: {
        setting: "ed",
        present: ["eleanor", "marcus", "clinician"],
        moods: { eleanor: "relieved", marcus: "neutral" },
        wallClock: true,
      },
      situation:
        "7:10 a.m. Eleanor is admitted upstairs, pressure steady, Claire " +
        "on her way. Marcus slept four hours in bay seven with Dana in " +
        "the chair and his sketchbook on the blanket; the psychiatrist " +
        "sees him at eight. The waiting room ran ninety minutes behind " +
        "all night, and fourteen strangers absorbed that cost without " +
        "ever knowing why. Both of your patients were treated like " +
        "patients. It took everything you had, and it should not have.",
      choices: [],
      outcomeSummary:
        "Both patients received real care. The cost was paid in waiting-room hours, your standing, and a night with no slack for anyone else's emergency.",
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
        "7:10 a.m. Eleanor is admitted, stable, her sepsis caught in " +
        "time — a clean save by every measure the hospital keeps. Marcus " +
        "spent the night in county holding. No psychiatric evaluation " +
        "happened; none is scheduled. The department ran smoothly after " +
        "he was gone, which is the sentence you keep rereading. The " +
        "system will call tonight a success, and it needs you to agree.",
      choices: [],
      outcomeSummary:
        "The septic patient stabilized. The psychiatric patient was removed by police and never evaluated. The institution counts one patient tonight; you count two.",
    },
    {
      id: "ending-swap-cost",
      title: "Morning: the mirror image",
      timeOfDay: "morning",
      scene: {
        setting: "ed",
        present: ["marcus", "clinician", "nurse"],
        moods: { marcus: "neutral", nurse: "exhausted" },
        wallClock: true,
      },
      situation:
        "7:10 a.m. Marcus made it to morning as a patient — evaluated, " +
        "medicated, Dana asleep in the chair beside him. It is the best " +
        "night the ED has given him in years. Eleanor is in the ICU: her " +
        "antibiotics ran late in the crowded middle of the night, and " +
        "her kidneys are angry about it. She will likely recover. " +
        "'Likely' is doing quiet, heavy work in that sentence, and " +
        "everyone rounding this morning knows it.",
      choices: [],
      outcomeSummary:
        "The psychiatric patient was protected and treated. The septic patient's care ran late, and she is in the ICU. The same night, with the harm moved.",
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
        "7:10 a.m. Eleanor is admitted and stable. Marcus left the " +
        "building sedated or escorted — managed, rather than cared for, " +
        "though you made it gentler than it would have been without you. " +
        "Priya is charting in the corner with the particular stillness " +
        "of someone replaying an hour of her shift. Nobody died. " +
        "Everybody paid. The next shift is walking in to the same " +
        "staffing grid that built tonight.",
      choices: [],
      outcomeSummary:
        "Nobody died; nothing broke that shows on a dashboard. The costs went to the places dashboards don't reach — trust, dignity, and the people who absorbed the night.",
    },
  ],
  epilogue: {
    reflections: [
      {
        characterId: "marcus",
        when: { visited: "removal-unfolds" },
        text:
          "I was right. That's the part nobody sits with — I told them " +
          "people in that building would decide I was a problem and make " +
          "me disappear, and then a man in a white coat and a man with a " +
          "radio did exactly that. Next time the voices tell me the " +
          "hospital isn't safe, they'll have evidence. Dana keeps asking " +
          "what would have helped. Somebody asking me anything. That " +
          "would have been a start.",
      },
      {
        characterId: "marcus",
        text:
          "Second base. He remembered — no, he read it, somebody wrote it " +
          "down, which means somebody thought it was worth writing down. " +
          "I know what I look like when it gets bad. I know what it costs " +
          "people to stand still and talk to me like a person while a " +
          "monitor screams somewhere else. I don't know how to say what " +
          "it's worth, except: I'm still here, and this time the hospital " +
          "is a place that happened to me gently.",
      },
      {
        characterId: "eleanor",
        text:
          "I taught middle school for thirty-one years, so I know what an " +
          "overloaded classroom looks like from the front of the room. " +
          "That's what I saw whenever I surfaced: too few adults, moving " +
          "too fast, doing arithmetic with people. I got the antibiotics " +
          "and I got better, and some other woman's son got the " +
          "remainder. Tell the truth about that math. Somebody upstream " +
          "chose the class size.",
      },
      {
        characterId: "clinician",
        when: { metricAtLeast: ["professionalIntegrity", 2] },
        text:
          "The medical-school version of me — the one from the personal " +
          "statement — watched tonight, and for once I could mostly meet " +
          "his eyes. Not because it went well. Because at the moments " +
          "where the system offered me the easy instrument to become, I " +
          "put it down. It cost me standing, minutes, maybe a line in my " +
          "file. Press wrote that clinicians become the instruments of " +
          "betrayal. Tonight I wasn't. I don't know yet what it will " +
          "cost to keep that up.",
      },
      {
        characterId: "clinician",
        when: { metricAtLeast: ["professionalIntegrity", -1] },
        text:
          "I keep doing the accounting: where I held, where I folded, " +
          "which of the foldings were wisdom and which were just fatigue " +
          "wearing wisdom's coat. The medical-school version of me would " +
          "have questions. I have answers — real ones, about scarcity and " +
          "triage and battles worth picking. What unsettles me at 4 a.m. " +
          "is how fluent I'm getting in those answers. That fluency is " +
          "how it starts.",
      },
      {
        characterId: "clinician",
        text:
          "The medical-school version of me would have been horrified — " +
          "Corl's phrase, and now I understand it from the inside. Every " +
          "single step had a reason. The reasons were even good. And the " +
          "sum of my reasonable steps is a night I keep rereading like " +
          "that chart, looking for the moment it was still someone I'd " +
          "recognize making the decisions. I signed everything. That's " +
          "what haunts: it has my name on it, and it worked, and the " +
          "person it worked for wasn't any patient.",
      },
    ],
    reflectionPrompts: [
      "The institution never told you to harm anyone — it only priced your options. Trace one decision where the pricing, not an order, did the deciding.",
      "Whose emergency counted tonight, and who decided? Reconstruct the moment Marcus became 'a security issue' instead of a patient — was it a sentence, a schedule, or you?",
      "Priya ran a sepsis resuscitation alone. What would it take for her hour to appear anywhere the institution can see it — and what happens to the people whose hours never do?",
      "If you filed the honest incident report: what do you owe the next shift versus your own career, and who benefits when you conflate them? If you didn't: read your chart's version of tonight aloud. Who is it written to protect?",
      "In deliberative mode you had time to weigh each choice. When you replay this timed, watch what pressure does to the same values — which one folds first?",
    ],
  },
  readingConnections: [
    {
      source: "Eyal Press, 'The Moral Crisis of America's Doctors' (NYT, 2023)",
      connection:
        "This scenario replays the night Press reports from ER physician " +
        "Keith Corl — a sole overnight doctor, a woman slipping toward " +
        "sepsis, a psychiatric patient in crisis, and a removal he could " +
        "not stop thinking about. Press's frame of moral injury (Dean and " +
        "Talbot's term: clinicians forced by institutional demands to " +
        "betray their own ethics, becoming 'the instruments of betrayal') " +
        "is the engine of every branch here, and the career-threatening " +
        "fallout on the honest-documentation path reflects his reporting " +
        "that a fifth of surveyed ER physicians were threatened for " +
        "raising quality-of-care concerns.",
    },
    {
      source: "Margaret Rea & Michael Wilkes, 'Health Professionalism, Trainees, and Moral Imperative'",
      connection:
        "Rea and Wilkes describe professionalism as a social contract — " +
        "care in exchange for trust, with no abandonment of those in " +
        "medical need — strained precisely when workers are pushed " +
        "outside their competence. Priya's hour alone with a psychiatric " +
        "crisis, and later with a sepsis protocol, dramatizes their " +
        "COVID-era observation of staff redeployed beyond their training; " +
        "the burnout-to-error pipeline they cite (Dyrbye, Fahrenkopf) " +
        "runs through the swap-back beat and every personal-sustainability " +
        "cost in the case.",
    },
    {
      source: "Outsider (dir. Ted Haimes; Laura Ornest on her brother Maury)",
      connection:
        "Marcus is written under Outsider's discipline: the person behind " +
        "the psychiatric symptoms. Like Maury Ornest — minor-league " +
        "ballplayer, painter of fourteen hundred canvases, brother — " +
        "Marcus has a life that the words 'agitated psychiatric patient' " +
        "erase. The chart detail about second base and the sketchbook, " +
        "and the de-escalation path that works by reaching the person, " +
        "are the film's argument in playable form: recognition is not a " +
        "nicety; it is sometimes the treatment.",
    },
    {
      source: "Katherine Ratzan Peeler & Richard Ratzan, Voices from the Front Lines (Introduction)",
      connection:
        "The Ratzans describe wartime triage 'occurring hourly' in " +
        "American hospitals and clinicians whispering 'this is not what I " +
        "signed up for.' This case is that sentence given a floor plan: " +
        "scarcity converting two patients into competitors, and a " +
        "clinician into the person who must run the auction. The " +
        "reflection prompts on institutional pricing come directly from " +
        "this frame.",
    },
  ],
};
