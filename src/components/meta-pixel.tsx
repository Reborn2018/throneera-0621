"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getMetaPixelRouteEvent } from "@/lib/meta-pixel";

type FacebookPixel = (
  action: "init" | "track",
  eventName: string,
  params?: Record<string, string>,
) => void;

declare global {
  interface Window {
    fbq?: FacebookPixel;
  }
}

export function MetaPixel({ pixelId }: { pixelId?: string }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!pixelId || !pathname || typeof window.fbq !== "function") {
      return;
    }

    window.fbq("track", "PageView");

    const routeEvent = getMetaPixelRouteEvent(pathname);
    if (!routeEvent) {
      return;
    }

    const storageKey = `throneera:meta:${pathname}:${routeEvent.name}`;
    if (window.sessionStorage.getItem(storageKey)) {
      return;
    }

    window.sessionStorage.setItem(storageKey, "1");
    window.fbq("track", routeEvent.name, routeEvent.params);
  }, [pathname, pixelId]);

  if (!pixelId) {
    return null;
  }

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', ${JSON.stringify(pixelId)});
          `,
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          height="1"
          src={`https://www.facebook.com/tr?id=${encodeURIComponent(pixelId)}&ev=PageView&noscript=1`}
          style={{ display: "none" }}
          width="1"
        />
      </noscript>
    </>
  );
}
