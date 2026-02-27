import { http } from "./http"
import type { Organization } from "@/types/auth.types"

export interface PlatformOrganization extends Organization {
  users: Array<{
    id: string
    email: string
    role: string
    organizationId: string
  }>
  subscription: {
    status: string
    plan: {
      name: string
      price: number
      currency: string
    }
  } | null
  suspended: boolean
  createdAt: string
  updatedAt: string
}

export const platformApi = {
  getOrganizations: () => http.get<PlatformOrganization[]>("/platform/organizations"),
  suspendOrganization: (id: string) => http.patch(`/organizations/${id}/suspend`, {})
}
