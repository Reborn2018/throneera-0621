import { BrandHeader } from "@/components/brand-header";
import type { SimulatorConfig } from "@/lib/types";

export function IdentityBuilder({ config }: { config: SimulatorConfig }) {
  return (
    <main className={`page product-page ${config.themeClass}`}>
      <BrandHeader simulator={config.slug} />
      <section className="panel identity-panel">
        <p className="meta">{config.title}</p>
        <h1>Claim your name before history claims you.</h1>
        <form className="form-grid" method="post" action="/api/runs">
          <input type="hidden" name="simulator" value={config.slug} />
          <label>
            <span className="meta">{config.identity.nameLabel}</span>
            <input name="name" defaultValue={config.identity.defaultName} />
          </label>
          <fieldset>
            <legend className="meta">Disposition</legend>
            <div className="option-grid">
              {config.identity.dispositions.map((option, index) => (
                <label className="radio-card" key={option.id}>
                  <input
                    name="dispositionId"
                    type="radio"
                    value={option.id}
                    defaultChecked={index === 0}
                  />
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="meta">Origin</legend>
            <div className="option-grid">
              {config.identity.origins.map((option, index) => (
                <label className="radio-card" key={option.id}>
                  <input
                    name="originId"
                    type="radio"
                    value={option.id}
                    defaultChecked={index === 0}
                  />
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <button className="button" type="submit">
            Begin
          </button>
        </form>
      </section>
    </main>
  );
}
