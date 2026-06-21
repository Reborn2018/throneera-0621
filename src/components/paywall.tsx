import { BrandHeader } from "@/components/brand-header";
import type { RunRecord, SimulatorConfig } from "@/lib/types";

export function Paywall({ config, run }: { config: SimulatorConfig; run: RunRecord }) {
  return (
    <main className={`page product-page ${config.themeClass}`}>
      <BrandHeader simulator={config.slug} />
      <section className="panel paywall">
        <p className="meta">Current campaign unlock</p>
        <h1>{config.offer.label} - $7.99</h1>
        <p className="copy">
          {run.identity.name}&apos;s reign is at the edge of its first real crisis. Continue
          this complete campaign with one secure purchase.
        </p>
        <ul className="benefits">
          <li>One-time purchase for this run</li>
          <li>Complete campaign and personalized ending</li>
          <li>Progress restores without another charge</li>
        </ul>
        <form className="actions" method="post" action="/api/checkout">
          <input type="hidden" name="runId" value={run.id} />
          <button className="button" type="submit">
            Continue My Reign
          </button>
        </form>
        <p className="muted">
          No subscription. A new campaign or replay requires a separate payment or valid
          campaign credit.
        </p>
      </section>
    </main>
  );
}
