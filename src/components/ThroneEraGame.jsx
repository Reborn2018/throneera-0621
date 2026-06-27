"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { openCheckout } from "@creem_io/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { normalizeCreemCheckoutUrl } from "@/lib/checkout-url";
import { getMetaPixelCheckoutStartedEvent } from "@/lib/meta-pixel";
import { TE_DATA } from "@/components/throneera-redesign/data";
import { Ending, Landing, Paywall, Play, Coronation, Start } from "@/components/throneera-redesign/screens";
import { REDESIGN_CSS } from "@/components/throneera-redesign/styles";

const CHECKOUT_VERIFY_ATTEMPTS = 4;

function randomRunId(era) {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `redesign-${era}-${id}`;
}

function freshRun(era) {
  return {
    id: randomRunId(era),
    name: "",
    identity: [],
    decisions: [],
    stats: null,
    flags: {},
    dispositionId: null,
    originId: null,
  };
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function ThroneEraGame({ era = "queen" }) {
  const campaign = TE_DATA[era] ? era : "queen";
  const d = TE_DATA[campaign];
  const [step, setStep] = useState("landing");
  const [run, setRun] = useState(() => freshRun(campaign));
  const [runUnlocked, setRunUnlocked] = useState(false);
  const [unlimitedUnlocked, setUnlimitedUnlocked] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const prefetchRef = useRef({});

  useEffect(() => {
    if (document.getElementById("throneera-redesign-css")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "throneera-redesign-css";
    style.textContent = REDESIGN_CSS;
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    try {
      setUnlimitedUnlocked(window.localStorage.getItem("throneera:redesign:unlimited") === "1");
    } catch {
      setUnlimitedUnlocked(false);
    }
  }, []);

  useEffect(() => {
    setStep("landing");
    setRun(freshRun(campaign));
    setRunUnlocked(false);
    setCheckoutError("");
    prefetchRef.current = {};
  }, [campaign]);

  const isPaidForThisRun = runUnlocked || unlimitedUnlocked;

  const createCheckout = useCallback(
    async (purchaseKind, mode) => {
      const response = await fetch("/api/engine-v3/checkout", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          era: campaign,
          runId: run.id,
          rulerName: run.name || d.start.namePlaceholder,
          purchaseKind,
          mode,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Checkout could not be created");
      }
      return payload;
    },
    [campaign, d.start.namePlaceholder, run.id, run.name],
  );

  const prefetchCheckout = useCallback(
    (purchaseKind) => {
      const key = `${run.id}:${purchaseKind}`;
      if (!prefetchRef.current[key]) {
        prefetchRef.current[key] = createCheckout(purchaseKind, "prefetch").catch((error) => {
          delete prefetchRef.current[key];
          throw error;
        });
      }
      return prefetchRef.current[key];
    },
    [createCheckout, run.id],
  );

  useEffect(() => {
    if (step === "paywall" && !isPaidForThisRun) {
      void prefetchCheckout("campaign").catch(() => undefined);
    }
    if (step === "ending" && !unlimitedUnlocked) {
      void prefetchCheckout("replay").catch(() => undefined);
      void prefetchCheckout("unlimited").catch(() => undefined);
    }
  }, [isPaidForThisRun, prefetchCheckout, step, unlimitedUnlocked]);

  const verifyCheckout = useCallback(async (checkoutRunId, purchaseKind) => {
    let lastError = "Payment has not been verified yet";
    for (let attempt = 0; attempt < CHECKOUT_VERIFY_ATTEMPTS; attempt += 1) {
      const response = await fetch("/api/engine-v3/checkout/complete", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({ checkoutRunId, purchaseKind }),
      });
      const payload = await response.json();
      if (response.ok && payload.verified) {
        return true;
      }
      lastError = payload?.error || lastError;
      await sleep(900);
    }
    throw new Error(lastError);
  }, []);

  const trackMetaInitiateCheckout = useCallback(
    (purchaseKind) => {
      if (typeof window === "undefined" || typeof window.fbq !== "function") {
        return;
      }

      const event = getMetaPixelCheckoutStartedEvent(campaign);
      if (!event) {
        return;
      }

      const storageKey = `throneera:redesign:initiate-checkout:${run.id}:${purchaseKind}`;
      try {
        if (window.sessionStorage.getItem(storageKey)) {
          return;
        }
        window.sessionStorage.setItem(storageKey, "1");
      } catch {
        // Continue without client-side dedupe storage if the browser blocks it.
      }

      window.fbq("track", event.name, {
        ...event.params,
        content_name: `${event.params.content_name}_redesign`,
        purchase_kind: purchaseKind,
      });
    },
    [campaign, run.id],
  );

  const startCheckout = useCallback(
    async (purchaseKind, afterVerifiedPurchase) => {
      setCheckoutError("");
      setCheckoutBusy(true);
      trackMetaInitiateCheckout(purchaseKind);

      try {
        const checkout = await createCheckout(purchaseKind, "open");
        if (checkout.verified) {
          await afterVerifiedPurchase();
          return;
        }

        const checkoutUrl = normalizeCreemCheckoutUrl(checkout.checkoutUrl || "");
        if (checkoutUrl.startsWith("/api/mock-checkout")) {
          await fetch(checkoutUrl);
          await verifyCheckout(checkout.checkoutRunId, purchaseKind);
          await afterVerifiedPurchase();
          return;
        }

        setCheckoutBusy(false);
        openCheckout({
          checkoutUrl,
          theme: "dark",
          onComplete: () => {
            void (async () => {
              setCheckoutBusy(true);
              try {
                await verifyCheckout(checkout.checkoutRunId, purchaseKind);
                await afterVerifiedPurchase();
              } catch (error) {
                setCheckoutError(error instanceof Error ? error.message : "Payment could not be verified");
              } finally {
                setCheckoutBusy(false);
              }
            })();
          },
        });
      } catch (error) {
        setCheckoutError(error instanceof Error ? error.message : "Checkout could not be opened");
      } finally {
        setCheckoutBusy(false);
      }
    },
    [createCheckout, trackMetaInitiateCheckout, verifyCheckout],
  );

  const restartCampaign = useCallback(
    (prepaid = false, nextStep = "landing") => {
      setRun(freshRun(campaign));
      setRunUnlocked(Boolean(prepaid || unlimitedUnlocked));
      setCheckoutError("");
      prefetchRef.current = {};
      setStep(nextStep);
    },
    [campaign, unlimitedUnlocked],
  );

  const handleStart = useCallback(() => {
    setStep("start");
  }, []);

  const handleStartSubmit = useCallback((payload) => {
    setRun((current) => ({
      ...current,
      name: payload.name,
      identity: payload.identity,
      dispositionId: payload.dispositionId,
      originId: payload.originId,
    }));
    setStep("coronation");
  }, []);

  const handleReachPaywall = useCallback(
    (decisions, stats, flags) => {
      setRun((current) => ({
        ...current,
        decisions,
        stats,
        flags: flags || current.flags,
      }));
      setStep(isPaidForThisRun ? "playPaid" : "paywall");
    },
    [isPaidForThisRun],
  );

  const handleUnlock = useCallback(() => {
    void startCheckout("campaign", async () => {
      setRunUnlocked(true);
      setStep("playPaid");
    });
  }, [startCheckout]);

  const handleCampaignComplete = useCallback((decisions, stats, flags) => {
    setRun((current) => ({
      ...current,
      decisions: [...(current.decisions || []), ...(decisions || [])],
      stats,
      flags: flags || current.flags,
    }));
    setStep("ending");
  }, []);

  const handleUpsell = useCallback(
    (tier) => {
      const purchaseKind = tier?.id === "season" ? "unlimited" : "replay";
      void startCheckout(purchaseKind, async () => {
        if (purchaseKind === "unlimited") {
          setUnlimitedUnlocked(true);
          try {
            window.localStorage.setItem("throneera:redesign:unlimited", "1");
          } catch {
            // Local persistence is a convenience; paid server entitlement remains authoritative.
          }
        }
        restartCampaign(true, "start");
      });
    },
    [restartCampaign, startCheckout],
  );

  const screen = useMemo(() => {
    if (step === "landing") {
      return <Landing d={d} onStart={handleStart} />;
    }
    if (step === "start") {
      return <Start d={d} onSubmit={handleStartSubmit} />;
    }
    if (step === "coronation") {
      return <Coronation d={d} run={run} onEnter={() => setStep("playFree")} />;
    }
    if (step === "playFree") {
      return <Play d={d} onReachPaywall={handleReachPaywall} />;
    }
    if (step === "playPaid") {
      return (
        <Play
          d={d}
          mode="paid"
          initialStats={run.stats}
          initialFlags={run.flags}
          onComplete={handleCampaignComplete}
        />
      );
    }
    if (step === "paywall") {
      return (
        <Paywall
          d={d}
          run={run}
          onUnlock={handleUnlock}
          onLater={() => restartCampaign(false, "landing")}
        />
      );
    }
    return <Ending d={d} run={run} onAgain={() => restartCampaign(unlimitedUnlocked, "landing")} onUpsell={handleUpsell} />;
  }, [
    d,
    handleCampaignComplete,
    handleReachPaywall,
    handleStart,
    handleStartSubmit,
    handleUnlock,
    handleUpsell,
    restartCampaign,
    run,
    step,
    unlimitedUnlocked,
  ]);

  return (
    <div className="te-live-page">
      <div className={`te-live ${d.theme}`}>
        <div className={`stage-bg bg-${campaign}`} />
        <div className="grain" />
        <div className="viewport">{screen}</div>
        {checkoutBusy ? <div className="checkout-busy">Opening secure checkout...</div> : null}
        {checkoutError ? (
          <div className="checkout-busy" role="alert" onClick={() => setCheckoutError("")}>
            {checkoutError}
          </div>
        ) : null}
      </div>
    </div>
  );
}
