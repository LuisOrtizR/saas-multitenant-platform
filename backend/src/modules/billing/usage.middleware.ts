import { Response, NextFunction } from "express"
import { AuthRequest } from "../auth/auth.middleware"
import { incrementMetric } from "./usage.service"

/**
 * trackApiRequest
 *
 * Express middleware that increments the API_REQUESTS usage counter for the
 * authenticated organization after each successful (non-4xx/5xx) response.
 *
 * Mount this AFTER `authenticate` on any router where you want tracking, or
 * globally in index.ts for full coverage:
 *
 *   app.use(authenticate, trackApiRequest)
 *
 * Errors in the tracking step are swallowed — usage recording must never
 * block the actual response.
 */
export function trackApiRequest(req: AuthRequest, res: Response, next: NextFunction) {
  const organizationId = req.user?.organizationId

  if (organizationId) {
    // Hook into the response 'finish' event so we record *after* the handler
    res.on("finish", () => {
      // Only count non-error responses (2xx and 3xx)
      if (res.statusCode < 400) {
        incrementMetric(organizationId, "API_REQUESTS").catch(err => {
          console.error("[usage] Failed to track API_REQUESTS:", err?.message)
        })
      }
    })
  }

  next()
}