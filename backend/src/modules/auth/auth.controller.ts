import { Request, Response } from "express"
import * as authService from "./auth.service"
import { ok, error } from "../../lib/response"

export async function login(req: Request, res: Response) {
  try {
    const result = await authService.login(req.body)
    return ok(res, { message: "Login successful", ...result })
  } catch (err: any) {
    return error(res, err.status || 500, err.message || "Internal server error")
  }
}

export async function selectOrganization(req: Request, res: Response) {
  try {
    const result = await authService.selectOrganization(req.body, req.headers.authorization)
    return ok(res, { message: "Organization selected successfully", ...result })
  } catch (err: any) {
    return error(res, err.status || 500, err.message || "Internal server error")
  }
}