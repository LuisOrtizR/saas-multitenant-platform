import express from "express"
import { ENV } from "./config/env"
import { generateToken } from "./modules/auth/auth.service"
import { verifyToken, AuthRequest } from "./modules/auth/auth.middleware"
import { tenantValidationMiddleware, TenantRequest } from "./modules/tenant/tenant.middleware"
import { attachTenantPrisma } from "./modules/tenant/tenant-prisma.middleware"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { basePrisma } from "./lib/prisma"

// IMPORTANTE: Solo usamos basePrisma para auth (login/register)
// Para cualquier operación de negocio usamos req.prisma (tenant-scoped)

const app = express()

app.use(express.json())

// ─── AUTH ────────────────────────────────────────────────────────────────────

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    // Aquí sí usamos basePrisma porque necesitamos buscar en TODAS las orgs
    const users = await basePrisma.user.findMany({
      where: { email },
      include: { organization: true }
    })

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const validUsers = []

    for (const user of users) {
      const isValid = await bcrypt.compare(password, user.password)
      if (isValid) {
        validUsers.push(user)
      }
    }

    if (validUsers.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    if (validUsers.length === 1) {
      const user = validUsers[0]

      const token = generateToken({
        userId: user.id,
        organizationId: user.organizationId,
        email: user.email
      })

      return res.json({ token })
    }

    // Usuario pertenece a múltiples organizaciones → selección requerida
    const loginSessionToken = jwt.sign(
      { userIds: validUsers.map(u => u.id) },
      ENV.JWT_SECRET,
      { expiresIn: "5m" }
    )

    return res.json({
      requiresOrganizationSelection: true,
      loginSessionToken,
      organizations: validUsers.map(u => ({
        id: u.organization.id,
        name: u.organization.name,
        slug: u.organization.slug
      }))
    })

  } catch {
    return res.status(500).json({ message: "Internal server error" })
  }
})

app.post("/select-organization", async (req, res) => {
  try {
    const { organizationId } = req.body
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    if (!organizationId) {
      return res.status(400).json({ message: "organizationId is required" })
    }

    const tempToken = authHeader.split(" ")[1]
    const decoded = jwt.verify(tempToken, ENV.JWT_SECRET) as any

    // Verificamos que el usuario realmente pertenezca a esa org
    const user = await basePrisma.user.findFirst({
      where: {
        id: { in: decoded.userIds },
        organizationId
      }
    })

    if (!user) {
      return res.status(403).json({ message: "Invalid organization selection" })
    }

    const finalToken = generateToken({
      userId: user.id,
      organizationId: user.organizationId,
      email: user.email
    })

    return res.json({ token: finalToken })

  } catch {
    return res.status(401).json({ message: "Invalid or expired session" })
  }
})

app.post("/register", async (req, res) => {
  try {
    const { name, slug, email, password } = req.body

    if (!name || !slug || !email || !password) {
      return res.status(400).json({ message: "All fields are required" })
    }

    const existingOrg = await basePrisma.organization.findUnique({
      where: { slug }
    })

    if (existingOrg) {
      return res.status(409).json({ message: "Organization slug already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const organization = await basePrisma.organization.create({
      data: {
        name,
        slug,
        users: {
          create: {
            email,
            password: hashedPassword
          }
        }
      },
      include: { users: true }
    })

    const user = organization.users[0]

    const token = generateToken({
      userId: user.id,
      organizationId: organization.id,
      email: user.email
    })

    return res.status(201).json({
      token,
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug
      }
    })

  } catch {
    return res.status(500).json({ message: "Internal server error" })
  }
})

// ─── RUTAS PROTEGIDAS (tenant-scoped) ────────────────────────────────────────

app.get("/protected", verifyToken, (req: AuthRequest, res) => {
  return res.json({
    message: "Access granted",
    organizationId: req.user?.organizationId
  })
})

// POST /users — Crear usuario dentro de la org del token
app.post(
  "/users",
  verifyToken,
  tenantValidationMiddleware,
  attachTenantPrisma,
  async (req: TenantRequest, res) => {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" })
      }

      // req.prisma ya tiene el organizationId inyectado automáticamente
      const existingUser = await req.prisma.user.findFirst({
        where: { email }
      })

      if (existingUser) {
        return res.status(409).json({
          message: "User already exists in this organization"
        })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      // El organizationId se inyecta automáticamente por el tenant Prisma
      const user = await req.prisma.user.create({
        data: {
          email,
          password: hashedPassword
        }
      })

      return res.status(201).json({
        id: user.id,
        email: user.email,
        organizationId: user.organizationId
      })

    } catch {
      return res.status(500).json({ message: "Internal server error" })
    }
  }
)

// GET /users — Solo devuelve usuarios de la org del token
app.get(
  "/users",
  verifyToken,
  tenantValidationMiddleware,
  attachTenantPrisma,
  async (req: TenantRequest, res) => {
    try {
      // req.prisma filtra automáticamente por organizationId del token
      const users = await req.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          organizationId: true
        }
      })

      return res.json({
        count: users.length,
        users
      })

    } catch {
      return res.status(500).json({ message: "Internal server error" })
    }
  }
)

app.listen(ENV.PORT, () => {
  console.log(`Server running on port ${ENV.PORT}`)
})