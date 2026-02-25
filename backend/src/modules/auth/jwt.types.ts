export type Role = "SUPER_ADMIN" | "ADMIN" | "USER"

export interface JwtPayload {
  userId: string
  email: string
  role: Role
  organizationId?: string
}

export interface RegisterDTO {
  name: string
  slug: string
  email: string
  password: string
}

export interface LoginDTO {
  email: string
  password: string
}

export interface SelectOrganizationDTO {
  organizationId: string
}