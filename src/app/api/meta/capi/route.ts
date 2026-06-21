import { NextResponse } from "next/server";

export async function POST() {
  if (!process.env.META_PIXEL_ID || !process.env.META_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "Meta CAPI is not configured on the server" },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, queued: false });
}
