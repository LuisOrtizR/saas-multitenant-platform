import { Router } from "express"
import { authenticate } from "../auth/auth.middleware"
import { authorize } from "../auth/rbac.middleware"
import { getPlans, getSubscription, upgradePlan } from "./billing.controller"
import { getUsage, getUsageLimits } from "./usage.controller"

const router = Router()

router.get("/plans", getPlans)
router.get("/subscription", authenticate, getSubscription)
router.post("/subscription/upgrade", authenticate, authorize("ADMIN", "SUPER_ADMIN"), upgradePlan)
router.get("/usage", authenticate, getUsage)
router.get("/usage/limits", authenticate, getUsageLimits)

export default router