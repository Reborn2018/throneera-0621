import { notFound } from "next/navigation";
import { LandingHero } from "@/components/landing-hero";
import { getSimulatorConfig, isSimulatorSlug } from "@/lib/simulators";

export default async function SimulatorLandingPage({
  params,
}: {
  params: Promise<{ simulator: string }>;
}) {
  const { simulator } = await params;
  if (!isSimulatorSlug(simulator)) {
    notFound();
  }

  const config = getSimulatorConfig(simulator);

  return <LandingHero config={config} />;
}
