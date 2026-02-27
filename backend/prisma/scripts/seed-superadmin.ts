import bcrypt from "bcrypt"
import { basePrisma } from "../../src/lib/prisma"

async function main() {
  const existing = await basePrisma.user.findFirst({
    where: { email: "superadmin@platform.com", role: "SUPER_ADMIN" }
  })

  if (existing) {
    console.log("⚠️  SUPER_ADMIN already exists:", existing.email)
    return
  }

  const hashedPassword = await bcrypt.hash("superadmin123", 10)

  const user = await basePrisma.user.create({
    data: {
      email: "superadmin@platform.com",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      organizationId: null
    }
  })

  console.log("✅ SUPER_ADMIN created:", user.email)
}

main()
  .catch(console.error)
  .finally(() => basePrisma.$disconnect())