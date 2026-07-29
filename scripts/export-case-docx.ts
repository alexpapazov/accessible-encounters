/**
 * Exports a case as a Word document for line-by-line review markup.
 *
 * Every passage is labelled with its stable id (node id / choice id) so notes
 * map straight back to the case data, and carries a word count so bloat is
 * visible rather than merely felt.
 *
 * Run: npm run export:docx            (all published + unpublished cases)
 *      npm run export:docx <case-id>
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  PageOrientation,
  Paragraph,
  TextRun,
} from "docx";
import { cases } from "../lib/data/cases/index";
import { METRICS, type ClinicalCase, type Effects } from "../lib/types";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "review");
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const metricLabel = (k: string) => METRICS.find((m) => m.key === k)?.label ?? k;

const fmtEffects = (e: Effects) =>
  Object.entries(e)
    .filter(([, v]) => v)
    .map(([k, v]) => `${metricLabel(k)} ${v! > 0 ? `+${v}` : v}`)
    .join(", ") || "no metric changes";

/* ---------- paragraph helpers ---------- */

const h1 = (text: string) =>
  new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 120 } });

const h2 = (text: string) =>
  new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 100 } });

const h3 = (text: string) =>
  new Paragraph({ text, heading: HeadingLevel.HEADING_3, spacing: { before: 180, after: 80 } });

/** Label + body on one paragraph, with an optional word count. */
const passage = (label: string, body: string, opts: { count?: boolean; italic?: boolean } = {}) =>
  new Paragraph({
    spacing: { after: 200, line: 320 },
    children: [
      new TextRun({ text: `${label}  `, bold: true, color: "8A5A44", size: 20 }),
      ...(opts.count
        ? [new TextRun({ text: `[${words(body)} words]  `, color: "999999", size: 16 })]
        : []),
      new TextRun({ text: body, italics: opts.italic }),
    ],
  });

const meta = (text: string) =>
  new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, italics: true, color: "777777", size: 18 })],
  });

const note = (text: string) =>
  new Paragraph({
    spacing: { after: 100 },
    children: [new TextRun({ text, color: "666666", size: 18 })],
  });

const spacer = () => new Paragraph({ text: "", spacing: { after: 120 } });

/* ---------- document ---------- */

function buildDoc(c: ClinicalCase) {
  const charName = (id: string) => c.characters.find((ch) => ch.id === id)?.name ?? id;
  const body: Paragraph[] = [];

  body.push(
    new Paragraph({
      text: c.title,
      heading: HeadingLevel.TITLE,
      spacing: { after: 120 },
    }),
    meta(
      `${c.setting}  ·  ${c.difficulty}  ·  modes: ${c.modes.join(", ")}  ·  review status: ${c.reviewStatus}  ·  case id: ${c.id} (v${c.caseVersion})`
    ),
    new Paragraph({
      spacing: { after: 240, line: 300 },
      children: [
        new TextRun({
          text:
            "REVIEW COPY. Mark it up however is easiest — comments, red text, strikethrough, rewrites in place. " +
            "Every passage is labelled with the id it comes from in the code, so notes map straight back. " +
            "Word counts are shown to make length visible; they are not targets.",
          size: 20,
          color: "444444",
        }),
      ],
    })
  );

  /* Characters */
  body.push(h1("Characters"));
  for (const ch of c.characters) {
    body.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({ text: `${ch.name}`, bold: true }),
          new TextRun({ text: `  —  ${ch.role}`, color: "777777" }),
        ],
      })
    );
    if (ch.bio) body.push(passage("Bio", ch.bio, { count: true, italic: true }));
  }

  /* Objectives */
  body.push(h1("Learning objectives"));
  c.learningObjectives.forEach((o, i) =>
    body.push(new Paragraph({ text: `${i + 1}. ${o}`, spacing: { after: 80 } }))
  );

  /* Nodes */
  body.push(h1("The encounter"));
  c.nodes.forEach((node, ni) => {
    body.push(h2(`${ni + 1}. ${node.title}${node.id === c.startNodeId ? "  (start)" : ""}`));
    body.push(
      meta(
        `node id: ${node.id}` +
          (node.timerSeconds ? `  ·  timer ${node.timerSeconds}s` : "") +
          (node.timeOfDay ? `  ·  ${node.timeOfDay}` : "") +
          `  ·  present: ${node.scene.present.map(charName).join(", ")}`
      )
    );

    body.push(passage("SITUATION", node.situation, { count: true }));
    if (node.timedOverrides?.situation)
      body.push(passage("SITUATION (timed)", node.timedOverrides.situation, { count: true }));
    for (const p of node.perspectives ?? [])
      body.push(
        passage(`${charName(p.characterId).toUpperCase()}'S VIEW`, p.text, {
          count: true,
          italic: true,
        })
      );

    if (!node.choices.length) {
      body.push(note("(terminal node — the encounter ends here)"));
      if (node.outcomeSummary)
        body.push(passage("OUTCOME SUMMARY", node.outcomeSummary, { count: true }));
      body.push(spacer());
      return;
    }

    node.choices.forEach((choice, ci) => {
      const tags = [
        choice.dialogue ? "spoken line" : "",
        choice.timeSaver ? "TIME-SAVER" : "",
        choice.timeCost ? `${choice.timeCost} min` : "",
      ]
        .filter(Boolean)
        .join(" · ");
      body.push(h3(`Choice ${ni + 1}.${ci + 1}${tags ? `  —  ${tags}` : ""}`));
      body.push(meta(`choice id: ${choice.id}  →  ${choice.next.map((n) => n.nodeId).join(" / ")}`));
      body.push(
        new Paragraph({
          spacing: { after: 120, line: 300 },
          children: [
            new TextRun({
              text: choice.dialogue ? `“${choice.label}”` : choice.label,
              bold: true,
            }),
            new TextRun({ text: `   [${words(choice.label)} words]`, color: "999999", size: 16 }),
          ],
        })
      );
      body.push(note(`Effects: ${fmtEffects(choice.effects)}`));
      body.push(passage("IMMEDIATE", choice.feedback.immediate, { count: true }));
      if (choice.feedback.institutional)
        body.push(passage("INSTITUTION", choice.feedback.institutional, { count: true }));
      body.push(passage("ETHICAL", choice.feedback.ethical, { count: true }));
      for (const d of choice.feedback.delayed ?? [])
        body.push(passage("DELAYED", d.text, { count: true }));
    });

    if (node.inactionOutcome) {
      body.push(h3("If the clock runs out (no decision)"));
      body.push(passage("INACTION", node.inactionOutcome.text, { count: true }));
      body.push(passage("ETHICAL", node.inactionOutcome.feedback.ethical, { count: true }));
    }
    body.push(spacer());
  });

  /* Epilogue */
  body.push(h1("Epilogue"));
  c.epilogue.reflections.forEach((r, i) => {
    body.push(h3(`${charName(r.characterId)}, afterward${r.when ? `  (variant ${i + 1})` : ""}`));
    body.push(passage("REFLECTION", r.text, { count: true, italic: true }));
  });
  body.push(h3("Reflection prompts"));
  c.epilogue.reflectionPrompts.forEach((p, i) =>
    body.push(new Paragraph({ text: `${i + 1}. ${p}`, spacing: { after: 100, line: 300 } }))
  );

  if (c.readingConnections.length) {
    body.push(h1("Reading connections"));
    for (const r of c.readingConnections) {
      body.push(h3(r.source));
      body.push(passage("CONNECTION", r.connection, { count: true }));
    }
  }

  return new Document({
    creator: "Accessible Clinical Encounters",
    title: `${c.title} — review copy`,
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 22 }, paragraph: { spacing: { line: 300 } } },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840, orientation: PageOrientation.PORTRAIT },
            margin: { top: 1080, bottom: 1080, left: 1440, right: 2880 },
          },
        },
        children: body,
      },
    ],
  });
}

/* ---------- run ---------- */

const only = process.argv[2];
const targets = only ? cases.filter((c) => c.id === only) : cases;
if (!targets.length) {
  console.error(`No case matched "${only}"`);
  process.exit(1);
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  for (const c of targets) {
    const buf = await Packer.toBuffer(buildDoc(c));
    writeFileSync(join(outDir, `${c.id}.docx`), buf);
    console.log(`Wrote review/${c.id}.docx`);
  }
}

main();
