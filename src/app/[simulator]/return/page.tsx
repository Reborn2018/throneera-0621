import { notFound } from "next/navigation";
import { ReturnCard } from "@/components/return-card";
import { isSimulatorSlug } from "@/lib/simulators";
import { syncCreemReturnEntitlement } from "@/lib/server/creem-return";
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

  const store = await getStore();
  let run = runId ? await store.getRun(runId) : null;
  if (run) {
    try {
      run = await syncCreemReturnEntitlement({
        store,
        run,
        apiKey: process.env.CREEM_API_KEY,
        apiBaseUrl: process.env.CREEM_API_BASE_URL,
      });
    } catch (error) {
      console.error("Unable to sync Creem checkout return", error);
    }
  }

  return <ReturnCard simulator={simulator} run={run} />;
}
