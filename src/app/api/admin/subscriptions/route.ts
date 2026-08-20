import { NextResponse } from "next/server";
import { requireAdmin, serviceClient } from "@/lib/server/auth";

const VALID_STATUSES = ["pending", "active", "expired", "cancelled"] as const;
type SubscriptionStatus = (typeof VALID_STATUSES)[number];

const VALID_PLANS = ["starter", "business"] as const;
type PlanId = (typeof VALID_PLANS)[number];

function isValidStatus(value: unknown): value is SubscriptionStatus {
  return typeof value === "string" && (VALID_STATUSES as readonly string[]).includes(value);
}

function isValidPlan(value: unknown): value is PlanId {
  return typeof value === "string" && (VALID_PLANS as readonly string[]).includes(value);
}

// PATCH { storeId, status?, planId?, endDate? }
// Only ever writes to the ONE subscriptions row for storeId. Never accepts
// or trusts a subscription id, never lets the caller target another
// store's row indirectly.
export async function PATCH(request: Request) {
  try {
    const guard = await requireAdmin(request);
    if (!guard.user) return NextResponse.json({ error: "يجب تسجيل الدخول أولًا." }, { status: 401 });
    if (!guard.admin) return NextResponse.json({ error: "غير مصرح لك بهذا الإجراء." }, { status: 403 });
    const adminClient = serviceClient();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "بيانات الطلب غير صالحة." }, { status: 400 });
    }

    const { storeId, status, planId, endDate } = (body ?? {}) as {
      storeId?: unknown;
      status?: unknown;
      planId?: unknown;
      endDate?: unknown;
    };

    if (typeof storeId !== "string" || !storeId) {
      return NextResponse.json({ error: "معرّف المتجر مفقود." }, { status: 400 });
    }

    if (status !== undefined && !isValidStatus(status)) {
      return NextResponse.json({ error: "حالة الاشتراك غير صالحة." }, { status: 400 });
    }

    if (planId !== undefined && !isValidPlan(planId)) {
      return NextResponse.json({ error: "الخطة غير صالحة." }, { status: 400 });
    }

    if (endDate !== undefined && endDate !== null && Number.isNaN(Date.parse(String(endDate)))) {
      return NextResponse.json({ error: "تاريخ الانتهاء غير صالح." }, { status: 400 });
    }

    const { data: store, error: storeError } = await adminClient
      .from("stores")
      .select("id")
      .eq("id", storeId)
      .maybeSingle();

    if (storeError) {
      return NextResponse.json({ error: storeError.message }, { status: 500 });
    }
    if (!store) {
      return NextResponse.json({ error: "المتجر غير موجود." }, { status: 404 });
    }

    const { data: existing } = await adminClient
      .from("subscriptions")
      .select("plan_id,status,start_date,end_date")
      .eq("store_id", storeId)
      .maybeSingle();

    const nextRow = {
      store_id: storeId,
      plan_id: (isValidPlan(planId) ? planId : existing?.plan_id) || "starter",
      status: (isValidStatus(status) ? status : existing?.status) || "pending",
      start_date: existing?.start_date || new Date().toISOString(),
      end_date: endDate === undefined ? existing?.end_date ?? null : endDate,
      updated_at: new Date().toISOString(),
    };

    const { data: updated, error: upsertError } = await adminClient
      .from("subscriptions")
      .upsert(nextRow, { onConflict: "store_id" })
      .select("store_id,plan_id,status,start_date,end_date")
      .single();

    if (upsertError || !updated) {
      throw new Error(upsertError?.message || "تعذر تحديث الاشتراك.");
    }

    return NextResponse.json({ success: true, subscription: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "حدث خطأ غير معروف.";
    console.error("NEXORA ADMIN SUBSCRIPTION ERROR:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
