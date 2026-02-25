import { http } from "./http"
import type { User, CreateUserDTO, UsersResponse } from "@/types/user.types"

export const usersApi = {
  getUsers: () => http.get<UsersResponse>("/users"),

  createUser: (data: CreateUserDTO) => http.post<User>("/users", data)
}
