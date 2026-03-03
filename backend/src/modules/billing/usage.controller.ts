import { Response } from "express"
import { AuthRequest } from "../auth/auth.middleware"
import { ok, error } from "../../lib/response"
import { getUsageSummary, checkLimit, currentPeriod } from "./usage.service"
import type { UsageMetricType } from "./usage.types"

const ALL_METRICS: UsageMetricType[] = ["USER_COUNT", "API_REQUESTS", "RESOURCE_CREATIONS"]

/**
 * GET /billing/usage[?period=YYYY-MM]
 *
 * Returns the usage summary for the authenticated org in the requested period
 * (defaults to the current month).
 */
export async function getUsage(req: AuthRequest, res: Response) {
  try {
    const organizationId = req.user!.organizationId!
    const period = (req.query.period as string) || currentPeriod()

    // Basic period format validation
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return error(res, 400, "Invalid period format. Expected YYYY-MM", "INVALID_PERIOD")
    }

    const summary = await getUsageSummary(organizationId, period)
    return ok(res, summary)
  } catch (err: any) {
    return error(res, err.status || 500, err.message || "Internal server error", err.code)
  }
}

/**
 * GET /billing/usage/limits[?period=YYYY-MM]
 *
 * Returns the limit check for every metric type — shows current usage vs the
 * plan cap and whether the org is within bounds.
 */
export async function getUsageLimits(req: AuthRequest, res: Response) {
  try {
    const organizationId = req.user!.organizationId!
    const period = (req.query.period as string) || currentPeriod()

    if (!/^\d{4}-\d{2}$/.test(period)) {
      return error(res, 400, "Invalid period format. Expected YYYY-MM", "INVALID_PERIOD")
    }

    const checks = await Promise.all(
      ALL_METRICS.map(metric => checkLimit(organizationId, metric, period))
    )

    return ok(res, { period, limits: checks })
  } catch (err: any) {
    return error(res, err.status || 500, err.message || "Internal server error", err.code)
  }
}