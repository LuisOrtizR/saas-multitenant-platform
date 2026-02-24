import { PrismaClient } from "@prisma/client"
export type TenantPrismaClient = ReturnType<typeof getTenantPrisma>

const basePrisma = new PrismaClient()

// Lista de modelos que son tenant-scoped
const TENANT_MODELS = ["User"] as const

export function getTenantPrisma(organizationId: string) {
  if (!organizationId) {
    throw new Error("organizationId is required to create a tenant Prisma client")
  }

  return basePrisma.$extends({
    query: {
      $allModels: {

        async findMany({ model, args, query }) {
          if (isTenantModel(model)) {
            args.where = addTenantFilter(args.where, organizationId)
          }
          return query(args)
        },

        async findFirst({ model, args, query }) {
          if (isTenantModel(model)) {
            args.where = addTenantFilter(args.where, organizationId)
          }
          return query(args)
        },

        // findUnique NO se intercepta aquí porque su `where` requiere campos únicos
        // (id o email) y agregar organizationId rompe el tipo de Prisma.
        // Usa siempre findFirst en los controllers cuando necesites scope por tenant.

        async update({ model, args, query }) {
          if (isTenantModel(model)) {
            args.where = addTenantFilter(args.where, organizationId) as any
          }
          return query(args)
        },

        async create({ model, args, query }) {
          if (isTenantModel(model)) {
            // Mutamos el data directamente para evitar conflicto de tipos con Prisma
            ;(args.data as Record<string, unknown>)["organizationId"] = organizationId
          }
          return query(args)
        },

        async delete({ model, args, query }) {
          if (isTenantModel(model)) {
            args.where = addTenantFilter(args.where, organizationId) as any
          }
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
  return {
    ...(where ?? {}),
    organizationId
  }
}

export { basePrisma }