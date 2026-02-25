import { http } from "./http"
import type { Organization } from "@/types/auth.types"

export interface PlatformOrganization extends Organization {
  users: Array<{
    id: string
    email: string
    role: string
    organizationId: string
  }>
  plan: string
  suspended: boolean
  createdAt: string
  updatedAt: string
}

export const platformApi = {
  getOrganizations: () =>
    http.get<PlatformOrganization[]>("/platform/organizations")
}
