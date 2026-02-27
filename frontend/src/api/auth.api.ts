import type {
  LoginDTO,
  RegisterDTO,
  SelectOrganizationDTO,
  LoginResponse,
  RegisterResponse,
  SelectOrganizationResponse
} from "@/types/auth.types"

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000"

async function post<T>(path: string, body: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  })

  const json = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw {
      status: res.status,
      message: json.error?.message ?? json.message ?? "Request failed"
    }
  }

  return (json.data ?? json) as T
}

export const authApi = {
  login: (data: LoginDTO) =>
    post<LoginResponse>("/auth/login", data),

  register: (data: RegisterDTO) =>
    post<RegisterResponse>("/organizations/register", data),

  selectOrganization: (data: SelectOrganizationDTO, loginSessionToken: string) =>
    post<SelectOrganizationResponse>("/auth/select-organization", data, loginSessionToken)
}
