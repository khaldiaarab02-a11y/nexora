// Nexora Business Core — centralized plan and feature access (Phase 2).
export type PlanId = "starter" | "business";

export type FeatureKey =
  | "advanced_themes"
  | "custom_domain"
  | "advanced_customization";

export const PLAN_LIMITS: Record<PlanId, { productLimit: number | null }> = {
  starter: { productLimit: null },
  business: { productLimit: null },
};

export const PLAN_FEATURES: Record<PlanId, FeatureKey[]> = {
  starter: [],
  business: ["advanced_themes", "advanced_customization"],
};

export function canUseFeature(planId: PlanId, feature: FeatureKey): boolean {
  return PLAN_FEATURES[planId]?.includes(feature) ?? false;
}

export const PLAN_LABELS: Record<PlanId, string> = {
  starter: "Starter",
  business: "Business",
};
