import { defineStore } from "pinia"
import { ref } from "vue"
import { billingApi } from "@/api/billing.api"
import type { UsageSummary, UsageLimitsResponse, Plan, Subscription, UsageMetricType } from "@/types/billing.types"

export const useBillingStore = defineStore("billing", () => {
  const usage = ref<UsageSummary | null>(null)
  const limits = ref<UsageLimitsResponse | null>(null)
  const plans = ref<Plan[]>([])
  const subscription = ref<Subscription | null>(null)
  const loading = ref(false)
  const upgrading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll(period?: string) {
    loading.value = true
    error.value = null
    try {
      const [usageRes, limitsRes, subRes, plansRes] = await Promise.all([
        billingApi.getUsage(period),
        billingApi.getUsageLimits(period),
        billingApi.getSubscription(),
        billingApi.getPlans()
      ])
      usage.value = usageRes
      limits.value = limitsRes
      subscription.value = subRes
      plans.value = plansRes
    } catch (err: unknown) {
      error.value = (err as { message?: string }).message ?? "Error al cargar billing"
    } finally {
      loading.value = false
    }
  }

  async function upgrade(planId: string) {
    upgrading.value = true
    try {
      const result = await billingApi.upgradePlan(planId)
      subscription.value = result
      return result
    } finally {
      upgrading.value = false
    }
  }

  function getMetricValue(metric: UsageMetricType): number {
    return usage.value?.metrics.find(m => m.metric === metric)?.value ?? 0
  }

  function getLimit(metric: UsageMetricType) {
    return limits.value?.limits.find(l => l.metric === metric) ?? null
  }

  return {
    usage, limits, plans, subscription,
    loading, upgrading, error,
    fetchAll, upgrade, getMetricValue, getLimit
  }
})
