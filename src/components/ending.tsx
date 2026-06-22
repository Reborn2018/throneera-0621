import Link from "next/link";
import type { RunRecord, SimulatorConfig } from "@/lib/types";
import { BrandHeader } from "@/components/brand-header";
import { LegalLinks } from "@/components/legal-links";
import { variantSearchForConfig } from "@/lib/variants";

export function Ending({ config, run }: { config: SimulatorConfig; run: RunRecord }) {
  const title = config.endings.titles[0] ?? "A Reign Remembered";
  const variantSearch = variantSearchForConfig(config);

  return (
    <main className={`page product-page ${config.themeClass}`}>
      <BrandHeader simulator={config.slug} />
      <section className="panel ending-panel">
        <p className="meta">Ending unlocked - 1 of {config.endings.totalSlots}</p>
        <h1>{title}</h1>
        <p className="copy">
          History remembers {run.identity.name} through {run.decisions.length} decisive
          commands. The next route begins as a new campaign with its own prologue.
        </p>
        <div className="summary-card" aria-label="Shareable reign summary">
          <strong>{run.identity.name}</strong>
          <span>{title}</span>
          <small>{run.simulator.toUpperCase()} CAMPAIGN COMPLETE</small>
        </div>
        <div className="actions">
          <form method="post" action="/api/runs">
            <input type="hidden" name="simulator" value={config.crossSell.target} />
            <input type="hidden" name="sourceRunId" value={run.id} />
            <button className="button" type="submit">
              {config.crossSell.headline}
            </button>
          </form>
          <Link className="muted" href={`/${config.slug}/start${variantSearch}`}>
            Start a new route
          </Link>
        </div>
      </section>
      <LegalLinks />
    </main>
  );
}
