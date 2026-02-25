import { defineStore } from "pinia"
import { ref } from "vue"
import { usersApi } from "@/api/users.api"
import type { User, CreateUserDTO } from "@/types/user.types"

export const useUsersStore = defineStore("users", () => {
  const users = ref<User[]>([])
  const count = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchUsers() {
    loading.value = true
    error.value = null
    try {
      const response = await usersApi.getUsers()
      users.value = response.users
      count.value = response.count
    } catch (err: unknown) {
      error.value = (err as { message?: string }).message || "Failed to fetch users"
    } finally {
      loading.value = false
    }
  }

  async function createUser(data: CreateUserDTO) {
    const newUser = await usersApi.createUser(data)
    users.value.push(newUser)
    count.value++
    return newUser
  }

  return { users, count, loading, error, fetchUsers, createUser }
})
