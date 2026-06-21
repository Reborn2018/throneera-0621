import Link from "next/link";
import { restoreRunFromToken } from "@/lib/engine/runs";
import { getStore } from "@/lib/server/store";

export default async function RestorePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  let href = "/queen";
  let message = "Restore link could not be used.";

  try {
    const run = await restoreRunFromToken({
      store: await getStore(),
      token,
    });
    href = `/${run.simulator}/play/${run.id}`;
    message = `Your ${run.simulator} run has been restored.`;
  } catch (error) {
    message = error instanceof Error ? error.message : message;
  }

  return (
    <main className="page">
      <section className="panel">
        <div className="brand">ThroneEra</div>
        <h1>Restore your reign</h1>
        <p className="copy">{message}</p>
        <Link className="button" href={href}>
          Continue
        </Link>
      </section>
    </main>
  );
}
