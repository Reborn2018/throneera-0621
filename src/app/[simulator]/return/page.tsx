import { notFound } from "next/navigation";
import { ReturnCard } from "@/components/return-card";
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

  return <ReturnCard simulator={simulator} run={run} />;
}
