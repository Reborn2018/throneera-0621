import { getSimulatorConfig } from "@/lib/simulators";
import type { RunRecord, SceneChoice, StoryScene } from "@/lib/types";
import { getRunVariantId } from "@/lib/variants";

export function getCurrentScene(run: RunRecord): StoryScene | null {
  if (run.currentSceneId === "identity") {
    return null;
  }

  const config = getSimulatorConfig(run.simulator, getRunVariantId(run));
  return (
    [...config.prologueScenes, ...config.paidScenes].find(
      (scene) => scene.id === run.currentSceneId,
    ) ?? null
  );
}

export function getNextScene(run: RunRecord, scene: StoryScene): StoryScene | null {
  const config = getSimulatorConfig(run.simulator, getRunVariantId(run));
  const scenes = run.status === "paid" ? config.paidScenes : config.prologueScenes;
  const index = scenes.findIndex((candidate) => candidate.id === scene.id);

  if (index === -1 || index === scenes.length - 1) {
    return null;
  }

  return scenes[index + 1] ?? null;
}

export function findChoice(scene: StoryScene, choiceId: string): SceneChoice {
  const choice = scene.choices.find((candidate) => candidate.id === choiceId);

  if (!choice) {
    throw new Error(`Choice not found: ${choiceId}`);
  }

  return choice;
}
