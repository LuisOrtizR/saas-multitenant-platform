import { Router } from "express"
import { authenticate } from "../auth/auth.middleware"
import { authorize } from "../auth/rbac.middleware"
import { basePrisma } from "../../lib/prisma"

const router = Router()

/**
 * GET /superadmin/organizations
 * Solo accesible por SUPER_ADMIN
 */
router.get(
  "/organizations",
  authenticate,
  authorize("SUPER_ADMIN"),
  async (req, res) => {
    try {
      const orgs = await basePrisma.organization.findMany({
        include: { users: true } // incluye todos los usuarios de cada org
      })
      res.json(orgs)
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Internal server error" })
    }
  }
)

export default router