import { Router } from "express"
import { authenticate } from "../auth/auth.middleware"
import { authorize } from "../auth/rbac.middleware"
import { attachTenantPrisma } from "../tenant/tenant-prisma.middleware"
import { createUser, getUsers } from "./users.controller"

const router = Router()

router.post("/", authenticate, authorize("ADMIN"), attachTenantPrisma, createUser)
router.get("/", authenticate, authorize("ADMIN", "USER"), attachTenantPrisma, getUsers)

export default router