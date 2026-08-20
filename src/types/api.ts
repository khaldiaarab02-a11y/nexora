export type SubscriptionStatus = "active" | "pending" | "rejected" | "cancelled" | string;
export type PaymentRequestStatus = "pending" | "approved" | "rejected" | string;
export type SupportCategory = "technical" | "store" | "subscription" | "payment" | "general" | string;
export type SupportStatus = "open" | "resolved" | string;

export type SubscriptionRow = {
  id: string;
  store_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  start_date: string | null;
  end_date: string | null;
  updated_at: string | null;
};

export type PaymentRequestRow = {
  id: string;
  store_id?: string;
  plan_id: string;
  amount: number | null;
  currency: string;
  payment_reference: string | null;
  status: PaymentRequestStatus;
  rejection_reason: string | null;
  proof_path?: string | null;
  created_at: string;
  updated_at?: string | null;
};

export type SupportConversation = {
  id: string;
  store_id: string;
  category: SupportCategory;
  subject: string;
  status: SupportStatus;
  created_at: string;
  updated_at: string;
};

export type SupportMessage = {
  id: string;
  conversation_id: string;
  sender_user_id: string;
  message: string;
  created_at: string;
};

export type SupportListResponse = {
  conversations?: SupportConversation[];
  error?: string;
};

export type SupportDetailResponse = {
  conversation?: SupportConversation;
  messages?: SupportMessage[];
  error?: string;
};

export type SubscriptionListResponse = {
  subscription?: SubscriptionRow | null;
  requests?: PaymentRequestRow[];
  error?: string;
};

export type PaymentRequestsResponse = {
  requests?: PaymentRequestRow[];
  error?: string;
};
