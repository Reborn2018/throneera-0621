import Link from "next/link";

export function LegalLinks() {
  return (
    <footer className="legal-links" aria-label="Legal">
      <Link href="/privacy">Privacy</Link>
      <Link href="/terms">Terms</Link>
      <Link href="/refunds">Refunds</Link>
      <Link href="/support">Support</Link>
    </footer>
  );
}
