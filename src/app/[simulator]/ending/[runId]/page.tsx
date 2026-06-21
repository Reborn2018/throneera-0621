import Link from "next/link";
import { notFound } from "next/navigation";
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
  const title = config.endings.titles[0] ?? "A Reign Remembered";

  return (
    <main className={`page ${config.themeClass}`}>
      <section className="panel">
        <div className="brand">ThroneEra</div>
        <p className="meta">Ending unlocked - 1 of {config.endings.totalSlots}</p>
        <h1>{title}</h1>
        <p className="copy">
          History remembers {run.identity.name} through {run.decisions.length} decisive
          commands. The next route must begin as a new campaign.
        </p>
        <div className="actions">
          <form method="post" action="/api/runs">
            <input type="hidden" name="simulator" value={config.crossSell.target} />
            <input type="hidden" name="sourceRunId" value={run.id} />
            <button className="button" type="submit">
              {config.crossSell.headline}
            </button>
          </form>
          <Link className="muted" href={`/${simulator}/start`}>
            Start a new route
          </Link>
        </div>
      </section>
    </main>
  );
}
