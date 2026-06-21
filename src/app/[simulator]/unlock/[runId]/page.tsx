import { notFound } from "next/navigation";
import { isSimulatorSlug, getSimulatorConfig } from "@/lib/simulators";
import { getStore } from "@/lib/server/store";

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

  const config = getSimulatorConfig(simulator);

  return (
    <main className={`page ${config.themeClass}`}>
      <section className="panel">
        <div className="brand">ThroneEra</div>
        <p className="meta">Current campaign unlock</p>
        <h1>{config.offer.label} - $7.99</h1>
        <p className="copy">
          One-time purchase for this {config.title} run. No subscription. A new campaign
          or replay requires a separate payment or valid campaign credit.
        </p>
        <form className="actions" method="post" action="/api/checkout">
          <input type="hidden" name="runId" value={run.id} />
          <button className="button" type="submit">
            Continue My Reign
          </button>
        </form>
      </section>
    </main>
  );
}
