export type AnalyticsStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export type AnalyticsDay = {
  date: string;
  orders: number;
  revenue: number;
};

export type AnalyticsTopProduct = {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
};

export type DashboardAnalytics = {
  rangeDays: number;
  kpis: {
    revenue: number;
    orders: number;
    averageOrderValue: number;
    customers: number;
    products: number;
    lowStock: number;
  };
  statusCounts: Record<AnalyticsStatus, number>;
  daily: AnalyticsDay[];
  topProducts: AnalyticsTopProduct[];
};
