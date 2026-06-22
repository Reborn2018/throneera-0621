import Image from "next/image";
import Link from "next/link";
import { BrandHeader } from "@/components/brand-header";
import { LegalLinks } from "@/components/legal-links";
import type { SimulatorConfig } from "@/lib/types";
import {
  getFormattedPrice,
  getSimulatorVisuals,
  getStoryTurnCount,
} from "@/lib/simulators/presentation";

export function CampaignGateway({ campaigns }: { campaigns: SimulatorConfig[] }) {
  return (
    <main className="page product-page gateway-page">
      <BrandHeader />
      <section className="gateway-hero">
        <p className="eyebrow">Ruler Simulator</p>
        <h1>ThroneEra</h1>
        <p className="copy">
          Choose a reign, make the first irreversible order, and see whether history
          turns your ambition into legend or ruin.
        </p>
      </section>
      <section className="gateway-grid" aria-label="Choose a simulator">
        {campaigns.map((config) => {
          const visuals = getSimulatorVisuals(config);
          const storyTurns = getStoryTurnCount(config);
          const price = getFormattedPrice(config);

          return (
            <Link
              className={`gateway-card ${config.themeClass}`}
              href={`/${config.slug}`}
              key={config.slug}
            >
              <Image
                className="gateway-image"
                src={visuals.heroImage}
                alt={visuals.heroAlt}
                fill
                sizes="(min-width: 820px) 50vw, 100vw"
                priority
              />
              <span className="gateway-card-copy">
                <span className="eyebrow">{visuals.kicker}</span>
                <strong>{config.title}</strong>
                <span>{config.landing.subhead}</span>
                <small>
                  {config.prologueScenes.length} free turns / {storyTurns} total /{" "}
                  {price} full campaign
                </small>
              </span>
            </Link>
          );
        })}
      </section>
      <LegalLinks />
    </main>
  );
}
