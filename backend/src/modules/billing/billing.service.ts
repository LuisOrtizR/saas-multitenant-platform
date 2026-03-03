import { basePrisma } from "../../lib/prisma"
import type { PlanFeatures } from "./billing.types"

export async function getFreePlan() {
  const plan = await basePrisma.plan.findUnique({ where: { name: "FREE" } })
  if (!plan) throw new Error("FREE plan not found. Run seed.")
  return plan
}

export async function getPlans() {
  return basePrisma.plan.findMany({ where: { isActive: true } })
}

export async function getSubscription(organizationId: string) {
  const subscription = await basePrisma.subscription.findUnique({
    where: { organizationId },
    include: { plan: true }
  })
  if (!subscription) throw { status: 404, message: "Subscription not found" }
  return subscription
}

export async function hasFeature(organizationId: string, featureKey: string): Promise<boolean> {
  const subscription = await basePrisma.subscription.findUnique({
    where: { organizationId },
    include: { plan: true }
  })
  if (!subscription || subscription.status !== "ACTIVE") return false
  const features = subscription.plan.features as PlanFeatures
  return features[featureKey as keyof PlanFeatures] === true
}

// ── Issue #27: Upgrade/downgrade simulation ──────────────────────────────────
export async function upgradePlan(organizationId: string, planId: string) {
  const plan = await basePrisma.plan.findUnique({ where: { id: planId } })
  if (!plan) throw { status: 404, message: "Plan not found" }
  if (!plan.isActive) throw { status: 400, message: "Plan is not active" }

  const subscription = await basePrisma.subscription.findUnique({
    where: { organizationId }
  })
  if (!subscription) throw { status: 404, message: "Subscription not found" }
  if (subscription.planId === planId) throw { status: 400, message: "Already on this plan" }

  const updated = await basePrisma.subscription.update({
    where: { organizationId },
    data: { planId, status: "ACTIVE", renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    include: { plan: true }
  })

  return updated
}