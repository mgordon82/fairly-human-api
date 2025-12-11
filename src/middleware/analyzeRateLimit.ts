// src/middleware/analyzeRateLimit.ts
import type { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

/**
 * Per-IP rate limit for the analyze endpoint.
 * Example: max 10 requests per 5 minutes per IP.
 */
export const analyzeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // each IP can hit /analyze 10 times per 5 minutes
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error:
      'Too many analysis requests from this IP. Please wait a few minutes and try again.'
  }
});

/**
 * Simple global failsafe to protect against runaway usage.
 * This caps the total number of analyze calls per hour across all IPs.
 */

const HOURLY_LIMIT = 200; // adjust as you like
const WINDOW_MS = 60 * 60 * 1000; // 1 hour in ms

let windowStart = Date.now();
let callsThisWindow = 0;

export function analyzeFailsafe(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const now = Date.now();

  // Reset window if we're past the current hour window
  if (now - windowStart >= WINDOW_MS) {
    windowStart = now;
    callsThisWindow = 0;
  }

  if (callsThisWindow >= HOURLY_LIMIT) {
    return res.status(503).json({
      error:
        'Analysis temporarily unavailable due to high usage. Please try again later.'
    });
  }

  callsThisWindow += 1;
  return next();
}
