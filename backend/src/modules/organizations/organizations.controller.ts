import { Request, Response } from "express"
import * as orgService from "./organizations.service"
import { AuthRequest } from "../auth/auth.middleware"
import { ok, created, error } from "../../lib/response"

export async function register(req: Request, res: Response) {
  try {
    const result = await orgService.registerOrganization(req.body)
    return created(res, result)
  } catch (err: any) {
    return error(res, err.status || 500, err.message || "Internal server error")
  }
}

export async function getOrganization(req: AuthRequest, res: Response) {
  try {
    const result = await orgService.getOrganization(req.user!.organizationId!)
    return ok(res, result)
  } catch (err: any) {
    return error(res, err.status || 500, err.message || "Internal server error")
  }
}

export async function suspendOrganization(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const result = await orgService.suspendOrganization(id)
    return ok(res, result)
  } catch (err: any) {
    return error(res, err.status || 500, err.message || "Internal server error")
  }
}