import bcrypt from "bcrypt"
import { TenantRequest } from "../tenant/tenant.middleware"
import { incrementMetric, decrementMetric, enforceLimit } from "../billing/usage.service"

function getPrisma(req: TenantRequest) {
  if (!req.prisma) throw { status: 500, message: "Tenant context missing" }
  return req.prisma
}

export async function createUser(req: TenantRequest) {
  const prisma = getPrisma(req)
  const organizationId = req.organizationId!
  const { email, password, role = "USER" } = req.body

  if (!email || !password) throw { status: 400, message: "Email and password are required" }

  // ── Issue #27: Enforce plan user limit before creating ───────────────────
  await enforceLimit(organizationId, "USER_COUNT")

  const existing = await prisma.user.findFirst({ where: { email } })
  if (existing) throw { status: 409, message: "User already exists in this organization" }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, role }
  })

  // ── Issue #27: Track user_count and resource_creations ───────────────────
  await Promise.all([
    incrementMetric(organizationId, "USER_COUNT"),
    incrementMetric(organizationId, "RESOURCE_CREATIONS")
  ])

  return { id: user.id, email: user.email, role: user.role, organizationId: user.organizationId }
}

export async function getUsers(req: TenantRequest) {
  const prisma = getPrisma(req)
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, organizationId: true }
  })
  return { count: users.length, users }
}