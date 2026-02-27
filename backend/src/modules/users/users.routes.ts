import { Router } from "express"
import { authenticate } from "../auth/auth.middleware"
import { authorize } from "../auth/rbac.middleware"
import { attachTenantPrisma } from "../tenant/tenant-prisma.middleware"
import { requireFeature } from "../billing/feature.guard"
import { createUser, getUsers } from "./users.controller"

const router = Router()

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "USER"),
  attachTenantPrisma,
  getUsers
)

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  requireFeature("basic_dashboard"),
  attachTenantPrisma,
  createUser
)

export default router