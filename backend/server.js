import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import * as Sentry from "@sentry/node";

dotenv.config();

// Initialize Sentry error tracking if DSN is configured
const backendDsn = process.env.SENTRY_DSN_BACKEND || process.env.SENTRY_DSN;

if (backendDsn && !backendDsn.includes("examplePublicKey")) {
  Sentry.init({
    dsn: backendDsn,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 0.2, // Sample 20% of transactions for performance
    beforeSend(event) {
      // 1. Scrub Authorization headers, tokens, and cookies
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
        delete event.request.headers["x-access-token"];
        delete event.request.headers["x-auth-token"];
      }

      // 2. Scrub sensitive body fields & PII (passwords, tokens, JWTs, keys, credit cards)
      if (event.request?.data) {
        if (typeof event.request.data === "object" && event.request.data !== null) {
          const sensitiveKeys = ["password", "token", "jwt", "secret", "apikey", "gemini_key", "authorization", "bearer"];
          const scrubObject = (obj) => {
            for (const key of Object.keys(obj)) {
              if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
                obj[key] = "[SCRUBBED]";
              } else if (typeof obj[key] === "object" && obj[key] !== null) {
                scrubObject(obj[key]);
              }
            }
          };
          scrubObject(event.request.data);
        } else if (typeof event.request.data === "string") {
          // If body is raw JSON or URL-encoded string
          event.request.data = event.request.data.replace(
            /(password|token|jwt|secret|apiKey)=([^&]*)/gi,
            "$1=[SCRUBBED]"
          );
        }
      }

      // 3. Scrub sensitive user details (PII)
      if (event.user) {
        delete event.user.ip_address;
        delete event.user.email;
        delete event.user.username;
      }

      return event;
    },
  });
}

import { connectDB } from "./config/db.js";
import destinationRoutes from "./routes/destinationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import plannerRoutes from "./routes/plannerRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import photoRoutes from "./routes/photoRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import ecoRoutes from "./routes/ecoRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { initEcoBackgroundWorker } from "./services/ecoFeedSync.js";

import Destination from "./models/Destination.js";
import { citiesData } from "./seed/citiesData.js";

connectDB().then(async () => {
  try {
    const count = await Destination.countDocuments();
    if (count === 0) {
      console.log("🌱 Database has 0 destinations. Auto-seeding initial destination catalog...");
      await Destination.insertMany(citiesData);
      console.log(`✅ Seeded ${citiesData.length} destinations.`);
    }
  } catch (seedErr) {
    console.warn("⚠️ Destination auto-seed check skipped or encountered error:", seedErr.message);
  }
});
initEcoBackgroundWorker();

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

// Security Headers middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Configure CORS for local development and production deployments
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server, or Postman)
      if (!origin) return callback(null, true);

      // Normalize origin (remove trailing slashes)
      const cleanOrigin = origin.replace(/\/+$/, "");

      const isExplicitlyAllowed = allowedOrigins.some(
        (allowed) => allowed && allowed.replace(/\/+$/, "") === cleanOrigin
      );

      // Also allow any *.vercel.app and *.netlify.app domains
      const isVercelDomain = /^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(cleanOrigin);
      const isNetlifyDomain = /^https:\/\/[a-zA-Z0-9_-]+\.netlify\.app$/.test(cleanOrigin);

      if (
        isExplicitlyAllowed ||
        isVercelDomain ||
        isNetlifyDomain ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, origin);
      }

      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      return callback(new Error("CORS origin not allowed"), false);
    },
    credentials: true,
  })
);

// Middleware — these must come first
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes — mounted after middleware
app.use("/api/planner", plannerRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/eco", ecoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", userRoutes);
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/destinations", destinationRoutes);



app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// Sentry error handler (must be after all controllers/routes)
if (backendDsn && !backendDsn.includes("examplePublicKey")) {
  Sentry.setupExpressErrorHandler(app);
}

// Fallback generic error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
