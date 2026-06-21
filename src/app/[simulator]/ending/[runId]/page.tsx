import { notFound } from "next/navigation";
import { Ending } from "@/components/ending";
import { isSimulatorSlug, getSimulatorConfig } from "@/lib/simulators";
import { getStore } from "@/lib/server/store";

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

  const config = getSimulatorConfig(simulator);

  return <Ending config={config} run={run} />;
}
