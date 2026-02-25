import type {
  LoginDTO,
  RegisterDTO,
  SelectOrganizationDTO,
  LoginResponse,
  RegisterResponse,
  SelectOrganizationResponse
} from "@/types/auth.types"

const BASE_URL = "http://localhost:4000"

async function post<T>(path: string, body: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw { status: res.status, message: data.message || "Request failed" }
  return data as T
}

export const authApi = {
  login: (data: LoginDTO) =>
    post<LoginResponse>("/auth/login", data),

  register: (data: RegisterDTO) =>
    post<RegisterResponse>("/auth/register", data),

  selectOrganization: (data: SelectOrganizationDTO, loginSessionToken: string) =>
    post<SelectOrganizationResponse>("/auth/select-organization", data, loginSessionToken)
}
