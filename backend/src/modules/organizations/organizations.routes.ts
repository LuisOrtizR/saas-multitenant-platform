import { Router } from "express"
import { register, getOrganization, suspendOrganization } from "./organizations.controller"
import { authenticate } from "../auth/auth.middleware"
import { authorize } from "../auth/rbac.middleware"

const router = Router()

router.post("/register", register)
router.get("/me", authenticate, getOrganization)
router.patch("/:id/suspend", authenticate, authorize("SUPER_ADMIN"), suspendOrganization)

export default router