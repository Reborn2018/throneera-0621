"use client";

import { CreemCheckoutInline } from "@creem_io/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { normalizeCreemCheckoutUrl } from "@/lib/checkout-url";
import type { SimulatorSlug } from "@/lib/types";

type CheckoutMode = "open" | "prefetch";

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
  const checkoutUrlRef = useRef<string | null>(null);
  const prefetchPromiseRef = useRef<Promise<string | null> | null>(null);
  const checkoutReadyRef = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isCheckoutVisible, setIsCheckoutVisible] = useState(false);
  const [isCheckoutReady, setIsCheckoutReady] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestCheckout = useCallback(
    async (mode: CheckoutMode, signal?: AbortSignal): Promise<string> => {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({ runId, mode }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`Checkout failed with ${response.status}`);
      }

      const session = (await response.json()) as { checkoutUrl?: string };
      if (!session.checkoutUrl) {
        throw new Error("Checkout URL missing");
      }

      const normalizedCheckoutUrl = normalizeCreemCheckoutUrl(session.checkoutUrl);
      checkoutUrlRef.current = normalizedCheckoutUrl;
      setCheckoutUrl(normalizedCheckoutUrl);
      return normalizedCheckoutUrl;
    },
    [runId],
  );

  useEffect(() => {
    const hydrateTimer = window.setTimeout(() => setIsHydrated(true), 0);

    return () => {
      window.clearTimeout(hydrateTimer);
    };
  }, []);

  useEffect(() => {
    if (!enabled || checkoutUrlRef.current || prefetchPromiseRef.current) {
      return;
    }

    const controller = new AbortController();
    prefetchPromiseRef.current = requestCheckout("prefetch", controller.signal).catch(() => null);

    return () => {
      controller.abort();
    };
  }, [enabled, requestCheckout]);

  useEffect(() => {
    if (!isCheckoutVisible) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isCheckoutVisible]);

  function recordCheckoutStarted(): void {
    void fetch("/api/checkout", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ runId, mode: "open" }),
      keepalive: true,
    }).catch(() => undefined);
  }

  function completeCheckout(detail: { redirectUrl?: string }): void {
    const returnUrl =
      detail.redirectUrl ?? `/${simulator}/return?runId=${encodeURIComponent(runId)}${variantSearch ? `&${variantSearch.slice(1)}` : ""}`;
    window.location.assign(returnUrl);
  }

  function closeCheckout(): void {
    setIsCheckoutVisible(false);
    setIsPending(false);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!enabled) {
      return;
    }

    event.preventDefault();
    setIsCheckoutVisible(true);
    setIsPending(!checkoutReadyRef.current);
    setError(null);

    try {
      const prefetchedCheckoutUrl =
        checkoutUrlRef.current ?? (prefetchPromiseRef.current ? await prefetchPromiseRef.current : null);
      const checkoutUrl = prefetchedCheckoutUrl ?? (await requestCheckout("open"));

      if (prefetchedCheckoutUrl) {
        recordCheckoutStarted();
      }
      setCheckoutUrl(checkoutUrl);
      if (checkoutReadyRef.current) {
        setIsPending(false);
      }
    } catch {
      setIsCheckoutVisible(false);
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
      <form ref={formRef} className="actions" method="post" action="/api/checkout" onSubmit={onSubmit}>
        <input type="hidden" name="runId" value={runId} />
        <button className="button" type="submit" aria-busy={isPending} disabled={enabled ? !isHydrated || isPending : false}>
          {isPending ? "Opening Secure Checkout..." : enabled && !isHydrated ? "Preparing Secure Checkout..." : label}
        </button>
      </form>
      {enabled && checkoutUrl ? (
        <div
          className={`creem-checkout-overlay${isCheckoutVisible ? " is-visible" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-hidden={!isCheckoutVisible}
          aria-label="Secure checkout"
        >
          <div className="creem-checkout-column">
            <button className="creem-checkout-close" type="button" aria-label="Close checkout" onClick={closeCheckout}>
              <span aria-hidden="true">x</span>
            </button>
            <div className="creem-checkout-frame-shell">
              <CreemCheckoutInline
                checkoutUrl={checkoutUrl}
                theme="dark"
                className="creem-checkout-inline"
                style={{ width: "100%", height: "100%" }}
                onReady={() => {
                  checkoutReadyRef.current = true;
                  setIsCheckoutReady(true);
                  setIsPending(false);
                }}
                onComplete={completeCheckout}
              />
              {!isCheckoutReady ? (
                <div className="creem-checkout-loading" role="status">
                  Opening secure checkout...
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
      {error ? (
        <p className="muted fine-print checkout-error" role="status">
          {error}
        </p>
      ) : null}
    </>
  );
}
