import { canUseFeature, type FeatureKey, type PlanId } from "@/config/plans";

export type SubscriptionStatus = "pending" | "active" | "expired" | "cancelled";

export function normalizePlan(planId: string | null | undefined, status: string | null | undefined): PlanId {
  if (status !== "active") return "starter";
  return planId === "business" ? "business" : "starter";
}

export function canUsePlanFeature(
  planId: string | null | undefined,
  status: string | null | undefined,
  feature: FeatureKey
) {
  return canUseFeature(normalizePlan(planId, status), feature);
}
