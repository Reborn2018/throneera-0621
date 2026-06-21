import type { RunRecord, SimulatorConfig } from "@/lib/types";

export function RealmDrawer({ config, run }: { config: SimulatorConfig; run: RunRecord }) {
  return (
    <section
      className="hud"
      aria-label={config.slug === "queen" ? "Realm status" : "Campaign status"}
    >
      {Object.entries(run.realm).map(([key, value]) => (
        <div className={value < 35 ? "hud-stat alarm" : "hud-stat"} key={key}>
          <div className="hud-meta">
            <span className="hud-name">
              {config.realmLabels[key as keyof typeof config.realmLabels]}
            </span>
            <span className="hud-num">{value}</span>
          </div>
          <div className="hud-bar" aria-hidden="true">
            <div className="hud-fill" style={{ width: `${value}%` }} />
          </div>
        </div>
      ))}
    </section>
  );
}
