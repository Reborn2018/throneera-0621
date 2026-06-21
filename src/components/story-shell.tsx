import { BrandHeader } from "@/components/brand-header";
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
      <section className="story-layout">
        <aside className="run-summary" aria-label="Run summary">
          <p className="meta">{config.title}</p>
          <strong>{run.identity.name}</strong>
          <span>{run.status.replace("_", " ")}</span>
        </aside>
        <div className="panel">{children}</div>
      </section>
    </main>
  );
}
