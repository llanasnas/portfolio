"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CONSENT_EVENT,
  REOPEN_EVENT,
  loadConsent,
  saveConsent,
  type ConsentState,
} from "@/lib/cookies";
import styles from "./CookieConsent.module.css";

type View = "hidden" | "banner" | "modal";

function HudCorners() {
  return (
    <>
      <span className={`${styles.corner} ${styles.cornerTl}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerTr}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBl}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBr}`} aria-hidden="true" />
    </>
  );
}

function CookieGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-9-9c-0.2 1.5 0.8 3 2.5 3.2c1.2 0.15 2 1.2 2 2.3c0 1.3 1.1 2.3 2.4 2.2c1 -0.1 2 0.5 2.1 1.3z" />
      <circle cx="9" cy="11" r="1" fill="currentColor" />
      <circle cx="13" cy="15" r="1" fill="currentColor" />
      <circle cx="16" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

export function CookieConsent() {
  const [view, setView] = useState<View>("hidden");
  const [analytics, setAnalytics] = useState(true);
  const [preferences, setPreferences] = useState(true);

  // Load on mount + listen for reopen
  useEffect(() => {
    const existing = loadConsent();
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!existing) setView("banner");
    else {
      setAnalytics(existing.analytics);
      setPreferences(existing.preferences);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    const onOpen = () => {
      const cur = loadConsent();
      if (cur) {
        setAnalytics(cur.analytics);
        setPreferences(cur.preferences);
      }
      setView("modal");
    };
    window.addEventListener(REOPEN_EVENT, onOpen);
    return () => window.removeEventListener(REOPEN_EVENT, onOpen);
  }, []);

  // Sync state if consent changed elsewhere
  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<ConsentState | null>).detail;
      if (!detail) return;
      setAnalytics(detail.analytics);
      setPreferences(detail.preferences);
    };
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  const acceptAll = useCallback(() => {
    saveConsent({ analytics: true, preferences: true });
    setAnalytics(true);
    setPreferences(true);
    setView("hidden");
  }, []);
  const rejectAll = useCallback(() => {
    saveConsent({ analytics: false, preferences: false });
    setAnalytics(false);
    setPreferences(false);
    setView("hidden");
  }, []);
  const saveCustom = useCallback(() => {
    saveConsent({ analytics, preferences });
    setView("hidden");
  }, [analytics, preferences]);

  // Floating reopen trigger always rendered (after initial choice)
  const reopen = () => setView("modal");

  if (view === "hidden") {
    return (
      <button
        type="button"
        className={styles.trigger}
        onClick={reopen}
        aria-label="Open cookie preferences"
        title="Cookie preferences"
      >
        <CookieGlyph />
      </button>
    );
  }

  return (
    <div
      className={`${styles.root} ${view === "modal" ? styles.modal : ""}`}
      role="dialog"
      aria-modal={view === "modal"}
      aria-labelledby="cookie-title"
    >
      <div className={styles.shell}>
        <HudCorners />
        <div className={styles.head}>
          <span className={styles.kicker}>
            <span className={styles.kickerDot} />
            {"// policy.consent"}
          </span>
        </div>
        <h2 id="cookie-title" className={styles.title}>
          {view === "modal" ? "Cookie preferences" : "Cookies on this site"}
        </h2>
        <p className={styles.body}>
          This site uses cookies for analytics and to remember UI preferences.
          Necessary cookies are always on. Choose what to enable.
        </p>

        {view === "modal" ? (
          <div className={styles.list}>
            <div className={`${styles.cat} ${styles.on}`}>
              <div>
                <p className={styles.catLabel}>
                  Necessary <span>Always on</span>
                </p>
                <p className={styles.catDesc}>
                  Required for routing, security and basic functionality. Cannot
                  be disabled.
                </p>
              </div>
              <div className={`${styles.toggle} ${styles.on} ${styles.locked}`}>
                <span className={styles.toggleKnob} />
              </div>
            </div>

            <div className={`${styles.cat} ${analytics ? styles.on : ""}`}>
              <div>
                <p className={styles.catLabel}>Analytics</p>
                <p className={styles.catDesc}>
                  Google Analytics — anonymous usage signals so I can see which
                  pages are read. No personal profiling.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={analytics}
                onClick={() => setAnalytics((v) => !v)}
                className={`${styles.toggle} ${analytics ? styles.on : ""}`}
                aria-label="Toggle analytics cookies"
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>

            <div className={`${styles.cat} ${preferences ? styles.on : ""}`}>
              <div>
                <p className={styles.catLabel}>Preferences</p>
                <p className={styles.catDesc}>
                  Remember UI choices (theme, motion preferences, last visited
                  section).
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={preferences}
                onClick={() => setPreferences((v) => !v)}
                className={`${styles.toggle} ${preferences ? styles.on : ""}`}
                aria-label="Toggle preference cookies"
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>
          </div>
        ) : null}

        <div className={styles.row}>
          {view === "banner" ? (
            <button
              type="button"
              className={styles.link}
              onClick={() => setView("modal")}
            >
              Manage
            </button>
          ) : null}
          <button
            type="button"
            onClick={rejectAll}
            className={`${styles.btn} ${styles.btnGhost}`}
          >
            Reject all
          </button>
          {view === "modal" ? (
            <button
              type="button"
              onClick={saveCustom}
              className={styles.btn}
            >
              Save choices
            </button>
          ) : null}
          <button
            type="button"
            onClick={acceptAll}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            Accept all →
          </button>
        </div>

        <p className={styles.bodyMono}>
          {"// stored locally · revoke anytime via this panel"}
        </p>
      </div>
    </div>
  );
}
