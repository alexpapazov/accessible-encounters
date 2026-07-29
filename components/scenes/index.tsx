"use client";

import type { Character, SceneState, TimeOfDay } from "@/lib/types";
import type { VisualStyleId } from "@/lib/visual-styles";
import { useVisualStyle } from "../VisualStyleProvider";
import BasicScene from "./BasicScene";

/**
 * The contract every visual style implements. A renderer may interpret these
 * however it likes, but it must be able to express all of it — presence,
 * moods, focus, speech bubbles, lighting, and the scenario clock.
 */
export interface SceneProps {
  scene: SceneState;
  characters: Character[];
  timeOfDay?: TimeOfDay;
  scenarioMinutes?: number;
}

const RENDERERS: Record<VisualStyleId, React.ComponentType<SceneProps>> = {
  basic: BasicScene,
};

/** Renders the current scene in whichever style the user has chosen. */
export default function SceneRenderer(props: SceneProps) {
  const { style } = useVisualStyle();
  const Renderer = RENDERERS[style] ?? BasicScene;
  return <Renderer {...props} />;
}

/** Force a specific style — used by the settings preview. */
export function SceneRendererFor({
  styleId,
  ...props
}: SceneProps & { styleId: VisualStyleId }) {
  const Renderer = RENDERERS[styleId] ?? BasicScene;
  return <Renderer {...props} />;
}
