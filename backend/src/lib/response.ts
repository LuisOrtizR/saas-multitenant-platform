import { Response } from "express"

// ── Éxito ─────────────────────────────────────────────────────────────────────

export function ok(res: Response, data: unknown) {
  return res.status(200).json({ success: true, data })
}

export function created(res: Response, data: unknown) {
  return res.status(201).json({ success: true, data })
}

// ── Error (helper para controllers que aún no usan BaseError) ─────────────────

export function error(res: Response, statusCode: number, message: string, code = "ERROR") {
  return res.status(statusCode).json({ statusCode, error: code, message })
}