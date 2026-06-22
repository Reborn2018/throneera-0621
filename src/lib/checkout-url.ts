export function normalizeCreemCheckoutUrl(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    if (url.hostname === "creem.io") {
      url.hostname = "www.creem.io";
    }
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}
