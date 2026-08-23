export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export const orderStatuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

// Display labels now live in the i18n dictionaries (t.orderStatus) instead of
// a hardcoded Arabic-only map here, since this module is plain TS (no React
// context) and previously could never react to a language change - callers
// used the same Arabic label regardless of the selected language.

// Visual treatment per status, shared everywhere a status badge is rendered
// so no page has to duplicate this mapping.
export const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  shipped: "bg-violet-50 text-violet-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
};

// Solid bar color per status (e.g. for the status-distribution bars on the
// dashboard). Kept as literal Tailwind class names (not derived at runtime)
// so the Tailwind JIT scanner can find and include them in the build.
export const statusBarColor: Record<OrderStatus, string> = {
  pending: "bg-amber-400",
  confirmed: "bg-blue-400",
  shipped: "bg-violet-400",
  delivered: "bg-emerald-400",
  cancelled: "bg-red-400",
};
