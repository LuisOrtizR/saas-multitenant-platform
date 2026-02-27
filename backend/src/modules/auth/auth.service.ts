import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { basePrisma } from "../../lib/prisma"
import { ENV } from "../../config/env"
import { generateToken } from "./auth.token"
import { LoginDTO, SelectOrganizationDTO } from "./auth.types"

export async function login(data: LoginDTO) {
  const { email, password } = data

  if (!email) throw { status: 400, message: "Email is required" }
  if (!password) throw { status: 400, message: "Password is required" }
  if (!email.includes("@")) throw { status: 400, message: "Invalid email format" }
  if (password.length < 6) throw { status: 400, message: "Password must be at least 6 characters" }

  const users = await basePrisma.user.findMany({
    where: { email },
    include: { organization: true }
  })

  if (!users.length) throw { status: 401, message: "Invalid credentials" }

  const validUsers: typeof users = []
  for (const user of users) {
    const isValid = await bcrypt.compare(password, user.password)
    if (isValid) validUsers.push(user)
  }

  if (!validUsers.length) throw { status: 401, message: "Invalid credentials" }

  if (validUsers.length === 1) {
    const user = validUsers[0]
    const token = generateToken({
      userId: user.id,
      organizationId: user.organizationId ?? undefined,
      email: user.email,
      role: user.role
    })
    return { token }
  }

  const loginSessionToken = jwt.sign(
    { userIds: validUsers.map(u => u.id) },
    ENV.JWT_SECRET,
    { expiresIn: "5m" }
  )

  return {
    requiresOrganizationSelection: true,
    loginSessionToken,
    organizations: validUsers
      .filter(u => u.organization)
      .map(u => ({
        id: u.organization!.id,
        name: u.organization!.name,
        slug: u.organization!.slug
      }))
  }
}

export async function selectOrganization(data: SelectOrganizationDTO, authHeader?: string) {
  if (!authHeader?.startsWith("Bearer ")) throw { status: 401, message: "Unauthorized" }

  const { organizationId } = data
  if (!organizationId) throw { status: 400, message: "organizationId is required" }

  const tempToken = authHeader.split(" ")[1]

  let decoded: { userIds: string[] }
  try {
    decoded = jwt.verify(tempToken, ENV.JWT_SECRET) as any

    if (!decoded.userIds || !Array.isArray(decoded.userIds)) {
      throw { status: 403, message: "Invalid session token. Use the loginSessionToken from login response" }
    }
  } catch (err: any) {
    if (err.status) throw err
    throw { status: 401, message: "Session expired. Please login again" }
  }

  const user = await basePrisma.user.findFirst({
    where: { id: { in: decoded.userIds }, organizationId }
  })

  if (!user) throw { status: 403, message: "Invalid organization selection" }

  const token = generateToken({
    userId: user.id,
    organizationId: user.organizationId!,
    email: user.email,
    role: user.role
  })

  return { token }
}