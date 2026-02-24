import { Request, Response, NextFunction } from "express"
import { AuthRequest } from "../auth/auth.middleware"

export interface TenantRequest extends AuthRequest {
  organizationId?: string
  prisma?: any
}

export function tenantValidationMiddleware(
  req: TenantRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user?.organizationId) {
    return res.status(403).json({
      message: "Tenant context missing"
    })
  }

  req.organizationId = req.user.organizationId
  next()
}