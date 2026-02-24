import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  // 1️⃣ Asegúrate de que exista la organización
  const organization = await prisma.organization.findUnique({
    where: { id: "org-456" }
  })

  if (!organization) {
    console.log("Creating organization...")
    await prisma.organization.create({
      data: {
        id: "org-456",
        name: "Test Org",
        slug: "test-org",
        plan: "FREE"
      }
    })
  }

  // 2️⃣ Hashear password
  const hashedPassword = await bcrypt.hash("123456", 10)

  // 3️⃣ Crear usuario admin
  await prisma.user.create({
    data: {
      email: "a@test.com",
      password: hashedPassword,
      organizationId: "org-456"
    }
  })

  console.log("User created successfully 🚀")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())