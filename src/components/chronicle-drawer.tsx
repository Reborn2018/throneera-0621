import type { RunRecord } from "@/lib/types";

export function ChronicleDrawer({ run }: { run: RunRecord }) {
  const decisions = run.decisions.slice(-3).reverse();

  return (
    <details className="drawer">
      <summary>Chronicle</summary>
      {decisions.length ? (
        <ol className="chronicle">
          {decisions.map((decision) => (
            <li key={`${decision.sceneId}-${decision.choiceId}-${decision.createdAt}`}>
              {decision.label}
            </li>
          ))}
        </ol>
      ) : (
        <p className="muted">No royal acts recorded yet.</p>
      )}
    </details>
  );
}
