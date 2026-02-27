const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000"

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("auth")
    if (!raw) return null
    return JSON.parse(raw)?.token ?? null
  } catch {
    return null
  }
}

async function request<T>(path: string, options: RequestInit = {}, useAuth = true): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>)
  }

  if (useAuth) {
    const token = getToken()
    if (token) headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  const json = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw {
      status: res.status,
      message: json.error?.message ?? json.message ?? "Request failed"
    }
  }

  return (json.data ?? json) as T
}

export const http = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body: unknown, useAuth = true) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }, useAuth),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" })
}
