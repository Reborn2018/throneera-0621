import { notFound } from "next/navigation";
import { IdentityBuilder } from "@/components/identity-builder";
import { getSimulatorConfig, isSimulatorSlug } from "@/lib/simulators";
import { getConfigVariantForSimulator } from "@/lib/variants";

export default async function StartPage({
  params,
  searchParams,
}: {
  params: Promise<{ simulator: string }>;
  searchParams: Promise<{ sourceRunId?: string; runType?: string; variant?: string }>;
}) {
  const { simulator } = await params;
  const { sourceRunId, runType, variant } = await searchParams;
  if (!isSimulatorSlug(simulator)) {
    notFound();
  }

  const config = getSimulatorConfig(simulator, getConfigVariantForSimulator(simulator, variant));

  return (
    <IdentityBuilder
      config={config}
      replaySourceRunId={runType === "replay" ? sourceRunId : undefined}
    />
  );
}
