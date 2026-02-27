import { PrismaClient } from "@prisma/client"

export type TenantPrismaClient = ReturnType<typeof getTenantPrisma>

const basePrisma = new PrismaClient()

const TENANT_MODELS = ["User"] as const

export function getTenantPrisma(organizationId: string) {
  if (!organizationId) {
    throw new Error("organizationId is required")
  }

  return basePrisma.$extends({
    query: {
      $allModels: {
        async findMany({ model, args, query }) {
          if (isTenantModel(model)) args.where = addTenantFilter(args.where, organizationId)
          return query(args)
        },
        async findFirst({ model, args, query }) {
          if (isTenantModel(model)) args.where = addTenantFilter(args.where, organizationId)
          return query(args)
        },
        async update({ model, args, query }) {
          if (isTenantModel(model)) args.where = addTenantFilter(args.where, organizationId) as any
          return query(args)
        },
        async create({ model, args, query }) {
          if (isTenantModel(model)) {
            ;(args.data as Record<string, unknown>)["organizationId"] = organizationId
          }
          return query(args)
        },
        async delete({ model, args, query }) {
          if (isTenantModel(model)) args.where = addTenantFilter(args.where, organizationId) as any
          return query(args)
        },
      }
    }
  })
}

function isTenantModel(model: string) {
  return TENANT_MODELS.includes(model as any)
}

function addTenantFilter(where: Record<string, unknown> | undefined, organizationId: string) {
  return { ...(where ?? {}), organizationId }
}

export { basePrisma }