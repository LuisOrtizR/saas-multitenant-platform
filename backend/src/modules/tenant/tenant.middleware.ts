import { Response, NextFunction } from "express"
import { AuthRequest } from "../auth/auth.middleware"

export interface TenantRequest extends AuthRequest {
  organizationId?: string
}

export function tenantValidationMiddleware(
  req: TenantRequest,
  res: Response,
  next: NextFunction
) {
  const organizationId = req.user?.organizationId

  if (!organizationId) {
    return res.status(403).json({
      message: "Tenant context missing"
    })
  }

  req.organizationId = organizationId

  next()
}