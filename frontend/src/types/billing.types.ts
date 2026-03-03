export type UsageMetricType = "USER_COUNT" | "API_REQUESTS" | "RESOURCE_CREATIONS"

export interface UsageMetric {
  metric: UsageMetricType
  value: number
}

export interface UsageSummary {
  period: string
  metrics: UsageMetric[]
}

export interface UsageLimitCheck {
  metric: UsageMetricType
  current: number
  limit: number | null
  allowed: boolean
}

export interface UsageLimitsResponse {
  period: string
  limits: UsageLimitCheck[]
}

export interface Plan {
  id: string
  name: string
  price: number
  currency: string
  features: Record<string, boolean>
  limits: Record<string, number>
  isActive: boolean
}

export interface Subscription {
  id: string
  organizationId: string
  planId: string
  plan: Plan
  status: "ACTIVE" | "TRIAL" | "CANCELED"
  startDate: string
  renewalDate: string | null
}
