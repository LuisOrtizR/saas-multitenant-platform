import { Request, Response, NextFunction } from "express"
import { BaseError } from "../lib/errors"
import { ENV } from "../config/env"

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {

  // ── Caso 1: instancia de BaseError (clases tipadas) ───────────────────────
  if (err instanceof BaseError) {
    if (ENV.NODE_ENV !== "production") {
      console.error(`[${new Date().toISOString()}] ${err.statusCode} ${err.code} — ${err.message}`)
    }

    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      error:      err.code,
      message:    err.expose ? err.message : "Internal server error"
    })
  }

  // ── Caso 2: objetos planos lanzados con throw { status, message } ─────────
  // Compatibilidad con el código existente mientras se migra gradualmente
  if (typeof err === "object" && err !== null && "status" in err) {
    const e = err as { status?: number; message?: string; code?: string }
    const statusCode = e.status ?? 500
    const message    = e.message ?? "Internal server error"
    const code       = e.code ?? "ERROR"

    if (ENV.NODE_ENV !== "production") {
      console.error(`[${new Date().toISOString()}] ${statusCode} ${code} — ${message}`)
    }

    return res.status(statusCode).json({ statusCode, error: code, message })
  }

  // ── Caso 3: errores inesperados (Error nativo, strings, etc.) ─────────────
  const message = err instanceof Error ? err.message : "Unexpected error"

  console.error(`[${new Date().toISOString()}] 500 UNHANDLED —`, err)

  return res.status(500).json({
    statusCode: 500,
    error:      "INTERNAL_ERROR",
    message:    ENV.NODE_ENV === "production" ? "Internal server error" : message
  })
}