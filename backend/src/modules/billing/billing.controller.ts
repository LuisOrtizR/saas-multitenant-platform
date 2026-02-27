import { Response } from "express"
import { AuthRequest } from "../auth/auth.middleware"
import * as billingService from "./billing.service"
import { ok, error } from "../../lib/response"

export async function getPlans(req: AuthRequest, res: Response) {
  try {
    const result = await billingService.getPlans()
    return ok(res, result)
  } catch (err: any) {
    return error(res, err.status || 500, err.message || "Internal server error")
  }
}

export async function getSubscription(req: AuthRequest, res: Response) {
  try {
    const result = await billingService.getSubscription(req.user!.organizationId!)
    return ok(res, result)
  } catch (err: any) {
    return error(res, err.status || 500, err.message || "Internal server error")
  }
}