import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="page">
      <section className="panel">
        <div className="brand">ThroneEra</div>
        <h1>{title}</h1>
        <div className="copy">{children}</div>
        <Link className="muted" href="/queen">
          Back to Queen
        </Link>
      </section>
    </main>
  );
}
