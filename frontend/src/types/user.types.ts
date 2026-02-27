export interface User {
  id: string
  email: string
  role: "ADMIN" | "USER"
  organizationId: string
}

export interface CreateUserDTO {
  email: string
  password: string
  role?: "ADMIN" | "USER"
}

export interface UsersResponse {
  count: number
  users: User[]
}
