import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { useRouter } from "vue-router"
import { authApi } from "@/api/auth.api"
import type { JwtPayload, Organization, LoginDTO, RegisterDTO } from "@/types/auth.types"

function decodeToken(token: string): JwtPayload | null {
  try {
    const base64 = token.split(".")[1]
    if (!base64) return null
    return JSON.parse(atob(base64.replace(/-/g, "+").replace(/_/g, "/"))) as JwtPayload
  } catch {
    return null
  }
}

const STORAGE_KEY = "auth"

export const useAuthStore = defineStore("auth", () => {
  const router = useRouter()

  const token = ref<string | null>(null)
  const user = ref<JwtPayload | null>(null)
  const pendingLoginToken = ref<string | null>(null)
  const pendingOrganizations = ref<Organization[]>([])
  const requiresOrgSelection = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isSuperAdmin = computed(() => user.value?.role === "SUPER_ADMIN")
  const isAdmin = computed(() => user.value?.role === "ADMIN" || isSuperAdmin.value)

  function init() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const stored = JSON.parse(raw)
      if (stored.token) setToken(stored.token)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  function setToken(newToken: string) {
    const payload = decodeToken(newToken)
    if (!payload) return
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      logout()
      return
    }
    token.value = newToken
    user.value = payload
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: newToken }))
  }

  async function login(data: LoginDTO) {
    const response = await authApi.login(data)

    if ("requiresOrganizationSelection" in response && response.requiresOrganizationSelection) {
      pendingLoginToken.value = response.loginSessionToken
      pendingOrganizations.value = response.organizations
      requiresOrgSelection.value = true
      return
    }

    if ("token" in response) {
      setToken(response.token)
      await navigateAfterLogin()
    }
  }

  async function selectOrganization(organizationId: string) {
    if (!pendingLoginToken.value) return
    const response = await authApi.selectOrganization({ organizationId }, pendingLoginToken.value)
    pendingLoginToken.value = null
    pendingOrganizations.value = []
    requiresOrgSelection.value = false
    setToken(response.token)
    await navigateAfterLogin()
  }

  async function register(data: RegisterDTO) {
    await authApi.register(data)
    await router.push("/login")
  }

  async function navigateAfterLogin() {
    await router.push(isSuperAdmin.value ? "/platform" : "/dashboard")
  }

  function logout() {
    token.value = null
    user.value = null
    pendingLoginToken.value = null
    pendingOrganizations.value = []
    requiresOrgSelection.value = false
    localStorage.removeItem(STORAGE_KEY)
    router.push("/login")
  }

  function cancelOrgSelection() {
    pendingLoginToken.value = null
    pendingOrganizations.value = []
    requiresOrgSelection.value = false
  }

  return {
    token, user, pendingOrganizations, requiresOrgSelection,
    isAuthenticated, isSuperAdmin, isAdmin,
    init, login, selectOrganization, register, logout, cancelOrgSelection
  }
})
