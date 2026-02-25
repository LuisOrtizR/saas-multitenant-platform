import { Router } from "express"
import { authenticate } from "../auth/auth.middleware"
import { authorize } from "../auth/rbac.middleware"
import { attachTenantPrisma } from "../tenant/tenant-prisma.middleware"
import * as controller from "./users.controller"

const router = Router()

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  attachTenantPrisma,
  controller.createUser
)

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "USER"),
  attachTenantPrisma,
  controller.getUsers
)

export default router