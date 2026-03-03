import { http } from "./http"
import type { UsageSummary, UsageLimitsResponse, Plan, Subscription } from "@/types/billing.types"

export const billingApi = {
  getPlans: () => http.get<Plan[]>("/billing/plans"),

  getSubscription: () => http.get<Subscription>("/billing/subscription"),

  upgradePlan: (planId: string) =>
    http.post<Subscription>("/billing/subscription/upgrade", { planId }),

  getUsage: (period?: string) => {
    const query = period ? `?period=${period}` : ""
    return http.get<UsageSummary>(`/billing/usage${query}`)
  },

  getUsageLimits: (period?: string) => {
    const query = period ? `?period=${period}` : ""
    return http.get<UsageLimitsResponse>(`/billing/usage/limits${query}`)
  }
}
