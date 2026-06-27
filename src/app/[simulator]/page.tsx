import { notFound } from "next/navigation";
import ThroneEraGame from "@/components/ThroneEraGame";
import { isSimulatorSlug } from "@/lib/simulators";

export default async function SimulatorLandingPage({
  params,
}: {
  params: Promise<{ simulator: string }>;
}) {
  const { simulator } = await params;
  if (!isSimulatorSlug(simulator)) {
    notFound();
  }

  return <ThroneEraGame era={simulator} />;
}
