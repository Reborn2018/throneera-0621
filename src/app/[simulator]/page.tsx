import { notFound } from "next/navigation";
import { LandingHero } from "@/components/landing-hero";
import { getSimulatorConfig, isSimulatorSlug } from "@/lib/simulators";
import { getConfigVariantForSimulator } from "@/lib/variants";

export default async function SimulatorLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ simulator: string }>;
  searchParams: Promise<{ variant?: string }>;
}) {
  const { simulator } = await params;
  const { variant } = await searchParams;
  if (!isSimulatorSlug(simulator)) {
    notFound();
  }

  const config = getSimulatorConfig(simulator, getConfigVariantForSimulator(simulator, variant));

  return <LandingHero config={config} />;
}
