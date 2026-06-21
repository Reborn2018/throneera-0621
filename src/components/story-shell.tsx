import { BrandHeader } from "@/components/brand-header";
import { LegalLinks } from "@/components/legal-links";
import type { RunRecord, SimulatorConfig } from "@/lib/types";

export function StoryShell({
  config,
  run,
  children,
}: {
  config: SimulatorConfig;
  run: RunRecord;
  children: React.ReactNode;
}) {
  return (
    <main className={`page product-page ${config.themeClass}`}>
      <BrandHeader simulator={config.slug} />
      <section className="story-layout play-shell">
        <aside className="run-summary" aria-label="Run summary">
          <p className="eyebrow">{config.title}</p>
          <strong>{run.identity.name}</strong>
          <span>{run.status.replace("_", " ")}</span>
          <small>{run.decisions.length} decisions recorded</small>
        </aside>
        <div className="panel story-panel">{children}</div>
      </section>
      <LegalLinks />
    </main>
  );
}
