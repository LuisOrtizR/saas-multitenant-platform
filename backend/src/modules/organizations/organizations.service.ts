import bcrypt from "bcrypt"
import { basePrisma } from "../../lib/prisma"
import { RegisterOrganizationDTO } from "./organizations.types"

export async function registerOrganization(data: RegisterOrganizationDTO) {
  const existing = await basePrisma.organization.findUnique({ where: { slug: data.slug } })
  if (existing) throw { status: 409, message: "Organization slug already exists" }

  return basePrisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: { name: data.name, slug: data.slug }
    })

    const freePlan = await tx.plan.findUnique({ where: { name: "FREE" } })
    if (!freePlan) throw new Error("FREE plan missing. Run seed.")

    const subscription = await tx.subscription.create({
      data: {
        organizationId: organization.id,
        planId: freePlan.id,
        status: "ACTIVE"
      }
    })

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await tx.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: "ADMIN",
        organizationId: organization.id
      }
    })

    return {
      organization,
      plan: {
        id: freePlan.id,
        name: freePlan.name,
        price: freePlan.price,
        currency: freePlan.currency
      },
      subscription: {
        id: subscription.id,
        status: subscription.status
      },
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    }
  })
}

export async function getOrganization(organizationId: string) {
  const org = await basePrisma.organization.findUnique({
    where: { id: organizationId },
    include: { subscription: { include: { plan: true } } }
  })
  if (!org) throw { status: 404, message: "Organization not found" }
  return org
}

export async function suspendOrganization(organizationId: string) {
  return basePrisma.organization.update({
    where: { id: organizationId },
    data: { suspended: true }
  })
}