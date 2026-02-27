import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  await prisma.plan.upsert({
    where: { name: "FREE" },
    update: {},
    create: {
      name: "FREE",
      price: 0,
      currency: "USD",
      features: {
        basic_dashboard: true,
        advanced_reports: false,
        api_access: false,
        custom_integrations: false,
        audit_logs: false
      },
      limits: { users: 3 }
    }
  })

  await prisma.plan.upsert({
    where: { name: "STARTER" },
    update: {},
    create: {
      name: "STARTER",
      price: 29,
      currency: "USD",
      features: {
        basic_dashboard: true,
        advanced_reports: true,
        api_access: false,
        custom_integrations: false,
        audit_logs: false
      },
      limits: { users: 10 }
    }
  })

  await prisma.plan.upsert({
    where: { name: "PRO" },
    update: {},
    create: {
      name: "PRO",
      price: 99,
      currency: "USD",
      features: {
        basic_dashboard: true,
        advanced_reports: true,
        api_access: true,
        custom_integrations: false,
        audit_logs: false
      },
      limits: { users: 50 }
    }
  })

  await prisma.plan.upsert({
    where: { name: "ENTERPRISE" },
    update: {},
    create: {
      name: "ENTERPRISE",
      price: 299,
      currency: "USD",
      features: {
        basic_dashboard: true,
        advanced_reports: true,
        api_access: true,
        custom_integrations: true,
        audit_logs: true
      },
      limits: { users: -1 }
    }
  })

  console.log("✅ All plans seeded with features")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())