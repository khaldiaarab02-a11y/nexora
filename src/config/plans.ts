// Nexora Business Core — plan & feature foundation (Phase 1).
//
// This is architecture only. Nothing in the app currently calls
// canUseFeature() to block anything, and product_limit is not enforced
// anywhere yet - Phase 1 asks explicitly for the foundation, not the
// enforcement. Wire this up in Phase 2 once limits/features are finalized.

export type PlanId = "starter" | "business";

export type FeatureKey =
  | "advanced_themes"
  | "custom_domain"
  | "advanced_customization";

// TODO: confirm official product limits before enforcing anywhere.
// null = not decided / unlimited for now.
export const PLAN_LIMITS: Record<PlanId, { productLimit: number | null }> = {
  starter: { productLimit: null },
  business: { productLimit: null },
};

// TODO: Phase 2 fills these in per plan as real features ship.
export const PLAN_FEATURES: Record<PlanId, FeatureKey[]> = {
  starter: [],
  business: [],
};

export function canUseFeature(planId: PlanId, feature: FeatureKey): boolean {
  return PLAN_FEATURES[planId]?.includes(feature) ?? false;
}

export const PLAN_LABELS: Record<PlanId, string> = {
  starter: "Starter",
  business: "Business",
};
