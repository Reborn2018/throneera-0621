import { notFound } from "next/navigation";
import { IdentityBuilder } from "@/components/identity-builder";
import { getSimulatorConfig, isSimulatorSlug } from "@/lib/simulators";

export default async function StartPage({
  params,
}: {
  params: Promise<{ simulator: string }>;
}) {
  const { simulator } = await params;
  if (!isSimulatorSlug(simulator)) {
    notFound();
  }

  const config = getSimulatorConfig(simulator);

  return <IdentityBuilder config={config} />;
}
