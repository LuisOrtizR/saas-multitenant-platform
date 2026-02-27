import jwt from "jsonwebtoken"
import { ENV } from "../../config/env"
import { JwtPayload } from "./auth.types"

export function generateToken(payload: JwtPayload) {
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: "1d" })
}