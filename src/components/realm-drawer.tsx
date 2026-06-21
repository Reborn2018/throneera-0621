import type { RunRecord, SimulatorConfig } from "@/lib/types";

export function RealmDrawer({ config, run }: { config: SimulatorConfig; run: RunRecord }) {
  return (
    <details className="drawer">
      <summary>Realm</summary>
      <div className="meter-list">
        {Object.entries(run.realm).map(([key, value]) => (
          <div className="meter-row" key={key}>
            <span>{config.realmLabels[key as keyof typeof config.realmLabels]}</span>
            <meter min={0} max={100} value={value} />
          </div>
        ))}
      </div>
    </details>
  );
}
