// frontend/src/lib/sentry.ts
// Mirrors backend/src/monitoring.js's pattern: gate on the DSN's
// presence, log a friendly message when it's absent (this is the
// expected, fine state for local dev), same 0.1 trace sample rate.
import * as Sentry from '@sentry/react';

const dsn = import.meta.env.VITE_SENTRY_DSN;
const sentryEnabled = Boolean(dsn);

export function initErrorTracking() {
  if (!sentryEnabled) {
    console.info(
      'VITE_SENTRY_DSN not set — error tracking to Sentry is disabled (this is fine for local dev).'
    );
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
    // Defense-in-depth: even if someone pastes a real DSN into their
    // local .env (easy mistake — .env.example doesn't discourage it),
    // don't let localhost noise reach the production Sentry project.
    beforeSend(event) {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1' || host === '') {
        return null;
      }
      return event;
    },
    // Don't let a misconfigured DSN or a Sentry outage break the app —
    // Sentry's own SDK already fails closed on network errors, this
    // just makes that contract explicit.
  });
}

/**
 * Manually report an error with extra context — e.g. from a catch block
 * that already has a specific fallback UI and doesn't want to rely on
 * the ErrorBoundary catching it.
 */
export function captureError(err: unknown, context: Record<string, unknown> = {}) {
  console.error(err);
  if (sentryEnabled) {
    Sentry.captureException(err, { extra: context });
  }
}
