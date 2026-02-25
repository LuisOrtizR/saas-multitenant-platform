import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { basePrisma } from "../../lib/prisma"
import { ENV } from "../../config/env"
import { generateToken } from "./auth.service.token"
import { RegisterDTO, LoginDTO, SelectOrganizationDTO } from "./jwt.types"

/**
 * Registrar una nueva organización y su admin
 */
export async function register(data: RegisterDTO) {
  const { name, slug, email, password } = data

  if (!name || !slug || !email || !password) {
    throw { status: 400, message: "All fields are required" }
  }

  // Revisar si la organización ya existe
  const existingOrg = await basePrisma.organization.findUnique({ where: { slug } })
  if (existingOrg) throw { status: 409, message: "Organization slug already exists" }

  const hashedPassword = await bcrypt.hash(password, 10)

  // Crear la organización con el admin
  const organization = await basePrisma.organization.create({
    data: {
      name,
      slug,
      users: {
        create: {
          email,
          password: hashedPassword,
          role: "ADMIN"
        }
      }
    },
    include: { users: true } // Incluye usuarios para retornar
  })

  const user = organization.users[0]

  const token = generateToken({
    userId: user.id,
    organizationId: user.organizationId!,
    email: user.email,
    role: user.role
  })

  return {
    token,
    organization: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug
    }
  }
}

/**
 * Login de usuarios, incluyendo soporte multi-tenant y SUPER_ADMIN
 */
export async function login(data: LoginDTO) {
  const { email, password } = data
  if (!email || !password) throw { status: 400, message: "Email and password are required" }

  // Buscar usuarios con ese email
  const users = await basePrisma.user.findMany({
    where: { email },
    include: { organization: true }
  })
  if (!users.length) throw { status: 401, message: "Invalid credentials" }

  // Validar password
  const validUsers = []
  for (const user of users) {
    const isValid = await bcrypt.compare(password, user.password)
    if (isValid) validUsers.push(user)
  }
  if (!validUsers.length) throw { status: 401, message: "Invalid credentials" }

  // Si hay un solo usuario válido, retornamos token directo
  if (validUsers.length === 1) {
    const user = validUsers[0]
    const token = generateToken({
      userId: user.id,
      organizationId: user.organizationId ?? undefined, // SUPER_ADMIN puede ser null
      email: user.email,
      role: user.role
    })
    return { token }
  }

  // Múltiples usuarios: requiere selección de organización
  const loginSessionToken = jwt.sign(
    { userIds: validUsers.map(u => u.id) },
    ENV.JWT_SECRET,
    { expiresIn: "5m" }
  )

  return {
    requiresOrganizationSelection: true,
    loginSessionToken,
    organizations: validUsers
      .filter(u => u.organization) // Filtra SUPER_ADMIN
      .map(u => ({
        id: u.organization!.id,
        name: u.organization!.name,
        slug: u.organization!.slug
      }))
  }
}

/**
 * Selección de organización para usuarios con múltiples tenants
 */
export async function selectOrganization(
  data: SelectOrganizationDTO,
  authHeader?: string
) {
  if (!authHeader?.startsWith("Bearer ")) throw { status: 401, message: "Unauthorized" }

  const { organizationId } = data
  if (!organizationId) throw { status: 400, message: "organizationId is required" }

  const tempToken = authHeader.split(" ")[1]
  const decoded = jwt.verify(tempToken, ENV.JWT_SECRET) as { userIds: string[] }

  const user = await basePrisma.user.findFirst({
    where: { id: { in: decoded.userIds }, organizationId }
  })
  if (!user) throw { status: 403, message: "Invalid organization selection" }

  const finalToken = generateToken({
    userId: user.id,
    organizationId: user.organizationId!,
    email: user.email,
    role: user.role
  })

  return { token: finalToken }
}