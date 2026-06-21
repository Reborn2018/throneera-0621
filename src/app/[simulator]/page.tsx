import Link from "next/link";
import { notFound } from "next/navigation";
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

  return (
    <main className={`page ${config.themeClass}`}>
      <section className="hero">
        <div className="brand">ThroneEra</div>
        <h1>{config.landing.headline}</h1>
        <p className="copy">{config.landing.subhead}</p>
        <div className="actions">
          <Link className="button" href={`/${config.slug}/start`}>
            {config.landing.cta}
          </Link>
        </div>
      </section>
    </main>
  );
}
