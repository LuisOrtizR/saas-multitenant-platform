import { Request, Response } from "express"
import * as authService from "./auth.service"

export async function register(req: Request, res: Response) {
  try {
    const result = await authService.register(req.body)
    return res.status(201).json(result)
  } catch (error: any) {
    return res.status(error.status || 500).json({
      message: error.message || "Internal server error"
    })
  }
}

export async function login(req: Request, res: Response) {
  try {
    const result = await authService.login(req.body)
    return res.json(result)
  } catch (error: any) {
    return res.status(error.status || 500).json({
      message: error.message || "Internal server error"
    })
  }
}

export async function selectOrganization(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization
    const result = await authService.selectOrganization(
      req.body,
      authHeader
    )
    return res.json(result)
  } catch (error: any) {
    return res.status(error.status || 500).json({
      message: error.message || "Internal server error"
    })
  }
}