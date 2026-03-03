import { Response, NextFunction } from "express"
import { AuthRequest } from "../modules/auth/auth.middleware"

export function requestLogger(req: AuthRequest, res: Response, next: NextFunction) {
  const start = Date.now()

  res.on("finish", () => {
    const latency = Date.now() - start
    const organizationId = req.user?.organizationId ?? "anonymous"
    const userId = req.user?.userId ?? "—"

    const log = {
      timestamp:      new Date().toISOString(),
      method:         req.method,
      route:          req.originalUrl,
      status:         res.statusCode,
      latency:        `${latency}ms`,
      organizationId,
      userId,
    }

    // Colorear según status en desarrollo
    const statusColor =
      res.statusCode >= 500 ? "\x1b[31m" :  // rojo
      res.statusCode >= 400 ? "\x1b[33m" :  // amarillo
      res.statusCode >= 300 ? "\x1b[36m" :  // cyan
      "\x1b[32m"                             // verde

    console.log(
      `${statusColor}[${log.timestamp}] ${log.method} ${log.route} ${log.status}\x1b[0m` +
      ` | ${latency}ms | org: ${organizationId} | user: ${userId}`
    )
  })

  next()
}