export interface User {
  id: string
  email: string
  organizationId: string
}

export interface CreateUserDTO {
  email: string
  password: string
}

export interface UsersResponse {
  count: number
  users: User[]
}
