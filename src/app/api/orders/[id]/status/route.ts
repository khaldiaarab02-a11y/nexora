import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

function getAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!key) {
    throw new Error(
      "Missing SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY in Vercel Environment Variables"
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
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

    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return NextResponse.json({ error: "يجب تسجيل الدخول أولًا." }, { status: 401 });
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
    const anonClient = getAnonClient();
    const { data: userData, error: userError } = await anonClient.auth.getUser(token);

    if (userError || !userData.user) {
      return NextResponse.json(
        { error: "الجلسة غير صالحة أو منتهية. سجّلي الدخول من جديد." },
        { status: 401 }
      );
    }

    const adminClient = getAdminClient();

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
      .eq("user_id", userData.user.id)
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
