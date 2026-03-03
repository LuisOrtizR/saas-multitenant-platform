import { basePrisma } from "../../lib/prisma"
import type { UsageMetricType, UsageSummary, UsageLimitCheck } from "./usage.types"

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Returns the current period string in YYYY-MM format (UTC).
 */
export function currentPeriod(): string {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

// ─── Core: upsert increment ──────────────────────────────────────────────────

/**
 * Atomically increment a usage metric by `delta` for a given org and period.
 * Uses upsert so the first call in a period creates the row.
 */
export async function incrementMetric(
  organizationId: string,
  metric: UsageMetricType,
  delta = 1,
  period = currentPeriod()
): Promise<void> {
  await basePrisma.usageMetric.upsert({
    where: {
      organizationId_metric_period: { organizationId, metric, period }
    },
    create: { organizationId, metric, value: delta, period },
    update: { value: { increment: delta } }
  })
}

/**
 * Decrement a usage metric (e.g. when a user is deleted).
 * Value will never go below 0.
 */
export async function decrementMetric(
  organizationId: string,
  metric: UsageMetricType,
  delta = 1,
  period = currentPeriod()
): Promise<void> {
  const existing = await basePrisma.usageMetric.findUnique({
    where: { organizationId_metric_period: { organizationId, metric, period } }
  })
  if (!existing) return

  const newValue = Math.max(0, existing.value - delta)
  await basePrisma.usageMetric.update({
    where: { organizationId_metric_period: { organizationId, metric, period } },
    data: { value: newValue }
  })
}

// ─── Sync: recount users from DB (source of truth) ──────────────────────────

/**
 * Sync USER_COUNT for a given org by counting actual User rows.
 * Call this after bulk operations or on-demand to ensure accuracy.
 */
export async function syncUserCount(
  organizationId: string,
  period = currentPeriod()
): Promise<number> {
  const count = await basePrisma.user.count({ where: { organizationId } })

  await basePrisma.usageMetric.upsert({
    where: {
      organizationId_metric_period: { organizationId, metric: "USER_COUNT", period }
    },
    create: { organizationId, metric: "USER_COUNT", value: count, period },
    update: { value: count }
  })

  return count
}

// ─── Retrieval ───────────────────────────────────────────────────────────────

/**
 * Get all usage metrics for an org in the given period (defaults to current month).
 */
export async function getUsageSummary(
  organizationId: string,
  period = currentPeriod()
): Promise<UsageSummary> {
  const rows = await basePrisma.usageMetric.findMany({
    where: { organizationId, period },
    select: { metric: true, value: true }
  })

  return {
    period,
    metrics: rows.map(r => ({ metric: r.metric as UsageMetricType, value: r.value }))
  }
}

/**
 * Get the current value for a single metric. Returns 0 if no row yet.
 */
export async function getMetricValue(
  organizationId: string,
  metric: UsageMetricType,
  period = currentPeriod()
): Promise<number> {
  const row = await basePrisma.usageMetric.findUnique({
    where: { organizationId_metric_period: { organizationId, metric, period } }
  })
  return row?.value ?? 0
}

// ─── Limit enforcement ───────────────────────────────────────────────────────

/**
 * Check whether an org is within the plan limit for a specific metric.
 *
 * Plan `limits` JSON is expected to contain keys matching UsageMetricType
 * in snake_case lower, e.g.:
 *   { "user_count": 5, "api_requests": 10000, "resource_creations": 100 }
 *
 * A value of -1 (or missing key) means unlimited.
 */
export async function checkLimit(
  organizationId: string,
  metric: UsageMetricType,
  period = currentPeriod()
): Promise<UsageLimitCheck> {
  const subscription = await basePrisma.subscription.findUnique({
    where: { organizationId },
    include: { plan: true }
  })

  const current = await getMetricValue(organizationId, metric, period)
  const limits = (subscription?.plan?.limits ?? {}) as Record<string, number>
  const limitKey = metric.toLowerCase() // e.g. "user_count"
  const limit = limits[limitKey] ?? null // null = not configured = unlimited

  const allowed = limit === null || limit === -1 || current < limit

  return { allowed, current, limit, metric }
}

/**
 * Enforce a limit — throws a 402 error if the org has reached the cap.
 */
export async function enforceLimit(
  organizationId: string,
  metric: UsageMetricType,
  period = currentPeriod()
): Promise<void> {
  const check = await checkLimit(organizationId, metric, period)
  if (!check.allowed) {
    throw {
      status: 402,
      message: `Plan limit reached for ${metric}. Current: ${check.current}, Limit: ${check.limit}.`,
      code: "PLAN_LIMIT_EXCEEDED"
    }
  }
}