import { AuthRequest } from "../auth/auth.middleware"
import { TenantPrismaClient } from "../../lib/prisma"

export interface TenantRequest extends AuthRequest {
  organizationId?: string
  prisma?: TenantPrismaClient
}