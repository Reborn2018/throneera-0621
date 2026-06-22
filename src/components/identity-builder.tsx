import { BrandHeader } from "@/components/brand-header";
import { LegalLinks } from "@/components/legal-links";
import type { SimulatorConfig } from "@/lib/types";
import { getSimulatorVisuals } from "@/lib/simulators/presentation";

export function IdentityBuilder({ config }: { config: SimulatorConfig }) {
  const visuals = getSimulatorVisuals(config);
  const noun = config.slug === "queen" ? "crown" : "command";
  const introHeading = config.identityIntro?.heading ?? `Claim your ${noun} before history claims you.`;
  const introCopy =
    config.identityIntro?.copy ??
    "Your first identity choices shape how the court, army, and public read every command that follows.";

  return (
    <main className={`page product-page ${config.themeClass}`}>
      <BrandHeader simulator={config.slug} />
      <section className="panel identity-panel">
        <p className="eyebrow">{visuals.kicker}</p>
        <h1>{introHeading}</h1>
        <p className="copy">{introCopy}</p>
        <form className="form-grid" method="post" action="/api/runs">
          <input type="hidden" name="simulator" value={config.slug} />
          {config.slug === "queen" ? (
            <input type="hidden" name="variantId" value={config.variantId ?? "legacy"} />
          ) : null}
          <label className="field-stack">
            <span className="field-label">{config.identity.nameLabel}</span>
            <input
              className="name-input"
              name="name"
              defaultValue={config.identity.defaultName}
              aria-label={config.identity.nameLabel}
            />
          </label>
          <fieldset>
            <legend className="field-label">Disposition</legend>
            <div className="choice-cards">
              {config.identity.dispositions.map((option, index) => (
                <label className="ccard radio-card" key={option.id}>
                  <input
                    name="dispositionId"
                    type="radio"
                    value={option.id}
                    defaultChecked={index === 0}
                  />
                  <span className="ccard-mark" aria-hidden="true" />
                  <span className="ccard-body">
                    <strong className="ccard-label">{option.label}</strong>
                    <span className="ccard-desc">{option.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="field-label">Origin</legend>
            <div className="choice-cards">
              {config.identity.origins.map((option, index) => (
                <label className="ccard radio-card" key={option.id}>
                  <input
                    name="originId"
                    type="radio"
                    value={option.id}
                    defaultChecked={index === 0}
                  />
                  <span className="ccard-mark" aria-hidden="true" />
                  <span className="ccard-body">
                    <strong className="ccard-label">{option.label}</strong>
                    <span className="ccard-desc">{option.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <button className="button" type="submit">
            Begin the First Turn
          </button>
        </form>
      </section>
      <LegalLinks />
    </main>
  );
}
