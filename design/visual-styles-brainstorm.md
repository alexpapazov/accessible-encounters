# Visual styles — brainstorm

**Status: research + options for discussion, 2026-07-26.** Nothing here is
decided. Infrastructure to support multiple styles is already built and
deployed (`lib/visual-styles.ts`, `components/scenes/`, `/settings`).

---

## What we're solving

The current style ("Basic") works, but the characters are limited: faces are
two dots plus a brow and mouth, bodies never move, and every figure stands
still in a line. The goal is to keep the **figurine feel** — simple, warm,
non-photoreal, respectful — while making characters more expressive and the
scenes more appealing.

Constraints that shape every option:

1. **Renderer contract.** Any style must express everything `SceneState` can
   say: presence, 8 moods, clinician focus, speech bubbles, 4 lighting states,
   the wall clock, and multi-patient scenes. Nothing may bypass it.
2. **No fake signing, ever.** Whatever the style, hands never form ASL.
3. **Public educational project.** Licensing must permit commercial/public use
   without attribution traps. Anything ambiguous is disqualified.
4. **Basic stays.** Permanently, per the project owner.
5. **Characters must be authorable.** New scenarios arrive regularly; adding a
   character can't require a designer or a 3-hour pipeline.

---

## Research finding: AI cannot generate the cast for us

Checked thoroughly (see `research` notes below). The blunt version:

**No 2026 tool solves "same character, six expressions, clean editable SVG."**
Generative models redraw the whole illustration each time, so path structure
differs between outputs. Six expressions become six unrelated DOM trees — you
cannot swap a `<g id="mouth">`, cannot tween, cannot restyle. You get scalable
art, not a design system.

Specific landmines worth recording:

| Trap | Reality |
|---|---|
| Recraft free tier | **Recraft owns those images**; no commercial license. Paid plan required for anything public. |
| Recraft "character consistency" | Their own docs say they have **no character-tracking feature**. |
| Midjourney free/trial | **Midjourney owns the output.** |
| FLUX open weights | `[dev]` is **not** blanket free for commercial use; needs a paid BFL tier. |
| Any raster → auto-trace | Traced output is unusable as a component system. |
| Potrace | Binary input only (useless for color), and GPL if embedded. |
| "Character sheet generator" SEO sites | Licensing unverifiable. Avoid. |

**Where AI is genuinely useful:** concepting *one* character (Ideogram
Character has the cleanest licensing — no ownership claim, commercial use OK
even free; Gemini "Nano Banana Pro" is strongest at consistency), then a human
rebuilds it as a proper component with an `expression` variant. AI does the
look; we own the geometry.

Also worth knowing: **OmniSVG** (Apache 2.0, NeurIPS 2025) is the only thing
pointing at genuinely character-consistent *native* SVG, but it's a research
artifact needing 17–26 GB VRAM and up to 80s per generation. Not a product.

---

## Option A — "Basic+": evolve what we have

Keep the exact aesthetic, deepen the expressiveness. All hand-coded, zero
dependencies, zero licensing risk, and it inherits every future scene feature
for free.

Expressiveness axes currently unused:

- **Eyes.** Two static dots today. Add eyelid shapes (wide / narrow /
  half-closed / squeezed), pupil direction (gaze follows `focus`), and blinking
  on an idle timer. Eyes carry more emotion than any other feature.
- **Body language.** Every figure is bolt upright. Add per-mood torso lean,
  shoulder height (raised = tense, dropped = exhausted), head tilt, and arm
  positions (crossed, reaching, hands-visible for de-escalation).
- **Silhouette variety.** Hair shapes, body widths, heights, clothing details,
  glasses, badges. Right now every standing figure shares one outline.
- **Contact shadows and depth.** A soft ellipse under each figure, slight scale
  by depth, and a subtle background/foreground separation. Cheap, huge payoff.
- **Micro-motion.** Idle breathing (1–2px torso rise), blink, and a small
  settle when a character's mood changes. Must respect `prefers-reduced-motion`.
- **Framing.** Optional close-up crop for intimate beats vs. wide for triage
  chaos — driven by a new optional `SceneState` field.

Effort: moderate, incremental, entirely within our control.
Risk: none. It's our own code.

## Option B — Open Peeps (RECOMMENDED for style #2)

Hand-drawn sketchy system, **CC0** (committable, no attribution). Verified as
the only library that is simultaneously public-domain, part-composable at
runtime, and already contains all eight of our moods as named artwork.

**Our 8 moods map 1:1 with no gaps:** neutral→Calm, uncertain→Concerned,
frustrated→Contempt, engaged→Explaining, relieved→SmileBig, fearful→Fear,
agitated→Hectic, exhausted→Tired.

It also ships exactly the clinical and representational range this project
needs: 69 poses including **Wheelchair** and three doctor poses
(`Doc`, `DocStethoscope`, `DocProtectiveClothe`); 53 hair options including
**Hijab, Turban, CornRows, BantuKnots, Afro, Twists**, gray-hair variants, and
surgical caps/face shields (`DocBouffant`, `DocShield`, `DocSurgery`); plus
medical masks and respirators via the DiceBear route.

Two integration paths:
- **Vendor `react-peeps` parts** (MIT wrapper over CC0 art) — richest, but the
  package is CJS-only from 2021, so deep-import or vendor rather than importing
  the barrel (2.25 MB otherwise).
- **Pre-generate at build time via DiceBear** — 10 archetypes × 8 moods = 80
  SVGs ≈ 923 KB total (~11.5 KB each), committed, **zero runtime dependency**.
  Free hex `skinColor`/`clothingColor`. Note DiceBear v10 renamed the package
  to `@dicebear/styles` and the option to `expressionVariant`; unknown
  `*Variant` keys silently no-op rather than erroring.

Keep our existing room, gurney, and VRI cart; swap only the figures.

## Option B2 — Avataaars or Big Smile (candidate style #3)

Rounder cartoon silhouette, deliberately contrasting with Open Peeps.
Avataaars is free for commercial use with no attribution (13 eyebrows × 12 eyes
× 12 mouths); Big Smile is CC BY 4.0 (credit required) and includes a face
mask component.

## Option C — Rive state-machine characters

Author each character once with bones and blend states; expressions become
*states* of one asset rather than six files. Genuinely fluid animation, and
the "same character, many expressions" problem is solved structurally.

Pros: the most expressive ceiling by far; small runtime; real React support.
Cons: characters must be authored by hand in the Rive editor (a real time
investment per character); adds a runtime dependency; new scenarios need new
art rather than new data.

## Option D — 3D figurine, PRE-RENDERED (strong candidate for style #3)

The insight that rescues the figurine idea: we want the *look* of clay
figurines, not a live 3D engine. So model the characters in Blender (or
Spline), **render each character × 8 moods to PNG/WebP once**, and ship a
renderer that places `<img>` elements in the same SVG scene we already have.

Why this dominates live 3D on every axis that matters here:

- **Accessibility is unchanged.** We keep `role="img"` + the generated
  `aria-label`. Live 3D replaces that with an opaque `<canvas>` — MDN's
  guidance is blunt: avoid canvas in an accessible app. Neither the Spline
  runtime nor R3F emits any ARIA at all.
- **~0 KB of JavaScript.** No WebGL, no WASM, no runtime. Compare Spline's
  runtime at 562 KB gzipped, or three + fiber + drei at ~250–350 KB.
- **No license entanglement** — we own the renders outright.
- **No CDN dependency.** (Spline's runtime fetches WASM from `unpkg.com` in
  the user's browser at runtime — a CSP and GDPR consideration — and
  self-hosting the scene is **Enterprise-only**.)
- **No WCAG 2.2.2 problem.** Nothing auto-animates, so no pause/stop/hide
  control is required.

Cost: a one-time modeling and render pass, then it behaves like any other
image asset. Trade-off: no live camera motion — which this reflective app
does not want anyway.

## Option E — live 3D at runtime — RULED OUT

Every runtime-3D route is blocked or badly compromised:

- **Ready Player Me is dead.** Netflix acquired it 2025-12-19 and shut the
  platform down 2026-01-31; the avatar CDN no longer resolves. Every
  integration is broken.
- **Spline:** free tier watermarks web exports, code/glTF export is
  Professional-only ($20/mo), and the runtime unpacks to **6.6 MB**.
- **Mixamo cannot go in a public repo** — Adobe forbids redistributing raw
  character/animation files.
- **CC0 low-poly packs** (Kenney, Quaternius) generally ship **without facial
  blendshapes**, so we'd get body animation but not the facial nuance our eight
  moods depend on.
- Everything 3D renders to `<canvas>` — **opaque to screen readers**, which
  undercuts the project's whole premise.
- **Spline specifically:** `@splinetool/runtime` has **no license field on npm
  and no LICENSE file in the tarball** — a proprietary blob inside an otherwise
  clean repo. Its ToS was last modified **December 2020** and contains **no
  user-content ownership clause at all**. Self-hosting is Enterprise-only, and
  the runtime pulls WASM from `unpkg.com` in the user's browser.

**Useful asset finding for the pre-render route (Option D):** Microsoft
Rocketbox is **MIT licensed** (© 2020 Microsoft, fully redistributable) with
115 rigged avatars — including **Medical_Female_01–03 and Medical_Male_01–05**
— and 175 blendshape targets covering the full ARKit 52 set plus visemes and
FACS units. Its style is realistic game-character rather than figurine, so it
suits reference or posing more than final look, but it is the only free source
of rigged clinical humans *with* facial blendshapes. Every CC0 low-poly pack
(Kenney, Quaternius — both genuinely CC0, no attribution) has rigged bodies and
**zero facial morph targets**.

## Bug found in the current renderer (verified)

`Face` in `BasicScene.tsx` wraps its paths in
`<g className="transition-all duration-500">`, but CSS cannot interpolate the
SVG `d` **attribute** — only the CSS `d` property, on the path itself, in
Blink/WebKit. **Mood changes snap instead of easing.** Gaze transitions work
(transform is animatable); expressions do not.

Fix is cheap: 5 of the 8 mouths are already identical two-command `M… Q…`
paths and are natively morphable. Only `frustrated`, `agitated`, and `fearful`
need normalizing to the same command signature, after which `motion` (MIT, no
strings attached) can tween them. Benefits every style, present and future.

## Licensing landmines (verified, do not use)

- **Absurd Design** free tier — non-commercial only. Blocked.
- **Storyset** free — mandatory "Designed by Freepik" on every use.
- **Blush** — "can't re-distribute"; SVG export is Pro-only anyway. Its best
  collections (Open Peeps, Humaaans) are separately CC0 at source — go direct.
- **Icons8 / Ouch!** free — link-back on every page *and* no derivatives.
  **But** they publish an open-source/educational relicensing offer, and this
  is a Harvard-course-linked public educational project. Their 2,462 healthcare
  illustrations would be the single biggest content unlock available — worth
  one email, but nothing enters the repo before it's in writing.
- **Notionists / Notion-style** — strictly black and white, **no `skinColor`
  option at all**. For a project centered on diverse patients that is a
  representation problem, not a style preference. Disqualified.
- **Humaaans** — official site says CC0; a widely-linked GitHub mirror says
  CC BY 4.0. Download from the official source and credit anyway.
  `react-humaaans` (2019) has **no expression control** regardless.
- **Personas, Croodles** — CC BY 4.0, attribution required.
- **Rive** — free plan **cannot export `.riv`**; ~$108/seat/yr. Community
  assets are CC BY 4.0. Runtime is ~815 KB gz and renders to canvas.

## Note on a rejected suggestion

One research thread proposed using Humaaans' rotatable limbs to "approximate
signing poses." **Rejected — this violates representation rule #1.** Worth
recording because the rule is also a practical advantage: we never need hand or
finger articulation (the hardest thing to rig), only face, gaze, posture, and
presence. That is exactly where flat SVG is strongest.

---

## Open questions for the project owner

1. How many styles do we actually want live — 2, 3, or 4 (counting Basic)?
2. Is a **hand-drawn** look (Option B) appealing, or does the geometric
   figurine feel matter more?
3. Any appetite for **animation** (Option C), or is stillness better for a
   reflective medical-humanities tool?
4. Is anyone available to draw, or must every style be code-generated?
