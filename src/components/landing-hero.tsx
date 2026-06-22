import Link from "next/link";
import Image from "next/image";
import { BrandHeader } from "@/components/brand-header";
import { LegalLinks } from "@/components/legal-links";
import type { SimulatorConfig } from "@/lib/types";
import {
  getFormattedPrice,
  getSimulatorVisuals,
  getStoryTurnCount,
} from "@/lib/simulators/presentation";
import { variantSearchForConfig } from "@/lib/variants";

export function LandingHero({ config }: { config: SimulatorConfig }) {
  const price = getFormattedPrice(config);
  const storyTurns = getStoryTurnCount(config);
  const visuals = getSimulatorVisuals(config);
  const alternate = config.crossSell.target;
  const variantSearch = variantSearchForConfig(config);

  return (
    <main className={`page product-page ${config.themeClass}`}>
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
            <Link className="button button-ghost" href={`/${alternate}`}>
              {visuals.switchLabel}
            </Link>
          </div>
          <p className="conversion-line">
            Free start / {price} full campaign / no subscription
          </p>
        </div>
      </section>
      <section className="landing-support" aria-label="Campaign details">
        <div className="trust-strip">
          <span>{config.prologueScenes.length} free turns</span>
          <span>{storyTurns} total story turns</span>
          <span>{config.endings.totalSlots} endings</span>
          <span>No sign-up</span>
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
