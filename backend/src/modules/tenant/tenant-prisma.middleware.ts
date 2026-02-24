import { Response, NextFunction } from "express"
import { TenantRequest } from "./tenant.middleware"
import { getTenantPrisma } from "../../lib/prisma"

export function attachTenantPrisma(
  req: TenantRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.organizationId) {
    return res.status(403).json({
      message: "Tenant context missing"
    })
  }

  req.prisma = getTenantPrisma(req.organizationId)

  next()
}