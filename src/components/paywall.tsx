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
  const pitch = getPaywallPitch(config, run, paidTurns, endingNoun);
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
        <h1>{pitch.headline}</h1>
        <p className="copy">{pitch.lead}</p>
        <div className="pw-unlock-case" aria-label="Why unlock this run">
          <span className="pw-case-kicker">What your unlock protects</span>
          <ul className="pw-proof-list">
            {pitch.proof.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>{pitch.stakes}</p>
        </div>
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
          label={`${cta} - ${price}`}
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

function getPaywallPitch(
  config: SimulatorConfig,
  run: RunRecord,
  paidTurns: number,
  endingNoun: string,
) {
  if (config.slug === "queen" && config.variantId === "crown") {
    return {
      headline: "Do not let her keep your crown.",
      lead: `${run.identity.name}, the court has already seen your answer. Unlock the rest of this run to see whether your sister kneels, is exposed, or makes your humiliation permanent.`,
      proof: [
        "Your exact choices, posture, and court stats carry forward",
        `The next ${paidTurns} locked decisions resolve the stolen-crown crisis`,
        `Reach one of ${config.endings.totalSlots} endings shaped by your revenge`,
      ],
      stakes: "Stop here and Seraphine keeps the crown, the court, and the public story.",
    };
  }

  if (config.slug === "queen" && config.variantId === "betrayal") {
    return {
      headline: "Make the betrayal answer to you.",
      lead: `${run.identity.name}, your husband thinks tonight ends with your signature. Unlock the rest of this run to turn the heir scandal into judgment, exile, or revenge.`,
      proof: [
        "Your exact choices, identity, and court stats carry forward",
        `The next ${paidTurns} locked decisions decide the marriage, the heir, and the throne`,
        `Reach one of ${config.endings.totalSlots} endings shaped by how you strike back`,
      ],
      stakes: "Stop here and Rowan writes you out of the succession before dawn.",
    };
  }

  if (config.slug === "queen") {
    return {
      headline: "Finish the reign your choices started.",
      lead: `${run.identity.name}, your court is already reacting to your first decrees. Unlock the rest of this run to resolve the rebellion and reveal the personalized ${endingNoun} your reign has earned.`,
      proof: [
        "Your name, stats, and last choices carry forward",
        `The next ${paidTurns} locked decisions decide whether your reign survives`,
        `Reach one of ${config.endings.totalSlots} endings written around your route`,
      ],
      stakes: "Stop here and this version of your reign stays unfinished.",
    };
  }

  return {
    headline: config.offer.label,
    lead: `Finish this crisis from your exact save, carry every choice forward, and reveal the personalized ${endingNoun} your campaign has earned.`,
    proof: [
      "Your name, stats, and last choices carry forward",
      `The next ${paidTurns} locked decisions resolve this campaign`,
      `Reach one of ${config.endings.totalSlots} possible ${endingNoun}s`,
    ],
    stakes: "Stop here and this campaign remains unresolved.",
  };
}
