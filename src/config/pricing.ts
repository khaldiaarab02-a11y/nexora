import type { PlanId } from "./plans";

export type PlanPricing = { amount: number | null; currency: string };

// Commercial amounts are intentionally centralized. Set the real amounts here
// when Nexora's final pricing is approved; components never hardcode prices.
export const PLAN_PRICING: Record<PlanId, PlanPricing> = {
  starter: { amount: null, currency: "DZD" },
  business: { amount: null, currency: "DZD" },
};
