/**
 * Visual style registry.
 *
 * The engine never draws anything — it emits SceneState, and a *renderer*
 * turns that into pixels. Styles are interchangeable: same scenarios, same
 * engine, different look. Every renderer must accept exactly SceneProps and
 * express everything SceneState can say (presence, moods, focus, bubbles,
 * time of day, wall clock). Never build a visual feature that bypasses
 * SceneState — that would break every other style.
 *
 * "Basic" is the original warm flat-illustration style and stays available
 * permanently, whatever else gets added.
 *
 * Accessibility requirement for every renderer, not just the SVG ones: expose
 * a text equivalent of the scene (today: `role="img"` plus a generated
 * aria-label naming who is present and their mood). A renderer that draws to
 * <canvas> is opaque to screen readers and must ship a maintained ARIA mirror
 * plus, if anything auto-animates, a pause control per WCAG 2.2.2. Prefer
 * approaches that keep the DOM-level description intact.
 */

export type VisualStyleId = "basic";

export interface VisualStyleInfo {
  id: VisualStyleId;
  name: string;
  tagline: string;
  /** Longer description for the settings picker. */
  description: string;
  /** False while a style is being built — hidden from the picker. */
  available: boolean;
}

export const VISUAL_STYLES: VisualStyleInfo[] = [
  {
    id: "basic",
    name: "Basic",
    tagline: "Warm flat illustration",
    description:
      "The original style: soft shapes, a limited warm palette, and simple " +
      "expressive faces. Light, fast, and readable on any screen.",
    available: true,
  },
];

export const DEFAULT_VISUAL_STYLE: VisualStyleId = "basic";

export const isVisualStyleId = (v: unknown): v is VisualStyleId =>
  typeof v === "string" && VISUAL_STYLES.some((s) => s.id === v);

export const getVisualStyle = (id: VisualStyleId): VisualStyleInfo =>
  VISUAL_STYLES.find((s) => s.id === id) ?? VISUAL_STYLES[0];

export const STORAGE_KEY = "ace:visual-style";
