// Simple in-memory rate limiter — good enough for now.
// Limits each logged-in user to a max number of AI planner requests per window.
// NOTE: this resets if the server restarts, and won't work across multiple
// server instances — fine for a single-server deployment, revisit if you scale.

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 10;

const requestLog = new Map(); // userId -> [timestamps]

export const plannerRateLimit = (req, res, next) => {
  const identifier = req.userId || req.ip || req.headers["x-forwarded-for"] || "guest";
  const now = Date.now();

  const timestamps = (requestLog.get(identifier) || []).filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS) {
    return res.status(429).json({
      message: `Too many planner requests. Limit is ${MAX_REQUESTS} per 15 minutes — please wait and try again.`,
    });
  }

  timestamps.push(now);
  requestLog.set(identifier, timestamps);
  next();
};

const ECO_WINDOW_MS = 60 * 1000; // 1 minute
const ECO_MAX_REQUESTS = 10; // Max 10 submissions per minute
const ecoRequestLog = new Map();

export const ecoActionRateLimit = (req, res, next) => {
  const identifier = req.userId || req.ip || req.headers["x-forwarded-for"] || "guest";
  const now = Date.now();

  const timestamps = (ecoRequestLog.get(identifier) || []).filter((t) => now - t < ECO_WINDOW_MS);

  if (timestamps.length >= ECO_MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: "Too many eco-action submissions. Please slow down and try again shortly.",
    });
  }

  timestamps.push(now);
  ecoRequestLog.set(identifier, timestamps);
  next();
};

const AUTH_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const AUTH_MAX_ATTEMPTS = 15; // Max 15 attempts per 15 minutes per IP
const authRequestLog = new Map();

export const authRateLimit = (req, res, next) => {
  const identifier = req.ip || req.headers["x-forwarded-for"] || "guest";
  const now = Date.now();

  const timestamps = (authRequestLog.get(identifier) || []).filter((t) => now - t < AUTH_WINDOW_MS);

  if (timestamps.length >= AUTH_MAX_ATTEMPTS) {
    return res.status(429).json({
      message: "Too many authentication attempts. Please try again after 15 minutes.",
    });
  }

  timestamps.push(now);
  authRequestLog.set(identifier, timestamps);
  next();
};

const SUBMISSION_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const SUBMISSION_MAX_REQUESTS = 5; // Max 5 submissions per hour per user
const submissionRequestLog = new Map();

export const submissionRateLimit = (req, res, next) => {
  const identifier = req.userId ? req.userId.toString() : req.ip || req.headers["x-forwarded-for"] || "guest";
  const now = Date.now();

  const timestamps = (submissionRequestLog.get(identifier) || []).filter((t) => now - t < SUBMISSION_WINDOW_MS);

  if (timestamps.length >= SUBMISSION_MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: `Submission limit reached (maximum ${SUBMISSION_MAX_REQUESTS} submissions per hour). Please try again later.`,
    });
  }

  timestamps.push(now);
  submissionRequestLog.set(identifier, timestamps);
  next();
};