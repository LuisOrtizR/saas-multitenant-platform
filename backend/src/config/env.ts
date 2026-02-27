import dotenv from "dotenv"
dotenv.config()

export const ENV = {
  PORT: process.env.PORT || "4000",
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_ISSUER: "saas-platform",
  JWT_AUDIENCE: "saas-users"
}

if (!ENV.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined")
}