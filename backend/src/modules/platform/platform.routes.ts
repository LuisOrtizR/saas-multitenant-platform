import { Router } from "express"
import { authenticate } from "../auth/auth.middleware"
import { authorize } from "../auth/rbac.middleware"
import { basePrisma } from "../../lib/prisma"
import { ok, error } from "../../lib/response"

const router = Router()

router.get("/organizations", authenticate, authorize("SUPER_ADMIN"), async (req, res) => {
  try {
    const orgs = await basePrisma.organization.findMany({
      include: { subscription: { include: { plan: true } }, users: true }
    })
    return ok(res, orgs)
  } catch (err: any) {
    return error(res, 500, err.message || "Internal server error")
  }
})

export default router