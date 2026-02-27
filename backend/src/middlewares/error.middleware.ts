import { Request, Response, NextFunction } from "express"

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err.status || 500
  const message = err.message || "Internal server error"
  const code = err.code || "INTERNAL_ERROR"

  console.error(`[${new Date().toISOString()}] ${status} - ${message}`)

  return res.status(status).json({
    success: false,
    error: { code, message }
  })
}