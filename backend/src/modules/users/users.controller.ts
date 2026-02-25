import { Response } from "express"
import { TenantRequest } from "../tenant/tenant.middleware"
import * as usersService from "./users.service"

export async function createUser(req: TenantRequest, res: Response) {
  try {
    const result = await usersService.createUser(req)
    return res.status(201).json(result)
  } catch (error: any) {
    return res.status(error.status || 500).json({
      message: error.message || "Internal server error"
    })
  }
}

export async function getUsers(req: TenantRequest, res: Response) {
  try {
    const result = await usersService.getUsers(req)
    return res.json(result)
  } catch (error: any) {
    return res.status(error.status || 500).json({
      message: error.message || "Internal server error"
    })
  }
}