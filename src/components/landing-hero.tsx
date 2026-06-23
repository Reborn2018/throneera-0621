import Link from "next/link";
import Image from "next/image";
import { BrandHeader } from "@/components/brand-header";
import { LegalLinks } from "@/components/legal-links";
import type { SimulatorConfig } from "@/lib/types";
import { getSimulatorVisuals } from "@/lib/simulators/presentation";
import { variantSearchForConfig } from "@/lib/variants";

export function LandingHero({ config }: { config: SimulatorConfig }) {
  const visuals = getSimulatorVisuals(config);
  const variantSearch = variantSearchForConfig(config);
  const variantClass = config.variantId ? `variant-${config.variantId}` : "";

  return (
    <main className={`page product-page ${config.themeClass} ${variantClass}`}>
      <BrandHeader simulator={config.slug} />
      <section className="hero cinematic-hero">
        <Image
          className="hero-image"
          src={visuals.heroImage}
          alt={visuals.heroAlt}
          fill
          sizes="100vw"
          priority
        />
        <div className="hero-frame" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="hero-copy">
          <p className="eyebrow">{visuals.kicker}</p>
          <h1>{config.landing.headline}</h1>
          <p className="copy">{config.landing.subhead}</p>
          <div className="actions hero-actions">
            <Link className="button" href={`/${config.slug}/start${variantSearch}`}>
              {config.landing.cta}
            </Link>
          </div>
          <p className="conversion-line">Begin inside the crisis. No account needed.</p>
        </div>
      </section>
      <section className="landing-support" aria-label="Story tension">
        <div className="trust-strip">
          {visuals.trust.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <div className="landing-proof">
          <p>{visuals.promise}</p>
          <p>{visuals.proof}</p>
        </div>
      </section>
      <LegalLinks />
    </main>
  );
}
