import bcrypt from "bcrypt"
import { TenantRequest } from "../tenant/tenant.middleware"

export async function createUser(req: TenantRequest) {
  const { email, password } = req.body

  if (!email || !password) {
    throw { status: 400, message: "Email and password are required" }
  }

  const existingUser = await req.prisma.user.findFirst({
    where: { email }
  })

  if (existingUser) {
    throw {
      status: 409,
      message: "User already exists in this organization"
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await req.prisma.user.create({
    data: {
      email,
      password: hashedPassword
    }
  })

  return {
    id: user.id,
    email: user.email,
    organizationId: user.organizationId
  }
}

export async function getUsers(req: TenantRequest) {
  const users = await req.prisma.user.findMany({
    select: {
      id: true,
      email: true,
      organizationId: true
    }
  })

  return {
    count: users.length,
    users
  }
}