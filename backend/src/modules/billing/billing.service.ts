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