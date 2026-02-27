import { Router } from "express"
import { login, selectOrganization } from "./auth.controller"

const router = Router()

router.post("/login", login)
router.post("/select-organization", selectOrganization)

export default router