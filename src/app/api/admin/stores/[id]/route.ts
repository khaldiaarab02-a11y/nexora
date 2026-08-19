import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!key) {
    throw new Error("Missing SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY in Vercel Environment Variables");
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function requireAdmin(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return { error: NextResponse.json({ error: "يجب تسجيل الدخول أولًا." }, { status: 401 }) };

  const anonClient = getAnonClient();
  const { data: userData, error: userError } = await anonClient.auth.getUser(token);
  if (userError || !userData.user) {
    return { error: NextResponse.json({ error: "الجلسة غير صالحة أو منتهية." }, { status: 401 }) };
  }

  const adminClient = getAdminClient();
  const { data: adminRow, error: adminError } = await adminClient
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (adminError) return { error: NextResponse.json({ error: adminError.message }, { status: 500 }) };
  if (!adminRow) return { error: NextResponse.json({ error: "غير مصرح لك بهذا الإجراء." }, { status: 403 }) };

  return { adminClient };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guard = await requireAdmin(request);
    if ("error" in guard) return guard.error;
    const { adminClient } = guard;

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
