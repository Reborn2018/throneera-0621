import Link from "next/link";
import { BrandHeader } from "@/components/brand-header";
import { LegalLinks } from "@/components/legal-links";
import type { RunRecord, SimulatorSlug } from "@/lib/types";

export function ReturnCard({
  simulator,
  run,
}: {
  simulator: SimulatorSlug;
  run: RunRecord | null;
}) {
  return (
    <main className="page product-page">
      <BrandHeader simulator={simulator} />
      <section className="panel">
        <p className="meta">Payment return</p>
        <h1>Your reign is checked on the server.</h1>
        <p className="copy">
          This page never trusts the payment URL. It reads the run status after the
          signed webhook updates the server.
        </p>
        {run ? (
          <Link className="button" href={`/${simulator}/play/${run.id}`}>
            Resume the Throne
          </Link>
        ) : (
          <Link className="button" href={`/${simulator}`}>
            Return to {simulator}
          </Link>
        )}
      </section>
      <LegalLinks />
    </main>
  );
}
