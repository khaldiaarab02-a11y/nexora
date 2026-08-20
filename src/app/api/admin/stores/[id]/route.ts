import { NextResponse } from "next/server";
import { requireAdmin, serviceClient } from "@/lib/server/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guard = await requireAdmin(request);
    if (!guard.user) return NextResponse.json({ error: "يجب تسجيل الدخول أولًا." }, { status: 401 });
    if (!guard.admin) return NextResponse.json({ error: "غير مصرح لك بهذا الإجراء." }, { status: 403 });
    const adminClient = serviceClient();

    const { id: storeId } = await params;

    const { data: store, error: storeError } = await adminClient
      .from("stores")
      .select("id,name,slug,description,logo_url,is_active,created_at")
      .eq("id", storeId)
      .maybeSingle();

    if (storeError) throw new Error(storeError.message);
    if (!store) return NextResponse.json({ error: "المتجر غير موجود." }, { status: 404 });

    const { data: membership } = await adminClient
      .from("store_members")
      .select("user_id")
      .eq("store_id", storeId)
      .eq("role", "owner")
      .limit(1)
      .maybeSingle();

    let ownerEmail: string | null = null;
    if (membership?.user_id) {
      const { data: userResult } = await adminClient.auth.admin.getUserById(membership.user_id);
      ownerEmail = userResult?.user?.email ?? null;
    }

    const { data: subscription } = await adminClient
      .from("subscriptions")
      .select("plan_id,status,start_date,end_date")
      .eq("store_id", storeId)
      .maybeSingle();

    return NextResponse.json({ store, ownerEmail, subscription });
  } catch (error) {
    const message = error instanceof Error ? error.message : "حدث خطأ غير معروف.";
    console.error("NEXORA ADMIN STORE DETAIL ERROR:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
