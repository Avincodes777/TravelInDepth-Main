import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { GoogleOAuthProvider } from "@react-oauth/google";
import * as Sentry from "@sentry/react";

const sentryDsn = import.meta.env.VITE_SENTRY_DSN_FRONTEND || import.meta.env.VITE_SENTRY_DSN;

if (sentryDsn && !sentryDsn.includes("examplePublicKey")) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    tracesSampleRate: 0.1,
    beforeSend(event) {
      // 1. Scrub token/credentials and query params from request URLs
      if (event.request?.url) {
        event.request.url = event.request.url.replace(
          /([?&])(token|key|secret|password|jwt|auth)=[^&#]*/gi,
          "$1$2=[SCRUBBED]"
        );
      }

      // 2. Scrub sensitive localStorage / context items in breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((b) => {
          if (b.data && typeof b.data === "object") {
            const scrubbedData = { ...b.data };
            for (const k of Object.keys(scrubbedData)) {
              if (/token|password|auth|jwt|secret|bearer/i.test(k)) {
                scrubbedData[k] = "[SCRUBBED]";
              }
            }
            return { ...b, data: scrubbedData };
          }
          return b;
        });
      }

      // 3. Scrub sensitive user fields (PII)
      if (event.user) {
        delete event.user.ip_address;
        delete event.user.email;
        delete event.user.username;
      }

      return event;
    },
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </HelmetProvider>
  </React.StrictMode>
);