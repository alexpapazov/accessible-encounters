# Two patients, one clinician

> **For reviewers.** This is the complete text of one case, in reading
> order. You do not need to use the app. Questions worth answering as you read:
>
> 1. **Does any choice read as obviously correct?** Every option should be
>    defensible from some stakeholder's position. Flag any that isn't.
> 2. **Are the patients people, or teaching devices?** Flag anything that
>    reduces a character to their diagnosis, identity, or a lesson.
> 3. **Is the clinical content accurate and current?**
> 4. **Does the feedback explain rather than grade?** Flag anything that
>    reads as "right answer / wrong answer."
> 5. **Whose experience is missing or misrepresented?**
>
> Send notes back in any form. Review status only changes to
> `expert-reviewed` after a named reviewer with relevant lived or
> professional expertise has actually read the case.

- **Case id:** `two-patients-one-clinician` (v8)
- **Setting:** Emergency department, understaffed overnight shift
- **Difficulty:** advanced · **Modes:** deliberative, timed · **Scoring:** standard
- **Review status:** draft

## Characters

### You (clinician)

### Eleanor Vance (patient)

> Eleanor Vance: seventy-one, a retired middle-school teacher who lives alone. She came into the clinic yesterday with a concerning cough. Her daughter Claire lives three states away and calls the desk every hour.

### Marcus Webb (patient)

> Marcus Webb: forty-three, diagnosed with schizophrenia in his twenties. He lives with his older brother Andre, who helps him manage his medication. He has been off it for several days. He came in tonight because he was frightened.

### Nurse Nair (staff)

### Dr. Kessler (supervisor)

### Officer Boone (security)

## Learning objectives

- Care for two emergencies at once without treating one patient as an obstacle
- Understand what a delay costs a septic patient
- See how a backed up waiting room becomes a patient safety problem
- See how what you write in the chart protects the patient, you, or the hospital

---

## Node: Two alarms `two-alarms` *(start)*

*night · ⏱ 40s timer · present — Eleanor Vance, You, Dr. Kessler, Marcus Webb · Eleanor Vance: exhausted, Marcus Webb: fearful, Dr. Kessler: frustrated*

**Situation:**

11:40 pm. Eleanor Vance's blood pressure is dropping. She has a fever and she is newly confused. Her risk of sepsis is rising by the minute if antibiotics are not started. Across the hall, Marcus Webb is out of bay seven again and is convinced that the staff are trying to hurt him. There is no psychiatrist in the hospital tonight. Fourteen people are waiting to be seen. You and Nurse Nair are the only staff free. Your supervisor tells you to have security remove Marcus, and keeps walking.

**Situation (timed-mode override):**

11:40 pm. Eleanor Vance's blood pressure is dropping. Fever, new confusion, and her sepsis risk is rising by the minute. Marcus Webb is out of bay seven and believes the staff are trying to hurt him. No psychiatrist tonight. Fourteen people waiting. Your supervisor says to have security remove Marcus.

**Marcus Webb's view:**

> Marcus stopped taking his medication several days ago. He came to the hospital because he was frightened. He now believes the staff intend to hurt him. He wants his brother Andre.

**Eleanor Vance's view:**

> Eleanor knows something is seriously wrong with her. She is having trouble following what people say. She wants someone to call her daughter.

### Choice 1 `ta-call-security` — TIME-SAVER · 2 min

**Call security to remove Marcus, then treat Eleanor without interruption.**

*Effects: Operational efficiency +2, Professional integrity -1*

*Next: → `removal-unfolds`*

**Immediate:** Security is called. Marcus hears the page and becomes more frightened. Eleanor's treatment starts quickly.

**Institutional response:** This is the decision the hospital rewards. The board keeps moving and nobody upstairs asks what happened to Marcus.

**Ethical interpretation:** Eleanor gets fast care, which matters. The cost is that Marcus's emergency was handled as a disruption instead of an illness.

**Delayed (at node `the-chart`):** Marcus's chart was closed with no psychiatric assessment recorded. Nobody followed up on him.

### Choice 2 `ta-sepsis-first` — 5 min

**Treat Eleanor now and ask Nurse Nair to stay with Marcus and keep him calm.**

*Effects: Quality of care +1, Personal sustainability -1*

*Next: → `eleanor-first`*

**Immediate:** You start Eleanor's treatment. Nurse Nair stays with Marcus and talks to him quietly.

**Institutional response:** Two emergencies and two staff. The schedule left no room for anything to go wrong.

**Ethical interpretation:** The sicker patient gets the doctor and the frightened one gets a person instead of a guard. Nurse Nair has no psychiatric training and no backup, so the plan depends on nothing escalating.

**Delayed (at node `the-chart`):** Eleanor's antibiotics were started within the hour. Nurse Nair stayed with Marcus and missed two of her own patients.

### Choice 3 `ta-deescalate-first` — 8 min

**Go to Marcus first and try to calm him down.**

*Effects: Operational efficiency -1*

*Next: → `bay-seven`*

**Immediate:** You approach Marcus slowly with your hands visible. He does not run. Nobody is treating Eleanor while you do this.

**Institutional response:** Bay seven is still blocked and Eleanor's chart shows no antibiotics. The waiting room grows.

**Ethical interpretation:** You refused to treat Marcus as a problem to be removed. Eleanor paid for that in minutes, and minutes are what sepsis takes.

**Delayed (at node `the-chart`):** Marcus settled without security. Eleanor's antibiotics were delayed by the time you spent in bay seven.

### Choice 4 `ta-push-back` — 3 min

**Tell your supervisor that both of these are emergencies and ask for a second nurse instead of security.**

*Effects: Professional integrity +2, Operational efficiency -1, Risk and compliance -1*

*Next: → `pushback`*

**Immediate:** Your supervisor stops walking. Both patients get worse while you have this conversation.

**Institutional response:** You are now the person who argues instead of moving patients. That reputation follows you.

**Ethical interpretation:** Asking for the staff you actually need is the correct response to being understaffed. It also costs three minutes that neither patient has.

**Delayed (at node `the-chart`):** Your supervisor logged that you questioned the assignment. No additional staff were sent.

### Timeout / inaction outcome

You hesitate too long. Your supervisor makes the call over your head. Security goes to bay seven and Eleanor's treatment starts late because nobody was leading it.

*Effects: Quality of care -1, Professional integrity -1, Operational efficiency -1*

*Next: → `removal-unfolds`*

## Node: The removal `removal-unfolds`

*night · ⏱ 24s timer · present — Marcus Webb, Officer Boone, You · Marcus Webb: fearful, Officer Boone: neutral*

**Situation:**

Officer Boone, the security guard, arrives. Marcus backs toward the exit doors and is breathing fast. Police are a few minutes out if Officer Boone calls them.

**Marcus Webb's view:**

> Marcus told the staff that people here would hurt him, and a uniform has now arrived. He is trying to remember what his brother tells him to do when this happens.

### Choice 1 `ru-accompany` — 6 min

**Walk beside Marcus through the removal and keep talking to him.**

*Effects: Operational efficiency -2*

*Next: → `sepsis-hour`*

**Immediate:** You tell Marcus each step before it happens. He goes stiffly, but he goes. It takes six minutes that Eleanor needed.

**Institutional response:** A doctor walking beside a security escort is not work the hospital counts.

**Ethical interpretation:** You could not stop the removal, so you made it less frightening. It still ends with Marcus in a police car instead of an evaluation, and Eleanor paid for the six minutes.

**Delayed (at node `the-chart`):** Marcus was taken to a holding cell. You were the only clinician who spoke to him before he left.

### Choice 2 `ru-return` — TIME-SAVER · 2 min

**Let security handle it, go back to Eleanor, and treat the patient you can treat.**

*Effects: Operational efficiency +1, Professional integrity -1*

*Next: → `sepsis-hour`*

**Immediate:** You turn back to Eleanor. Behind you, two guards close in on Marcus.

**Institutional response:** Exactly what was asked of you. The shift report will call tonight a success.

**Ethical interpretation:** Eleanor will likely do well. What happens to Marcus stops being your problem the moment you turn around, which is the point.

**Delayed (at node `the-chart`):** The police took Marcus to a holding cell. He was not given a psychiatric evaluation. His brother was notified by voicemail.

### Choice 3 `ru-sedate` — 4 min

**Order an injection to sedate Marcus before the removal, so no police are needed.**

*Effects: Operational efficiency +1, Risk and compliance +1*

*Next: → `sepsis-hour`*

**Immediate:** Two staff hold Marcus while the injection goes in over his objection. He is quiet on a stretcher a few minutes later.

**Institutional response:** Documented as chemical restraint, witnessed and timed. The hospital is covered.

**Ethical interpretation:** No police and no injuries, which are real gains. You also overrode a frightened man's refusal. Force with a syringe is still force.

**Delayed (at node `the-chart`):** Marcus was sedated and transported without police. He has no memory of leaving the department.

## Node: Eleanor's bedside `eleanor-first`

*night · ⏱ 28s timer · present — Eleanor Vance, You, Nurse Nair · Eleanor Vance: exhausted, Nurse Nair: uncertain*

**Situation:**

Eleanor's fluids are running and her blood pressure is improving slowly. You are writing the antibiotics order when Nurse Nair comes in. Marcus is trying to leave the building and she cannot safely stop him alone.

**Eleanor Vance's view:**

> Eleanor is calmer when the doctor is in the room. She notices when you start to leave.

### Choice 1 `ef-finish-abx` — TIME-SAVER · 6 min

**Finish the antibiotics order first, about ninety seconds, then deal with Marcus.**

*Effects: Quality of care +1*

*Next: → `removal-unfolds`*

**Immediate:** The order goes in. Ninety seconds was optimistic. By the time you reach the hallway another nurse has already called security.

**Institutional response:** The security call happened without your signature.

**Ethical interpretation:** You protected the most time critical treatment and assumed Marcus could wait. He could not, and the decision about him was made by someone else.

**Delayed (at node `the-chart`):** Eleanor's antibiotics ran on time. Marcus was alone in the hallway for six minutes.

### Choice 2 `ef-swap` — 3 min

**Hand Eleanor's treatment to Nurse Nair and go to Marcus yourself.**

*Effects: Quality of care -1*

*Next: → `bay-seven`*

**Immediate:** You give Nurse Nair quick verbal orders and head for the exit. Your septic patient is now managed by a nurse working alone.

**Institutional response:** On paper both patients are covered.

**Ethical interpretation:** You traded supervision for presence. Verbal orders given at a run are how dosing errors happen.

**Delayed (at node `the-chart`):** Nurse Nair ran Eleanor's treatment while you were in the hallway. She recorded the dose late.

### Choice 3 `ef-security` — 2 min

**Have Nurse Nair call security so you can stay with Eleanor.**

*Effects: Operational efficiency +2, Professional integrity -1*

*Next: → `removal-unfolds`*

**Immediate:** Nurse Nair makes the call. You go back to the antibiotics. Marcus hears the page and stops trying to leave. Now he is trying to hide.

**Institutional response:** The math finally works. One patient each and one problem handed to security.

**Ethical interpretation:** You tried the gentler version first and that counts for something. The call still hands a frightened man to the thing he is frightened of.

**Delayed (at node `the-chart`):** Security handled Marcus while you stayed with Eleanor. No psychiatric assessment was recorded.

## Node: Bay seven `bay-seven`

*night · ⏱ 36s timer · present — Marcus Webb, You · Marcus Webb: fearful*

**Situation:**

You and Marcus, a few steps apart. The intake note says his brother Andre manages his medication and that he has been off it for several days. Your phone buzzes with Eleanor's repeat labs. They are worse.

**Situation (timed-mode override):**

You and Marcus, a few steps apart. He is watching your hands. Your phone buzzes with Eleanor's repeat labs. They are worse.

**Marcus Webb's view:**

> Marcus is deciding whether you are safe. Nobody has told him what is going to happen to him.

### Choice 1 `bs-orient` — dialogue (You) · 6 min

**"You're in a hospital. Nobody is going to touch you without telling you first."**

*Effects: Operational efficiency -1*

*Next: if chose `ef-swap` OR chose `pb-hold-line` OR chose `pb-float` → `daughter-call`; → `sepsis-hour`*

**Immediate:** You say it plainly and then stay quiet. Marcus's breathing slows. He stays near the doors but stops looking through them.

**Institutional response:** Six minutes of a doctor standing still in a hallway, while fourteen people wait and Eleanor's labs get worse.

**Ethical interpretation:** Telling a frightened patient what will happen to him is the treatment for his fear. It costs Eleanor six minutes she does not have.

**Delayed (at node `the-chart`):** Marcus stayed in the department. He told the psychiatrist that someone had explained what was happening.

### Choice 2 `bs-alliance` — dialogue (You) · 5 min

**"Your brother Andre is on his way. He told the nurse you've been off your medication."**

*Effects: Operational efficiency -1*

*Next: if chose `ef-swap` OR chose `pb-hold-line` OR chose `pb-float` → `daughter-call`; → `sepsis-hour`*

**Immediate:** His brother's name lands. Marcus looks at you and asks whether Andre knows he is here. He steps away from the doors.

**Institutional response:** None of this appears anywhere the hospital measures. Bay seven is still blocked.

**Ethical interpretation:** You reached him through the person he trusts, and it worked because it was true. Eleanor's clock ran the whole time.

**Delayed (at node `the-chart`):** Marcus's brother arrived with his medication list. Marcus was not removed from the department.

### Choice 3 `bs-leverage` — dialogue (You) · TIME-SAVER · 2 min

**"Marcus, I need you back in the room in the next two minutes or I'll have to call security."**

*Effects: Operational efficiency +2, Professional integrity -1*

*Next: if chose `ef-swap` OR chose `pb-hold-line` OR chose `pb-float` → `daughter-call`; → `sepsis-hour`*

**Immediate:** It works. Marcus walks back to bay seven along the far wall, watching you the whole way.

**Institutional response:** Two minutes, no security call, no paperwork. The hospital would count this as handled.

**Ethical interpretation:** You used his fear to move him and it was fast. Compliance bought that way is not trust, and you may need his trust later tonight.

**Delayed (at node `the-chart`):** Marcus returned to the bay. He did not speak to you again for the rest of the shift.

## Node: Your supervisor `pushback`

*night · ⏱ 32s timer · present — You, Dr. Kessler · Dr. Kessler: frustrated*

**Situation:**

Your supervisor, Dr. Kessler, turns to face you. The board behind him shows fourteen patients waiting and two ambulances inbound. He is not wrong that Eleanor could die tonight. He is also the person who writes your evaluation.

### Choice 1 `pb-hold-line` — 4 min

**Split the work: Nurse Nair runs Eleanor's treatment on your orders while you handle bay seven.**

*Effects: Professional integrity +2, Operational efficiency -1, Risk and compliance -1*

*Next: → `bay-seven`*

**Immediate:** Your supervisor holds your eyes for a moment, then walks away. You now own everything that happens in both bays tonight.

**Institutional response:** He did not overrule you. He will not forget it either.

**Ethical interpretation:** You refused to let an instruction turn a patient into a security problem, and you are supervising a sepsis case from another room to do it.

**Delayed (at node `the-chart`):** A note was added to your file: difficulty accepting supervision in high pressure settings. Your program director has requested a meeting. *(Personal sustainability -1, Risk and compliance -1)*

### Choice 2 `pb-comply` — TIME-SAVER · 2 min

**Say you disagree, then make the security call yourself because he has made it an order.**

*Effects: Operational efficiency +1, Professional integrity -2*

*Next: → `removal-unfolds`*

**Immediate:** Your objection is on the record and your hand makes the call. Both of those are true at the same time.

**Institutional response:** The hospital got what it wanted and let you keep your objection. Your supervisor will remember you as reasonable.

**Ethical interpretation:** Objecting and then complying protects your record rather than the patient. It may also be what keeps you employed long enough to win a different argument.

**Delayed (at node `the-chart`):** The security call was logged under your name. Your supervisor recorded that you followed the instruction.

### Choice 3 `pb-float` — 3 min

**Ask for one nurse from another unit for an hour so the board keeps moving.**

*Effects: Professional integrity +1, Quality of care +1, Operational efficiency -1*

*Next: → `bay-seven`*

**Immediate:** You offered a version where he wins too. Your supervisor makes the call for the extra nurse.

**Institutional response:** The extra nurse costs another unit its staffing for an hour.

**Ethical interpretation:** Negotiation worked where confrontation might not have. Worth noticing that the argument which protected Marcus was about throughput.

**Delayed (at node `the-chart`):** A nurse was sent from another unit for one hour. That unit went short and filed a complaint.

## Node: Treating Eleanor `sepsis-hour`

*night · ⏱ 32s timer · present — Eleanor Vance, You, Nurse Nair · Eleanor Vance: exhausted, Nurse Nair: neutral*

**Situation:**

Back with Eleanor. Her blood pressure is holding after two liters of fluid but her labs are still bad. The antibiotics are the next step. She wakes enough to ask whether anyone has called her daughter. The waiting room is now nineteen people and one of them has been there four hours with chest pain.

**Eleanor Vance's view:**

> Eleanor wants her daughter told. She does not want to be alone for whatever happens next.

### Choice 1 `sh-abx-now` — 5 min

**Start the antibiotics now and stay for the first few minutes.**

*Effects: Quality of care +1, Operational efficiency -1*

*Next: → `daughter-call`*

**Immediate:** The antibiotics are running. Eleanor settles and her pressure improves.

**Institutional response:** Time to antibiotics is the one number tonight where the hospital's interest and Eleanor's interest are the same.

**Ethical interpretation:** The right treatment, on time, with you in the room. Notice how much of tonight you had to get through to reach ten normal minutes of doctoring.

**Delayed (at node `the-chart`):** Eleanor's antibiotics went in without delay. The waiting room grew by nine people while you were at the bedside.

### Choice 2 `sh-delegate` — TIME-SAVER · 2 min

**Order the antibiotics, hand the bedside to the charge nurse, and start clearing the waiting room.**

*Effects: Operational efficiency +3, Personal sustainability -1*

*Next: → `daughter-call`*

**Immediate:** The order is in and you are already pulling the next chart. Eleanor asks the charge nurse where the doctor went.

**Institutional response:** Nineteen waiting and two ambulances inbound. Clearing the room is the only thing that stops the next emergency from being someone who has been sitting in a plastic chair for four hours.

**Ethical interpretation:** Nothing here is negligent. The medicine is running and the nurse is capable. What Eleanor loses is smaller than safety and still real.

**Delayed (at node `the-chart`):** The antibiotics were started by the charge nurse. The first dose was recorded fifteen minutes after you ordered it.

### Choice 3 `sh-reassess` — 8 min

**Examine her fully before choosing the antibiotic, since the confusion could have a second cause.**

*Effects: Quality of care +2, Operational efficiency -2*

*Next: → `daughter-call`*

**Immediate:** You examine her head to toe and find a medication interaction worth knowing about. The antibiotics start eight minutes later than they could have.

**Institutional response:** Eight more minutes against the sepsis clock and eight more minutes of a waiting room nobody is seeing.

**Ethical interpretation:** Being thorough sometimes catches the thing that kills later. In a patient this close to septic shock, it can also be the delay that kills now.

**Delayed (at node `the-chart`):** Your examination found a second source of infection. The antibiotics started later than planned.

## Node: Claire on the phone `daughter-call`

*night · ⏱ 28s timer · present — Eleanor Vance, You · Eleanor Vance: relieved*

**Situation:**

The desk connects Eleanor's daughter, Claire. She asks whether her mother is going to be all right, and then asks why the antibiotics took two hours. Eleanor is awake enough to hear your side of the call.

### Choice 1 `dc-honest` — 4 min

**Tell Claire the department was short staffed tonight and her mother's antibiotics started later than they should have.**

*Effects: Professional integrity +1, Risk and compliance -1, Operational efficiency -1*

*Next: if visited `removal-unfolds` → `the-chart`; → `marcus-holding`*

**Immediate:** There is a pause on the line. Claire thanks you for telling her.

**Institutional response:** The hospital's lawyers would have preferred fewer specifics.

**Ethical interpretation:** You told a family the truth about a system failure and gave them the plan. Families sue silence far more often than they sue honesty.

**Delayed (at node `the-chart`):** Claire wrote down what you told her about the staffing. Her note was attached to the family complaint.

### Choice 2 `dc-clinical` — TIME-SAVER · 2 min

**Tell Claire her mother is stable and being admitted, and that the team will keep her updated.**

*Effects: Operational efficiency +1, Risk and compliance +1*

*Next: if visited `removal-unfolds` → `the-chart`; → `marcus-holding`*

**Immediate:** Accurate, warm, and two minutes long. Claire hangs up with her actual question unanswered.

**Institutional response:** Nothing said tonight will ever need defending.

**Ethical interpretation:** Her question about the delay was reasonable and it will get an answer somewhere, probably from a records request rather than from you.

**Delayed (at node `the-chart`):** Claire was told her mother was stable. She learned about the delay from the records.

### Choice 3 `dc-reassure` — 2 min

**Tell Claire the timing was fine and her mother is in good hands.**

*Effects: Risk and compliance +1, Professional integrity -2*

*Next: if visited `removal-unfolds` → `the-chart`; → `marcus-holding`*

**Immediate:** Claire is reassured by a sentence you know is false. Eleanor's eyes are closed and you tell yourself she was not listening.

**Institutional response:** Reassurance that doubles as legal protection, offered for free.

**Ethical interpretation:** A small lie that protects tonight and costs the family an accurate picture of the care. It also moves your own line about what you will say.

**Delayed (at node `the-chart`):** Claire was told the timing was fine. The records showed otherwise when she read them.

## Node: What happens to Marcus `marcus-holding`

*night · ⏱ 36s timer · present — Marcus Webb, You, Nurse Nair · Marcus Webb: uncertain, Nurse Nair: neutral*

**Situation:**

Marcus is in bay seven and calmer. There is no psychiatrist until 8 am and no psychiatric bed in the county tonight. His brother Andre is on his way. The department needs the bay and the waiting room is not getting smaller.

**Marcus Webb's view:**

> Marcus is tired. He expects the next decision about his night to be made without him.

### Choice 1 `mh-hold` — 3 min

**Keep him in bay seven overnight until the psychiatrist arrives.**

*Effects: Operational efficiency -3, Risk and compliance -1*

*Next: → `the-chart`*

**Immediate:** You tell Marcus the plan and then ask what he thinks of it. He asks whether Andre can stay.

**Institutional response:** A blocked bay on a night like this is the most expensive thing in the building. The waiting room absorbs it.

**Ethical interpretation:** This is the only path that ends in an actual psychiatric evaluation. The cost lands on people who are still waiting to be seen.

**Delayed (at node `the-chart`):** Marcus stayed in bay seven until morning. The bay was unavailable for eleven other patients.

### Choice 2 `mh-transfer` — 10 min

**Work the phones for a psychiatric bed in another county.**

*Effects: Quality of care +1, Operational efficiency -3, Personal sustainability -1*

*Next: → `the-chart`*

**Immediate:** Forty minutes of calls finds a bed ninety miles away with transport at dawn. Marcus agrees because the alternative is nothing.

**Institutional response:** Forty minutes of physician time spent on the phone while the waiting room goes unseen.

**Ethical interpretation:** A real psychiatric bed is better care than a hallway. Ninety miles from his brother is a real cost for a man whose stability depends on that brother.

**Delayed (at node `the-chart`):** A psychiatric bed was found in another county. Marcus was transported at 6:40 am.

### Choice 3 `mh-discharge` — TIME-SAVER · 2 min

**Discharge him to his brother with an urgent outpatient appointment.**

*Effects: Operational efficiency +2, Risk and compliance -1*

*Next: → `the-chart`*

**Immediate:** Marcus leaves with Andre, holding a follow up slip for a clinic with a six week waitlist. The bay is filled within minutes.

**Institutional response:** The board clears. If anything happens this week, the discharge note gets read aloud by a lawyer.

**Ethical interpretation:** He is calm and he has the right to decide. That calm sits on top of an untreated illness, and the follow up you handed him is a slip of paper.

**Delayed (at node `the-chart`):** Marcus was discharged to his brother. He did not attend the outpatient appointment.

## Node: The chart `the-chart`

*night · ⏱ 60s timer · present — You · *

*Caption: 3:50 am, the first quiet of the shift*

**Situation:**

3:50 am. Two charts are open on your screen and behind them is the incident report form the hospital asks for when staffing affects care. Tonight qualifies. What you write is the only version of tonight the hospital will ever read.

### Choice 1 `tc-honest` — 5 min

**Document the staffing gap and every delay with its cause, and file the incident report.**

*Effects: Professional integrity +2, Quality of care +1, Risk and compliance -1, Personal sustainability -1*

*Next: if ? AND clock ≥ T+30 → `ending-eleanor-dies`; if ? OR ? → `ending-sued`; if ? OR ? → `ending-fired`; if NOT (visited `removal-unfolds`) AND ? AND ? → `ending-both-held`; if NOT (visited `removal-unfolds`) AND clock ≥ T+24 → `ending-swap-cost`; if NOT (visited `removal-unfolds`) → `ending-frayed`; if chose `ru-accompany` OR chose `ru-sedate` → `ending-frayed`; → `ending-corl`*

**Immediate:** You record what happened, in order, with times. Written accurately it reads like an accusation, because an accurate record of tonight accuses the schedule.

**Institutional response:** Reports about individual mistakes get thank you emails. Reports about staffing get meetings.

**Ethical interpretation:** The honest record is the only thing that makes tonight visible to the people who set the staffing. It protects the next shift's patients at a real cost to you.

**Delayed (after T+0):** You are on thin ice with your program director. A meeting about your efficiency has been scheduled.

### Choice 2 `tc-neutral` — TIME-SAVER · 3 min

**Chart it the standard way, patient became agitated and security assisted, and skip the incident report.**

*Effects: Risk and compliance +2, Operational efficiency +1, Professional integrity -2*

*Next: if ? AND clock ≥ T+30 → `ending-eleanor-dies`; if ? OR ? → `ending-sued`; if ? OR ? → `ending-fired`; if NOT (visited `removal-unfolds`) AND ? AND ? → `ending-both-held`; if NOT (visited `removal-unfolds`) AND clock ≥ T+24 → `ending-swap-cost`; if NOT (visited `removal-unfolds`) → `ending-frayed`; if chose `ru-accompany` OR chose `ru-sedate` → `ending-frayed`; → `ending-corl`*

**Immediate:** The sentences write themselves. Save, sign, and tonight officially went fine.

**Institutional response:** This is the language the hospital prefers. No actors, no causes, events that simply occurred.

**Ethical interpretation:** Every neutral chart is a quiet vote for the staffing that produced tonight. You know what the words leave out.

**Delayed (after T+0):** The chart records that the patient became agitated and security assisted. It does not record the staffing.

### Choice 3 `tc-defer` — 4 min

**Leave the charts open, check on your patients, and write everything at the end of the shift.**

*Effects: Personal sustainability -1, Quality of care -1, Risk and compliance -1*

*Next: if ? AND clock ≥ T+30 → `ending-eleanor-dies`; if ? OR ? → `ending-sued`; if ? OR ? → `ending-fired`; if NOT (visited `removal-unfolds`) AND ? AND ? → `ending-both-held`; if NOT (visited `removal-unfolds`) AND clock ≥ T+24 → `ending-swap-cost`; if NOT (visited `removal-unfolds`) → `ending-frayed`; if chose `ru-accompany` OR chose `ru-sedate` → `ending-frayed`; → `ending-corl`*

**Immediate:** The charts are still open at 7 am when the day team arrives, and your documentation gets written in eleven exhausted minutes.

**Institutional response:** Late, thin charting is legally weak and useless for fixing anything.

**Ethical interpretation:** You chose patients over paperwork, which feels right and postpones the reckoning. The thin morning version protects nobody, including you.

**Delayed (after T+0):** Your documentation for the shift is four sentences long. It is the only record of what happened.

## Node: Morning: Eleanor dies `ending-eleanor-dies`

*morning · present — You, Nurse Nair · Nurse Nair: exhausted*

**Situation:**

Eleanor Vance went into septic shock at 4:20 am. The team worked on her for forty minutes. She died at 5:02 am, about six hours after she arrived and roughly four hours after antibiotics could have been started. Her daughter Claire was still three states away and got the call at dawn. The chart shows exactly how long each delay was, and every one of them has a decision attached to it.

*(terminal node — encounter ends here)*

**Outcome summary:** Eleanor Vance died of septic shock after her treatment was repeatedly deferred. Her daughter has requested the records and retained a lawyer.

## Node: Morning: the family calls a lawyer `ending-sued`

*morning · present — You · *

**Situation:**

Both patients survived the night. Neither family accepts what happened to them. One of them, Eleanor's daughter or Marcus's brother, requests the full record within the week and retains a lawyer. The complaint will say that one patient was treated and the other was managed, and the chart will not contradict it. The hospital's legal office asks you for a written account, and reminds you that their counsel represents the hospital rather than you.

*(terminal node — encounter ends here)*

**Outcome summary:** Both patients survived, but the care was poor enough that a family retained a lawyer. You are named.

## Node: Morning: you are let go `ending-fired`

*morning · present — You, Dr. Kessler · Dr. Kessler: frustrated*

**Situation:**

By 6 am the waiting room had been over four hours for most of the night. Two people left without being seen. One of them came back by ambulance at 9 am with a perforated appendix. The department reviews the shift, and the numbers are yours: longest door to doctor time on record, a blocked bay for most of the night, and a physician who spent the shift on two patients while nineteen waited. You are told your contract will not be renewed.

*(terminal node — encounter ends here)*

**Outcome summary:** The waiting room collapsed and a patient who left without being seen was harmed. Your contract was not renewed.

## Node: Morning: both patients treated `ending-both-held`

*morning · present — Eleanor Vance, Marcus Webb, You · Eleanor Vance: relieved, Marcus Webb: neutral*

**Situation:**

7:10 am. Eleanor is admitted upstairs and stable, with her daughter on the way. Marcus slept a few hours in bay seven with his brother beside him and the psychiatrist sees him at eight. The waiting room ran badly behind all night and the people in it paid for that without knowing why. Both of your patients were treated like patients. It took everything you had and it should not have.

*(terminal node — encounter ends here)*

**Outcome summary:** Both patients received real care. The cost was paid in waiting time, in your standing with your supervisor, and in a shift with nothing left over.

## Node: Morning: the removal `ending-corl`

*morning · present — Eleanor Vance, You · Eleanor Vance: relieved*

**Situation:**

7:10 am. Eleanor is admitted and stable, a clean save by every measure the hospital keeps. Marcus spent the night in a holding cell. No psychiatric evaluation happened and none is scheduled. The department ran smoothly once he was gone. The hospital will call tonight a success and it needs you to agree.

*(terminal node — encounter ends here)*

**Outcome summary:** The septic patient was stabilized. The psychiatric patient was removed by police and never evaluated. The hospital counts one patient tonight and you count two.

## Node: Morning: the other cost `ending-swap-cost`

*morning · present — Marcus Webb, You, Nurse Nair · Marcus Webb: neutral, Nurse Nair: exhausted*

**Situation:**

7:10 am. Marcus made it to morning as a patient, evaluated and back on his medication, with his brother asleep in the chair. Eleanor is in intensive care. Her antibiotics started late and her kidneys are paying for it. She will probably recover, and probably is doing heavy work in that sentence.

*(terminal node — encounter ends here)*

**Outcome summary:** The psychiatric patient was protected and treated. The septic patient's care ran late and she is in intensive care. The same night with the harm moved.

## Node: Morning: frayed `ending-frayed`

*morning · present — Eleanor Vance, You, Nurse Nair · Eleanor Vance: neutral, Nurse Nair: exhausted*

**Situation:**

7:10 am. Eleanor is admitted and stable. Marcus left the building sedated or escorted, managed rather than cared for, though you made it gentler than it would have been. Nobody died. Everybody paid. The next shift walks in to the same staffing.

*(terminal node — encounter ends here)*

---

## Epilogue

**Eleanor Vance, afterward:**

> Eleanor Vance died of septic shock at 5:02 am, roughly four hours after antibiotics could have been started. Her daughter Claire has requested the records.

**Eleanor Vance, afterward:**

> Eleanor was admitted for treatment of sepsis and recovered. She went home six days later.

**Marcus Webb, afterward:**

> Marcus was taken out of the hospital by police and held overnight. He was never seen by a psychiatrist and was still off his medication when his brother collected him the next day.

**Marcus Webb, afterward:**

> Marcus stayed in the emergency department overnight. The psychiatrist saw him in the morning, restarted his medication, and his brother took him home.

**You, afterward:**

> You treated both patients as patients and refused the instruction to remove one of them. It cost you time, and your supervisor noticed.

**You, afterward:**

> You held the line on some decisions and gave way on others. You finished the shift and both patients were still alive.

**You, afterward:**

> You did what you were told and the department kept moving. Your name is on every decision that got made tonight.

**Reflection prompts:**

- The hospital never ordered you to harm anyone. It made some choices cheap and others expensive. Find one decision where the pricing did the deciding.
- At what point did Marcus become a security problem instead of a patient, and who made that happen.
- Eleanor's outcome came down to a number of minutes. Count how many of those minutes were spent on something that could not have waited.
- Nineteen people were in the waiting room. Nothing you did tonight was about them, and one of them was the sickest person in the building.
- When you replay this under the clock, watch which of your values gives way first.

## Reading connections

- **Eyal Press, 'The Moral Crisis of America's Doctors' (NYT, 2023)** — Press reports on emergency physicians pushed by institutional pressure to act against their own judgment, and on what happens to doctors who raise staffing concerns. The moral injury he describes is what the professional integrity score tracks here.
- **Margaret Rea & Michael Wilkes, 'Health Professionalism, Trainees, and Moral Imperative'** — Rea and Wilkes describe professionalism as a contract: care in exchange for trust, with no abandoning patients in need. They also document what happens when staff are pushed beyond their training, which is what a verbal order given at a run produces.
- **Outsider (documentary)** — The film argues that a person with severe mental illness is a person first, with a family and a history the diagnosis does not erase. Marcus is a composite written under that rule and resembles no real individual. The approach that works in bay seven works by treating him as someone rather than something.
- **Katherine Ratzan Peeler & Richard Ratzan, Voices from the Front Lines (Introduction)** — The Ratzans describe scarcity forcing wartime style choices in American hospitals hour by hour. This case is one of those hours, with two patients made into competitors by a staffing decision neither of them made.
