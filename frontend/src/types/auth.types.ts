export type Role = "SUPER_ADMIN" | "ADMIN" | "USER"

export interface JwtPayload {
  userId: string
  email: string
  role: Role
  organizationId?: string
  exp?: number
  iat?: number
}

export interface Organization {
  id: string
  name: string
  slug: string
}

export interface LoginDTO {
  email: string
  password: string
}

export interface RegisterDTO {
  name: string
  slug: string
  email: string
  password: string
}

export interface SelectOrganizationDTO {
  organizationId: string
}

export type LoginResponse =
  | { token: string; requiresOrganizationSelection?: false }
  | {
      requiresOrganizationSelection: true
      loginSessionToken: string
      organizations: Organization[]
    }

export interface RegisterResponse {
  token: string
  organization: Organization
}

export interface SelectOrganizationResponse {
  token: string
}
