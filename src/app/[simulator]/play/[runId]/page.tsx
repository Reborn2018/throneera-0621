import { notFound, redirect } from "next/navigation";
import { ChoiceList } from "@/components/choice-list";
import { ChronicleDrawer } from "@/components/chronicle-drawer";
import { CustomDecree } from "@/components/custom-decree";
import { RealmDrawer } from "@/components/realm-drawer";
import { SceneNarration } from "@/components/scene-narration";
import { StoryShell } from "@/components/story-shell";
import { getCurrentScene } from "@/lib/engine/scenes";
import { getSimulatorConfig, isSimulatorSlug } from "@/lib/simulators";
import { getStore } from "@/lib/server/store";
import { getRunVariantId, variantUrlForRun } from "@/lib/variants";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ simulator: string; runId: string }>;
}) {
  const { simulator, runId } = await params;
  if (!isSimulatorSlug(simulator)) {
    notFound();
  }

  const store = await getStore();
  const run = await store.getRun(runId);
  if (!run || run.simulator !== simulator) {
    notFound();
  }

  if (run.status === "identity") {
    redirect(variantUrlForRun(`/${simulator}/start`, run));
  }

  if (run.status === "paywalled" || run.status === "checkout_pending") {
    redirect(variantUrlForRun(`/${simulator}/unlock/${run.id}`, run));
  }

  if (run.status === "completed") {
    redirect(variantUrlForRun(`/${simulator}/ending/${run.id}`, run));
  }

  const scene = getCurrentScene(run);
  if (!scene) {
    notFound();
  }
  const config = getSimulatorConfig(simulator, getRunVariantId(run));

  return (
    <StoryShell config={config} run={run}>
      <SceneNarration scene={scene} />
      <ChoiceList runId={run.id} scene={scene} config={config} />
      <RealmDrawer config={config} run={run} />
      <ChronicleDrawer run={run} />
      <CustomDecree runId={run.id} scene={scene} />
    </StoryShell>
  );
}
