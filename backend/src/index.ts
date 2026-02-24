import express from "express"
import { ENV } from "./config/env"
import { generateToken } from "./modules/auth/auth.service"
import { verifyToken, AuthRequest } from "./modules/auth/auth.middleware"
import { tenantValidationMiddleware, TenantRequest } from "./modules/tenant/tenant.middleware"

const app = express()
app.use(express.json())

// Ruta de prueba para generar token
app.post("/login", (req, res) => {
  // Simulación de usuario autenticado
  const fakeUser = {
    userId: "user-123",
    organizationId: "org-456",
    email: "test@example.com"
  }

  const token = generateToken(fakeUser)

  return res.json({ token })
})

// Ruta protegida
app.get("/protected", verifyToken, (req: AuthRequest, res) => {
  return res.json({
    message: "Access granted",
    organizationId: req.user?.organizationId
  })
})

app.get(
  "/tenant-protected",
  verifyToken,
  tenantValidationMiddleware,
  (req: TenantRequest, res) => {
    return res.json({
      message: "Tenant validated successfully",
      organizationId: req.organizationId
    })
  }
)

app.listen(ENV.PORT, () => {
  console.log(`Server running on port ${ENV.PORT}`)
})