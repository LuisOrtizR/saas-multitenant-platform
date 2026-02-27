import { Response, NextFunction } from "express"
import { TenantRequest } from "./tenant.middleware"
import { getTenantPrisma } from "../../lib/prisma"

export function attachTenantPrisma(req: TenantRequest, res: Response, next: NextFunction) {
  const organizationId = req.user?.organizationId
  if (!organizationId) return res.status(403).json({ message: "Tenant context missing" })

  req.organizationId = organizationId
  req.prisma = getTenantPrisma(organizationId)
  next()
}