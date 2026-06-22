import { BrandHeader } from "@/components/brand-header";
import { CreemEmbeddedCheckout } from "@/components/creem-embedded-checkout";
import { LegalLinks } from "@/components/legal-links";
import Image from "next/image";
import Link from "next/link";
import type { RunRecord, SimulatorConfig } from "@/lib/types";
import { getFormattedPrice } from "@/lib/simulators/presentation";
import { variantSearchForConfig } from "@/lib/variants";

export function Paywall({ config, run }: { config: SimulatorConfig; run: RunRecord }) {
  const price = getFormattedPrice(config);
  const decisions = run.decisions.slice(-3).reverse();
  const paidTurns = config.paidScenes.length;
  const noun = config.slug === "queen" ? "reign" : "campaign";
  const crisis =
    config.paywall?.crisis ??
    (config.slug === "queen"
      ? "The rebellion has found its banner. Your court is waiting to see whether you are sovereign or prey."
      : "Europe is moving before dawn. Paris is waiting to see whether you are useful, dangerous, or inevitable.");
  const loss = config.paywall?.loss ?? "Leave now and this crisis remains unresolved.";
  const cta = config.paywall?.cta ?? `Continue My ${config.slug === "queen" ? "Reign" : "Campaign"}`;
  const endingNoun = config.slug === "queen" ? "ending" : "finale";
  const variantSearch = variantSearchForConfig(config);
  const embeddedCheckoutEnabled =
    process.env.VERCEL_ENV === "production" &&
    process.env.THRONEERA_CREEM_EMBEDDED_CHECKOUT !== "false";

  return (
    <main className={`page product-page ${config.themeClass}`}>
      <BrandHeader simulator={config.slug} />
      <section className="panel paywall-panel">
        <div className="pw-cliff">
          <p>{crisis}</p>
        </div>

        <div className="pw-seal" aria-hidden="true">
          <Image src="/assets/throne-era-logo.png" alt="" width={64} height={64} />
        </div>
        <p className="pw-loss">{loss}</p>
        <h1>{config.offer.label}</h1>
        <p className="copy">
          Finish this crisis from your exact save, carry every choice forward,
          and reveal the personalized {endingNoun} your reign has earned.
        </p>
        <div className="pw-value-strip" aria-label="What this unlock includes">
          <span>
            <strong>{paidTurns}</strong>
            locked decisions
          </span>
          <span>
            <strong>{config.endings.totalSlots}</strong>
            possible {endingNoun}s
          </span>
          <span>
            <strong>1</strong>
            exact save
          </span>
        </div>
        <div className="pw-price-card">
          <span className="pw-price-kicker">Launch unlock</span>
          <strong className="pw-price">{price}</strong>
          <span>Finish this run, no subscription</span>
        </div>
        <div className="pw-reassurance" aria-label="Checkout reassurance">
          <span>Secure embedded checkout</span>
          <span>Instant unlock after payment</span>
          <span>No subscription</span>
        </div>
        <CreemEmbeddedCheckout
          runId={run.id}
          simulator={config.slug}
          variantSearch={variantSearch}
          label={cta}
          enabled={embeddedCheckoutEnabled}
        />

        {decisions.length ? (
          <aside className="recap-card" aria-label={`Your ${noun} so far`}>
            <div className="recap-top">
              <span className="recap-label">
                Your {config.slug === "queen" ? "Reign" : "Campaign"} So Far
              </span>
              <span className="recap-name">{run.identity.name}</span>
            </div>
            <ol className="recap-decisions">
              {decisions.map((decision) => (
                <li key={`${decision.sceneId}-${decision.choiceId}-${decision.createdAt}`}>
                  <span className="recap-tone">{decision.intent}</span>
                  {decision.label}
                </li>
              ))}
            </ol>
            <div className="recap-stats">
              {Object.entries(run.realm).map(([key, value]) => (
                <span className="recap-stat" key={key}>
                  <strong>{value}</strong>
                  <small>{config.realmLabels[key as keyof typeof config.realmLabels]}</small>
                </span>
              ))}
            </div>
          </aside>
        ) : null}
        <ul className="benefits">
          <li>Your name, stats, and last choices carry forward</li>
          <li>Resolve the crisis and receive your personalized {endingNoun}</li>
          <li>Secure embedded checkout, no subscription, refund support available</li>
        </ul>
        <Link className="muted fine-print text-link" href={`/${config.slug}${variantSearch}`}>
          Return later
        </Link>
        <p className="muted fine-print">
          This unlock keeps the current {noun} available from this save.
        </p>
      </section>
      <LegalLinks />
    </main>
  );
}
