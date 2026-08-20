import { NextResponse } from "next/server";
import { getBearerUser, serviceClient } from "@/lib/server/auth";

const ALLOWED_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

function isAllowedStatus(value: unknown): value is AllowedStatus {
  return typeof value === "string" && (ALLOWED_STATUSES as readonly string[]).includes(value);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: "رقم الطلب غير صالح." }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "بيانات الطلب غير صالحة." }, { status: 400 });
    }

    const status = (body as { status?: unknown } | null)?.status;

    if (!isAllowedStatus(status)) {
      return NextResponse.json(
        {
          error:
            "حالة الطلب غير صالحة. القيم المسموحة: pending, confirmed, shipped, delivered, cancelled.",
        },
        { status: 400 }
      );
    }

    // Verify the caller's session token against Supabase Auth (not just decoded client-side).
    const user = await getBearerUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "الجلسة غير صالحة أو منتهية. سجّلي الدخول من جديد." },
        { status: 401 }
      );
    }

    const adminClient = serviceClient();

    // Look up the order's store_id first (server-side, trusted).
    const { data: order, error: orderError } = await adminClient
      .from("orders")
      .select("id,store_id")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError) {
      throw new Error(`تعذر قراءة الطلب: ${orderError.message}`);
    }

    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود." }, { status: 404 });
    }

    // Confirm the authenticated user is an owner member of that specific store.
    const { data: membership, error: membershipError } = await adminClient
      .from("store_members")
      .select("store_id")
      .eq("user_id", user.id)
      .eq("store_id", order.store_id)
      .eq("role", "owner")
      .maybeSingle();

    if (membershipError) {
      throw new Error(`تعذر التحقق من ملكية المتجر: ${membershipError.message}`);
    }

    if (!membership) {
      return NextResponse.json(
        { error: "لا تملكين صلاحية تعديل هذا الطلب." },
        { status: 403 }
      );
    }

    // Only ever write the status column - no other field is accepted from the client.
    const { data: updated, error: updateError } = await adminClient
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .eq("store_id", order.store_id)
      .select("id,status")
      .single();

    if (updateError || !updated) {
      throw new Error(updateError?.message || "تعذر تحديث حالة الطلب.");
    }

    return NextResponse.json({ success: true, id: updated.id, status: updated.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "حدث خطأ غير معروف.";
    console.error("NEXORA ORDER STATUS UPDATE ERROR:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
