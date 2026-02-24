import jwt from "jsonwebtoken"
import { JwtPayload } from "./jwt.types"
import { ENV } from "../../config/env"

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: "1h"
  })
}