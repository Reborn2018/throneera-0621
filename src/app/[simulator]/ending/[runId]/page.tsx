import { notFound } from "next/navigation";
import { Ending } from "@/components/ending";
import { isSimulatorSlug, getSimulatorConfig } from "@/lib/simulators";
import { getStore } from "@/lib/server/store";
import { getRunVariantId } from "@/lib/variants";

export default async function EndingPage({
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

  const config = getSimulatorConfig(simulator, getRunVariantId(run));

  return <Ending config={config} run={run} />;
}
