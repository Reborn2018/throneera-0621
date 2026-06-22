import { notFound } from "next/navigation";
import { Paywall } from "@/components/paywall";
import { isSimulatorSlug, getSimulatorConfig } from "@/lib/simulators";
import { getStore } from "@/lib/server/store";
import { getRunVariantId } from "@/lib/variants";

export default async function UnlockPage({
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

  return <Paywall config={config} run={run} />;
}
