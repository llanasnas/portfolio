// Lightweight cookie consent storage — localStorage backed.
// Categories: necessary (always on), analytics (GA), preferences (UI prefs).

export type ConsentCategory = "necessary" | "analytics" | "preferences";

export type ConsentState = {
  necessary: true;
  analytics: boolean;
  preferences: boolean;
  v: 1;
  ts: number;
};

const KEY = "gl.consent.v1";
export const CONSENT_EVENT = "gl:consent-change";
export const REOPEN_EVENT = "gl:consent-open";

export function loadConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (parsed.v !== 1) return null;
    return {
      necessary: true,
      analytics: !!parsed.analytics,
      preferences: !!parsed.preferences,
      v: 1,
      ts: typeof parsed.ts === "number" ? parsed.ts : Date.now(),
    };
  } catch {
    return null;
  }
}

export function saveConsent(partial: {
  analytics: boolean;
  preferences: boolean;
}) {
  if (typeof window === "undefined") return;
  const next: ConsentState = {
    necessary: true,
    analytics: partial.analytics,
    preferences: partial.preferences,
    v: 1,
    ts: Date.now(),
  };
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: next }));
}

export function clearConsent() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }));
}

export function openConsentPanel() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(REOPEN_EVENT));
}
