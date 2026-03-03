export type UsageMetricType = "USER_COUNT" | "API_REQUESTS" | "RESOURCE_CREATIONS"

export interface UsageSummary {
  period: string
  metrics: {
    metric: UsageMetricType
    value: number
  }[]
}

export interface UsageLimitCheck {
  allowed: boolean
  current: number
  limit: number | null  // null = unlimited
  metric: UsageMetricType
}