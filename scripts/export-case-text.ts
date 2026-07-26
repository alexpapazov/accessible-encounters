/**
 * Exports every registered case as a readable Markdown "script" for review.
 *
 * Output: review/<case-id>.md — the full text of every node and choice in
 * document order, so authors and expert reviewers can read a case
 * top-to-bottom without clicking through the app.
 *
 * Run: npm run export:review
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { cases } from "../lib/data/cases/index";
import type { ClinicalCase, Condition, Effects, NextRule } from "../lib/types";
import { METRICS } from "../lib/types";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "review");

const label = (k: string) => METRICS.find((m) => m.key === k)?.label ?? k;

function formatEffects(effects: Effects): string {
  const parts = Object.entries(effects)
    .filter(([, v]) => v)
    .map(([k, v]) => `${label(k)} ${v! > 0 ? `+${v}` : v}`);
  return parts.length ? parts.join(", ") : "no metric changes";
}

function formatCondition(c: Condition): string {
  if ("metricAtLeast" in c) return `${label(c.metricAtLeast[0])} ≥ ${c.metricAtLeast[1]}`;
  if ("metricBelow" in c) return `${label(c.metricBelow[0])} < ${c.metricBelow[1]}`;
  if ("clockAtLeast" in c) return `clock ≥ T+${c.clockAtLeast}`;
  if ("clockBelow" in c) return `clock < T+${c.clockBelow}`;
  if ("chose" in c) return `chose \`${c.chose}\``;
  if ("visited" in c) return `visited \`${c.visited}\``;
  if ("timedOut" in c) return `timed out at \`${c.timedOut}\``;
  if ("all" in c) return c.all.map(formatCondition).join(" AND ");
  if ("any" in c) return c.any.map(formatCondition).join(" OR ");
  if ("not" in c) return `NOT (${formatCondition(c.not)})`;
  return "?";
}

function formatNext(rules: NextRule[]): string {
  return rules
    .map((r) =>
      r.when ? `if ${formatCondition(r.when)} → \`${r.nodeId}\`` : `→ \`${r.nodeId}\``
    )
    .join("; ");
}

function exportCase(c: ClinicalCase): string {
  const lines: string[] = [];
  const push = (s = "") => lines.push(s);
  const char = (id: string) => c.characters.find((ch) => ch.id === id)?.name ?? id;

  push(`# ${c.title}`);
  push();
  push(`- **Case id:** \`${c.id}\` (v${c.caseVersion})`);
  push(`- **Setting:** ${c.setting}`);
  push(`- **Difficulty:** ${c.difficulty} · **Modes:** ${c.modes.join(", ")} · **Scoring:** ${c.scoring}`);
  push(`- **Review status:** ${c.reviewStatus}`);
  push();
  push(`## Characters`);
  push();
  for (const ch of c.characters) {
    push(`### ${ch.name} (${ch.role})`);
    if (ch.bio) {
      push();
      push(`> ${ch.bio}`);
    }
    if (ch.accessNeeds) {
      push();
      push(`**Access needs:** ${ch.accessNeeds.join(" · ")}`);
    }
    push();
  }
  push(`## Learning objectives`);
  push();
  for (const o of c.learningObjectives) push(`- ${o}`);
  push();
  push(`---`);

  for (const node of c.nodes) {
    push();
    push(
      `## Node: ${node.title} \`${node.id}\`${node.id === c.startNodeId ? " *(start)*" : ""}`
    );
    push();
    const meta: string[] = [];
    if (node.day) meta.push(`day ${node.day}`);
    if (node.timeOfDay) meta.push(node.timeOfDay);
    if (node.timerSeconds) meta.push(`⏱ ${node.timerSeconds}s timer`);
    meta.push(`present — ${node.scene.present.map(char).join(", ")}`);
    if (node.scene.moods)
      meta.push(
        Object.entries(node.scene.moods)
          .map(([id, m]) => `${char(id)}: ${m}`)
          .join(", ")
      );
    push(`*${meta.join(" · ")}*`);
    if (node.dayBreak) {
      push();
      push(`**Day-break narration:** ${node.dayBreak.narration}`);
    }
    if (node.inlineCaption) {
      push();
      push(`*Caption: ${node.inlineCaption}*`);
    }
    push();
    push(`**Situation:**`);
    push();
    push(node.situation);
    if (node.timedOverrides?.situation) {
      push();
      push(`**Situation (timed-mode override):**`);
      push();
      push(node.timedOverrides.situation);
    }
    for (const p of node.perspectives ?? []) {
      push();
      push(`**${char(p.characterId)}'s view:**`);
      push();
      push(`> ${p.text}`);
    }
    if (node.choices.length === 0) {
      push();
      push(`*(terminal node — encounter ends here)*`);
      if (node.outcomeSummary) {
        push();
        push(`**Outcome summary:** ${node.outcomeSummary}`);
      }
      continue;
    }
    for (const [i, choice] of node.choices.entries()) {
      push();
      const tags = [
        choice.dialogue ? `dialogue (${char(choice.dialogue.speakerId)})` : "",
        choice.timeSaver ? "TIME-SAVER" : "",
        choice.timeCost ? `${choice.timeCost} min` : "",
      ]
        .filter(Boolean)
        .join(" · ");
      push(`### Choice ${i + 1} \`${choice.id}\`${tags ? ` — ${tags}` : ""}`);
      push();
      push(choice.dialogue ? `**"${choice.label}"**` : `**${choice.label}**`);
      push();
      push(`*Effects: ${formatEffects(choice.effects)}*`);
      push();
      push(`*Next: ${formatNext(choice.next)}*`);
      push();
      push(`**Immediate:** ${choice.feedback.immediate}`);
      if (choice.feedback.institutional) {
        push();
        push(`**Institutional response:** ${choice.feedback.institutional}`);
      }
      push();
      push(`**Ethical interpretation:** ${choice.feedback.ethical}`);
      for (const d of choice.feedback.delayed ?? []) {
        push();
        const when =
          "onDayBreakToDay" in d.deliver
            ? `day-break to day ${d.deliver.onDayBreakToDay}`
            : "atNodeId" in d.deliver
              ? `at node \`${d.deliver.atNodeId}\``
              : `after T+${d.deliver.afterScenarioMinutes}`;
        push(
          `**Delayed (${when}):** ${d.text}${d.effects ? ` *(${formatEffects(d.effects)})*` : ""}`
        );
      }
    }
    if (node.inactionOutcome) {
      push();
      push(`### Timeout / inaction outcome`);
      push();
      push(node.inactionOutcome.text);
      push();
      push(`*Effects: ${formatEffects(node.inactionOutcome.effects)}*`);
      push();
      push(`*Next: ${formatNext(node.inactionOutcome.next)}*`);
    }
  }

  push();
  push(`---`);
  push();
  push(`## Epilogue`);
  for (const r of c.epilogue.reflections) {
    push();
    push(`**${char(r.characterId)}, afterward:**`);
    push();
    push(`> ${r.text}`);
  }
  push();
  push(`**Reflection prompts:**`);
  push();
  for (const p of c.epilogue.reflectionPrompts) push(`- ${p}`);
  if (c.readingConnections.length) {
    push();
    push(`## Reading connections`);
    push();
    for (const r of c.readingConnections) push(`- **${r.source}** — ${r.connection}`);
  }
  push();
  return lines.join("\n");
}

mkdirSync(outDir, { recursive: true });
for (const c of cases) {
  const file = join(outDir, `${c.id}.md`);
  writeFileSync(file, exportCase(c));
  console.log(`Exported ${c.nodes.length} nodes → review/${c.id}.md`);
}
