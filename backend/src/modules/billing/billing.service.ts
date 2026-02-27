import { basePrisma } from "../../lib/prisma"

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