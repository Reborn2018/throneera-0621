"use client";

import Script from "next/script";
import { useRef, useState } from "react";
import type { SimulatorSlug } from "@/lib/types";

interface CreemCompleteDetail {
  checkoutId?: string;
  orderId?: string;
  orderNo?: string;
  redirect?: boolean;
  redirectUrl?: string;
}

interface CreemEmbed {
  openCheckout(options: {
    checkoutUrl: string;
    theme?: "light" | "dark";
    onComplete?: (detail: CreemCompleteDetail) => void;
    onClose?: () => void;
    onReady?: () => void;
  }): { close: () => void };
}

declare global {
  interface Window {
    Creem?: CreemEmbed;
  }
}

export function CreemEmbeddedCheckout({
  runId,
  simulator,
  variantSearch,
  label,
  enabled,
}: {
  runId: string;
  simulator: SimulatorSlug;
  variantSearch: string;
  label: string;
  enabled: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!enabled) {
      return;
    }

    const creem = window.Creem;
    if (!creem?.openCheckout) {
      return;
    }

    event.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({ runId }),
      });

      if (!response.ok) {
        throw new Error(`Checkout failed with ${response.status}`);
      }

      const session = (await response.json()) as { checkoutUrl?: string };
      if (!session.checkoutUrl) {
        throw new Error("Checkout URL missing");
      }

      creem.openCheckout({
        checkoutUrl: session.checkoutUrl,
        theme: "dark",
        onComplete(detail) {
          const returnUrl =
            detail.redirectUrl ?? `/${simulator}/return?runId=${encodeURIComponent(runId)}${variantSearch ? `&${variantSearch.slice(1)}` : ""}`;
          window.location.assign(returnUrl);
        },
        onClose() {
          setIsPending(false);
        },
      });
    } catch {
      setError("Checkout could not open here. Redirecting to secure checkout...");
      window.setTimeout(() => {
        if (formRef.current) {
          HTMLFormElement.prototype.submit.call(formRef.current);
        }
      }, 500);
    }
  }

  return (
    <>
      {enabled ? <Script src="https://www.creem.io/embed.js" strategy="afterInteractive" /> : null}
      <form ref={formRef} className="actions" method="post" action="/api/checkout" onSubmit={onSubmit}>
        <input type="hidden" name="runId" value={runId} />
        <button className="button" type="submit" aria-busy={isPending}>
          {isPending ? "Opening Secure Checkout..." : label}
        </button>
      </form>
      {error ? (
        <p className="muted fine-print checkout-error" role="status">
          {error}
        </p>
      ) : null}
    </>
  );
}
