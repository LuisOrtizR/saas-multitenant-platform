import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { ENV } from "../../config/env"
import { JwtPayload } from "./jwt.types"

export interface AuthRequest extends Request {
  user?: JwtPayload
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  const token = authHeader.split(" ")[1]
  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload
    req.user = payload
    next()
  } catch {
    res.status(401).json({ message: "Invalid token" })
  }
}