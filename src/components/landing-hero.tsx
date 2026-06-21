import Link from "next/link";
import { BrandHeader } from "@/components/brand-header";
import type { SimulatorConfig } from "@/lib/types";

export function LandingHero({ config }: { config: SimulatorConfig }) {
  const price = `$${(config.offer.amountMinor / 100).toFixed(2)}`;

  return (
    <main className={`page product-page ${config.themeClass}`}>
      <BrandHeader simulator={config.slug} />
      <section className="hero">
        <div className="hero-mark" aria-hidden="true">
          {config.slug === "queen" ? "Q" : "N"}
        </div>
        <h1>{config.landing.headline}</h1>
        <p className="copy">{config.landing.subhead}</p>
        <p className="conversion-line">Free start / {price} full campaign / no subscription</p>
        <div className="actions">
          <Link className="button" href={`/${config.slug}/start`}>
            {config.landing.cta}
          </Link>
          <p className="muted">First meaningful decision in under a minute. No sign-up.</p>
        </div>
      </section>
    </main>
  );
}
