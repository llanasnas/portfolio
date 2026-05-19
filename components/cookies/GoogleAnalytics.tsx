"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { CONSENT_EVENT, loadConsent, type ConsentState } from "@/lib/cookies";

const GA_ID = "G-W830YE8HXL";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function GoogleAnalytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const c = loadConsent();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAllowed(!!c?.analytics);
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<ConsentState | null>).detail;
      setAllowed(!!detail?.analytics);
    };
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  if (!allowed) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
