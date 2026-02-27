import bcrypt from "bcrypt"
import { TenantRequest } from "../tenant/tenant.middleware"

function getPrisma(req: TenantRequest) {
  if (!req.prisma) throw { status: 500, message: "Tenant context missing" }
  return req.prisma
}

export async function createUser(req: TenantRequest) {
  const prisma = getPrisma(req)
  const { email, password, role = "USER" } = req.body

  if (!email || !password) throw { status: 400, message: "Email and password are required" }

  const existing = await prisma.user.findFirst({ where: { email } })
  if (existing) throw { status: 409, message: "User already exists in this organization" }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, role }
  })

  return { id: user.id, email: user.email, role: user.role, organizationId: user.organizationId }
}

export async function getUsers(req: TenantRequest) {
  const prisma = getPrisma(req)
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, organizationId: true }
  })
  return { count: users.length, users }
}