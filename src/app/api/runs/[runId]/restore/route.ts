import { NextResponse } from "next/server";
import { createRestoreToken } from "@/lib/engine/runs";
import { getStore } from "@/lib/server/store";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const { runId } = await params;
  const token = await createRestoreToken({
    store: await getStore(),
    runId,
    expiresInMinutes: 60 * 24,
  });

  return NextResponse.json({ token, restoreUrl: `/restore/${token}` });
}
