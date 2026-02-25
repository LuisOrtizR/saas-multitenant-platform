import { AuthRequest } from "../auth/auth.middleware"

export interface TenantRequest extends AuthRequest {
  organizationId?: string
  prisma?: any
}