import { NextRequest, NextResponse } from "next/server";
import { QUEEN_VARIANT_IDS, isQueenVariantId } from "@/lib/variants";

const QUEEN_VARIANT_COOKIE = "throneera_queen_variant";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== "/queen") {
    return NextResponse.next();
  }

  const queryVariant = request.nextUrl.searchParams.get("variant");
  if (isQueenVariantId(queryVariant)) {
    const response = NextResponse.next();
    response.cookies.set(QUEEN_VARIANT_COOKIE, queryVariant, {
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
    return response;
  }

  const cookieVariant = request.cookies.get(QUEEN_VARIANT_COOKIE)?.value;
  const variant = isQueenVariantId(cookieVariant) ? cookieVariant : pickQueenVariant();
  const url = request.nextUrl.clone();
  url.searchParams.set("variant", variant);

  const response = NextResponse.redirect(url);
  response.cookies.set(QUEEN_VARIANT_COOKIE, variant, {
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
  return response;
}

function pickQueenVariant() {
  return QUEEN_VARIANT_IDS[Math.floor(Math.random() * QUEEN_VARIANT_IDS.length)] ?? "legacy";
}

export const config = {
  matcher: "/queen",
};
