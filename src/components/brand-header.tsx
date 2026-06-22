import Link from "next/link";
import Image from "next/image";
import type { SimulatorSlug } from "@/lib/types";

export function BrandHeader({
  simulator,
  showCampaignSwitcher = false,
}: {
  simulator?: SimulatorSlug;
  showCampaignSwitcher?: boolean;
}) {
  const alternate = showCampaignSwitcher
    ? simulator === "queen"
      ? "napoleon"
      : simulator === "napoleon"
        ? "queen"
        : null
    : null;
  const alternateLabel = alternate === "queen" ? "Queen" : alternate === "napoleon" ? "Napoleon" : null;

  return (
    <header className="brand-header">
      <Link className="brand" href={simulator ? `/${simulator}` : "/queen"}>
        <Image
          className="brand-logo"
          src="/assets/throne-era-logo.png"
          alt=""
          width={36}
          height={36}
          sizes="36px"
          priority
        />
        <span>ThroneEra</span>
      </Link>
      {alternate && alternateLabel ? (
        <nav aria-label="Campaign switcher">
          <Link className="nav-campaign" href={`/${alternate}`}>
            {alternateLabel}
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
