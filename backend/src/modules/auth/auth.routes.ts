import { Router } from "express"
import {
  login,
  register,
  selectOrganization
} from "./auth.controller"

const router = Router()

router.post("/login", login)
router.post("/register", register)
router.post("/select-organization", selectOrganization)

export default router