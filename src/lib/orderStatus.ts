export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export const orderStatuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

export const statusLabel: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغى",
};
