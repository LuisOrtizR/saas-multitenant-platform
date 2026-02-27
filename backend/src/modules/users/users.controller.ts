import { Response } from "express"
import { TenantRequest } from "../tenant/tenant.middleware"
import * as usersService from "./users.service"
import { ok, created, error } from "../../lib/response"

export async function createUser(req: TenantRequest, res: Response) {
  try {
    const result = await usersService.createUser(req)
    return created(res, result)
  } catch (err: any) {
    return error(res, err.status || 500, err.message || "Internal server error")
  }
}

export async function getUsers(req: TenantRequest, res: Response) {
  try {
    const result = await usersService.getUsers(req)
    return ok(res, result)
  } catch (err: any) {
    return error(res, err.status || 500, err.message || "Internal server error")
  }
}