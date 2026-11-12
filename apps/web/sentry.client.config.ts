import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || "development",
    
    // Adjust tracesSampleRate in production to balance quota and observability
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

    // Filter noisy local errors or cancelled network requests
    beforeSend(event, hint) {
      const error = hint.originalException;
      if (error instanceof Error && error.name === "AbortError") {
        return null; // Ignore user aborts
      }
      return event;
    },
  });
}
