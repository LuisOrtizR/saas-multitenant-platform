import { Router } from "express"
import { authenticate } from "../auth/auth.middleware"
import { getPlans, getSubscription } from "./billing.controller"

const router = Router()

router.get("/plans", getPlans)
router.get("/subscription", authenticate, getSubscription)

export default router