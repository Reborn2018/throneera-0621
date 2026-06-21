import { notFound } from "next/navigation";
import { getSimulatorConfig, isSimulatorSlug } from "@/lib/simulators";

export default async function StartPage({
  params,
}: {
  params: Promise<{ simulator: string }>;
}) {
  const { simulator } = await params;
  if (!isSimulatorSlug(simulator)) {
    notFound();
  }

  const config = getSimulatorConfig(simulator);

  return (
    <main className={`page ${config.themeClass}`}>
      <section className="panel">
        <div className="brand">ThroneEra</div>
        <p className="meta">{config.title}</p>
        <h1>Claim your name before history claims you.</h1>
        <form className="actions" method="post" action="/api/runs">
          <input type="hidden" name="simulator" value={config.slug} />
          <label>
            <span className="meta">{config.identity.nameLabel}</span>
            <input name="name" defaultValue={config.identity.defaultName} />
          </label>
          <label>
            <span className="meta">Disposition</span>
            <select name="dispositionId" defaultValue={config.identity.dispositions[0]?.id}>
              {config.identity.dispositions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="meta">Origin</span>
            <select name="originId" defaultValue={config.identity.origins[0]?.id}>
              {config.identity.origins.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button className="button" type="submit">
            Begin
          </button>
        </form>
      </section>
    </main>
  );
}
