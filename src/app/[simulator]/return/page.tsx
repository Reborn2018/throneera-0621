import Link from "next/link";
import { notFound } from "next/navigation";
import { isSimulatorSlug } from "@/lib/simulators";
import { getStore } from "@/lib/server/store";

export default async function ReturnPage({
  params,
  searchParams,
}: {
  params: Promise<{ simulator: string }>;
  searchParams: Promise<{ runId?: string }>;
}) {
  const { simulator } = await params;
  const { runId } = await searchParams;
  if (!isSimulatorSlug(simulator)) {
    notFound();
  }

  const run = runId ? await (await getStore()).getRun(runId) : null;

  return (
    <main className="page">
      <section className="panel">
        <div className="brand">ThroneEra</div>
        <p className="meta">Payment return</p>
        <h1>Your reign is checked on the server.</h1>
        <p className="copy">
          This page never trusts the payment URL. It reads the run status from the
          server after the signed webhook updates the run.
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
    </main>
  );
}
