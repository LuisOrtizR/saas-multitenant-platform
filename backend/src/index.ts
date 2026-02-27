import express from "express"
import cors from "cors"
import { ENV } from "./config/env"
import authRoutes from "./modules/auth/auth.routes"
import organizationsRoutes from "./modules/organizations/organizations.routes"
import billingRoutes from "./modules/billing/billing.routes"
import usersRoutes from "./modules/users/users.routes"
import platformRoutes from "./modules/platform/platform.routes"
import { errorHandler } from "./middlewares/error.middleware"

const app = express()

app.use(cors({ origin: "http://localhost:5173", credentials: true }))
app.use(express.json())

app.use("/auth", authRoutes)
app.use("/organizations", organizationsRoutes)
app.use("/billing", billingRoutes)
app.use("/users", usersRoutes)
app.use("/platform", platformRoutes)

app.use(errorHandler)

app.listen(ENV.PORT, () => {
  console.log(`Server running on port ${ENV.PORT}`)
})