import { Response, NextFunction } from "express"
import { AuthRequest } from "../auth/auth.middleware"
import { hasFeature } from "./billing.service"
import { error } from "../../lib/response"
import type { FeatureKey } from "./billing.types"

export function requireFeature(featureKey: FeatureKey) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const organizationId = req.user?.organizationId

    if (!organizationId) {
      return error(res, 403, "Organization context required", "NO_ORG_CONTEXT")
    }

    try {
      const allowed = await hasFeature(organizationId, featureKey)

      if (!allowed) {
        return error(
          res,
          403,
          `Your current plan does not include access to: ${featureKey}`,
          "FEATURE_NOT_AVAILABLE"
        )
      }

      next()
    } catch {
      return error(res, 500, "Failed to verify feature access", "FEATURE_CHECK_ERROR")
    }
  }
}