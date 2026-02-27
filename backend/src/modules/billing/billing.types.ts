export interface PlanFeatures {
  basic_dashboard?: boolean
  advanced_reports?: boolean
  api_access?: boolean
  custom_integrations?: boolean
  audit_logs?: boolean
}

export type FeatureKey = keyof PlanFeatures