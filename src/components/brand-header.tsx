import Link from "next/link";
import type { SimulatorSlug } from "@/lib/types";

export function BrandHeader({ simulator }: { simulator?: SimulatorSlug }) {
  return (
    <header className="brand-header">
      <Link className="brand" href={simulator ? `/${simulator}` : "/queen"}>
        ThroneEra
      </Link>
      <nav aria-label="Legal">
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/refunds">Refunds</Link>
        <Link href="/support">Support</Link>
      </nav>
    </header>
  );
}
