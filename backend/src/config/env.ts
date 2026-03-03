import dotenv from "dotenv"
dotenv.config()

// ── Schema de validación ──────────────────────────────────────────────────────

const REQUIRED_VARS = [
  "DATABASE_URL",
  "JWT_SECRET",
] as const

const OPTIONAL_VARS = {
  PORT: "4000",
  JWT_ISSUER: "saas-platform",
  JWT_AUDIENCE: "saas-users",
} as const

// ── Validación al arrancar ────────────────────────────────────────────────────

const missing = REQUIRED_VARS.filter(key => !process.env[key])

if (missing.length > 0) {
  console.error("❌ Missing required environment variables:")
  missing.forEach(key => console.error(`   - ${key}`))
  console.error("\nPlease check your .env file and try again.")
  process.exit(1)
}

// ── Validaciones adicionales ──────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET as string
if (JWT_SECRET.length < 16) {
  console.error("❌ JWT_SECRET must be at least 16 characters long.")
  process.exit(1)
}

const DATABASE_URL = process.env.DATABASE_URL as string
if (!DATABASE_URL.startsWith("postgresql://") && !DATABASE_URL.startsWith("postgres://")) {
  console.error("❌ DATABASE_URL must be a valid PostgreSQL connection string.")
  console.error('   Expected format: postgresql://user:password@host:port/database')
  process.exit(1)
}

// ── Config exportada ──────────────────────────────────────────────────────────

export const ENV = {
  PORT:         process.env.PORT         ?? OPTIONAL_VARS.PORT,
  JWT_SECRET,
  JWT_ISSUER:   process.env.JWT_ISSUER   ?? OPTIONAL_VARS.JWT_ISSUER,
  JWT_AUDIENCE: process.env.JWT_AUDIENCE ?? OPTIONAL_VARS.JWT_AUDIENCE,
  DATABASE_URL,
  NODE_ENV:     process.env.NODE_ENV     ?? "development",
}

console.log(`✅ Environment validated — running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`)