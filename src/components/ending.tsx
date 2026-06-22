import Link from "next/link";
import type { RunRecord, SimulatorConfig } from "@/lib/types";
import { BrandHeader } from "@/components/brand-header";
import { LegalLinks } from "@/components/legal-links";
import { getEndingProfile } from "@/lib/ending-profile";
import { normalizeQueenVariant } from "@/lib/variants";

export function Ending({ config, run }: { config: SimulatorConfig; run: RunRecord }) {
  const profile = getEndingProfile(config, run);
  const replayHref = replayStartHref(config, run);

  return (
    <main className={`page product-page ${config.themeClass}`}>
      <BrandHeader simulator={config.slug} />
      <section className="panel ending-panel">
        <p className="meta">Fate sealed</p>
        <h1>{profile.title}</h1>
        <p className="copy ending-verdict">{profile.verdict}</p>
        <div className="summary-card ending-summary-card" aria-label="Shareable reign summary">
          <small>Your route</small>
          <strong>{run.identity.name}</strong>
          <span>{profile.routeLabel}</span>
          <small>{profile.routeStatLabel} carried the final shape of this reign</small>
        </div>
        <section className="ending-replay" aria-labelledby="replay-heading">
          <p className="ending-path-kicker">{profile.missedPath}</p>
          <h2 id="replay-heading">{profile.replayPrompt}</h2>
          <div className="ending-route-grid">
            {profile.replayRoutes.map((route) => (
              <article className="ending-route-card" key={route.title}>
                <strong>{route.title}</strong>
                <span>{route.body}</span>
              </article>
            ))}
          </div>
        </section>
        <div className="actions ending-replay-actions">
          <Link className="button" href={replayHref}>
            {profile.replayCta}
          </Link>
          <form method="post" action="/api/runs">
            <input type="hidden" name="simulator" value={config.crossSell.target} />
            <input type="hidden" name="sourceRunId" value={run.id} />
            <input type="hidden" name="runType" value="cross_sell" />
            <button className="button button-ghost" type="submit">
              {config.crossSell.headline}
            </button>
          </form>
        </div>
      </section>
      <LegalLinks />
    </main>
  );
}

function replayStartHref(config: SimulatorConfig, run: RunRecord): string {
  const params = new URLSearchParams();
  if (config.slug === "queen") {
    params.set("variant", normalizeQueenVariant(config.variantId));
  }

  params.set("runType", "replay");
  params.set("sourceRunId", run.id);

  return `/${config.slug}/start?${params.toString()}`;
}
