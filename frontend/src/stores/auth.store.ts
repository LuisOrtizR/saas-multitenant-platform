import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { useRouter } from "vue-router"
import { authApi } from "@/api/auth.api"
import type { JwtPayload, Organization, LoginDTO, RegisterDTO } from "@/types/auth.types"

function decodeToken(token: string): JwtPayload | null {
  try {
    const parts = token.split(".")
    const base64 = parts[1]
    if (!base64) return null
    const decoded = atob(base64.replace(/-/g, "+").replace(/_/g, "/"))
    return JSON.parse(decoded) as JwtPayload
  } catch {
    return null
  }
}

const STORAGE_KEY = "auth"

export const useAuthStore = defineStore("auth", () => {
  const router = useRouter()

  // State
  const token = ref<string | null>(null)
  const user = ref<JwtPayload | null>(null)

  // Multi-tenant selection flow
  const pendingLoginToken = ref<string | null>(null)
  const pendingOrganizations = ref<Organization[]>([])
  const requiresOrgSelection = ref(false)

  // Computed
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isSuperAdmin = computed(() => user.value?.role === "SUPER_ADMIN")
  const isAdmin = computed(() => user.value?.role === "ADMIN" || isSuperAdmin.value)

  // Init from localStorage
  function init() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const stored = JSON.parse(raw)
      if (stored.token) {
        setToken(stored.token)
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  function setToken(newToken: string) {
    const payload = decodeToken(newToken)
    if (!payload) return

    // Check expiry
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

    const response = await authApi.selectOrganization(
      { organizationId },
      pendingLoginToken.value
    )

    // Actualizar el header de autorización manualmente para esta llamada
    pendingLoginToken.value = null
    pendingOrganizations.value = []
    requiresOrgSelection.value = false

    setToken(response.token)
    await navigateAfterLogin()
  }

  async function register(data: RegisterDTO) {
    const response = await authApi.register(data)
    setToken(response.token)
    await router.push("/dashboard")
  }

  async function navigateAfterLogin() {
    if (isSuperAdmin.value) {
      await router.push("/platform")
    } else {
      await router.push("/dashboard")
    }
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
    token,
    user,
    pendingOrganizations,
    requiresOrgSelection,
    isAuthenticated,
    isSuperAdmin,
    isAdmin,
    init,
    login,
    selectOrganization,
    register,
    logout,
    cancelOrgSelection
  }
})
