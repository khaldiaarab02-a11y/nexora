import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { canUseFeature, type PlanId } from "@/config/plans";
import { FONT_OPTIONS, getTheme, THEMES } from "@/themes/registry";
import { isValidHex } from "@/themes/utils";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

function getAuthClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

async function authenticate(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const authClient = getAuthClient();
  const { data } = await authClient.auth.getUser(token);
  return data.user ?? null;
}

async function getOwnerStore(userId: string) {
  const admin = getAdminClient();
  const { data: membership, error: membershipError } = await admin
    .from("store_members")
    .select("store_id")
    .eq("user_id", userId)
    .eq("role", "owner")
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership) return null;

  const { data: store } = await admin
    .from("stores")
    .select("id,name,slug,logo_url")
    .eq("id", membership.store_id)
    .maybeSingle();

  if (!store) return null;
  return { store, storeId: membership.store_id };
}

async function getSubscription(storeId: string) {
  const admin = getAdminClient();
  const { data } = await admin
    .from("subscriptions")
    .select("plan_id,status,end_date")
    .eq("store_id", storeId)
    .maybeSingle();

  const plan: PlanId = data?.status === "active" && data?.plan_id === "business" ? "business" : "starter";
  return { ...(data ?? { plan_id: "starter", status: "pending", end_date: null }), effectivePlan: plan };
}

function safeThemePayload(themeId: string, primaryColor: string, accentColor: string, font: string) {
  const theme = getTheme(themeId);
  const fontOption = FONT_OPTIONS.find((option) => option.id === font);

  if (!fontOption) return null;
  if (!isValidHex(primaryColor) || !isValidHex(accentColor)) return null;

  return {
    theme,
    theme_id: theme.id,
    primary_color: primaryColor,
    accent_color: accentColor,
    font,
  };
}

export async function GET(request: Request) {
  const user = await authenticate(request);
  if (!user) return NextResponse.json({ error: "يجب تسجيل الدخول أولًا." }, { status: 401 });

  const ownerStore = await getOwnerStore(user.id);
  if (!ownerStore) return NextResponse.json({ error: "لم يتم العثور على متجر مرتبط بهذا الحساب." }, { status: 403 });

  const admin = getAdminClient();
  const [{ data: settings }, subscription] = await Promise.all([
    admin
      .from("store_theme_settings")
      .select("theme_id,primary_color,accent_color,font,customization")
      .eq("store_id", ownerStore.storeId)
      .maybeSingle(),
    getSubscription(ownerStore.storeId),
  ]);

  const theme = getTheme(settings?.theme_id);
  return NextResponse.json({
    store: ownerStore.store,
    settings: settings ?? {
      theme_id: theme.id,
      primary_color: theme.defaults.primaryColor,
      accent_color: theme.defaults.accentColor,
      font: theme.defaults.font,
      customization: {},
    },
  ...subscription,
    themes: THEMES,
    fonts: FONT_OPTIONS.map(({ id, name }) => ({ id, name })),
  });
}

export async function PUT(request: Request) {
  const user = await authenticate(request);
  if (!user) return NextResponse.json({ error: "يجب تسجيل الدخول أولًا." }, { status: 401 });

  const ownerStore = await getOwnerStore(user.id);
  if (!ownerStore) return NextResponse.json({ error: "ليس لديك صلاحية على هذا المتجر." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const themeId = typeof body?.theme_id === "string" ? body.theme_id : "";
  const primaryColor = typeof body?.primary_color === "string" ? body.primary_color : "";
  const accentColor = typeof body?.accent_color === "string" ? body.accent_color : "";
  const font = typeof body?.font === "string" ? body.font : "";

  const payload = safeThemePayload(themeId, primaryColor, accentColor, font);
  if (!payload) return NextResponse.json({ error: "إعدادات المظهر غير صالحة." }, { status: 400 });

  const subscription = await getSubscription(ownerStore.storeId);
  if (payload.theme.requiredFeature && !canUseFeature(subscription.effectivePlan, payload.theme.requiredFeature)) {
    return NextResponse.json({ error: "هذه الميزة متاحة ضمن خطة Business." }, { status: 403 });
  }
  if (font !== getTheme(themeId).defaults.font && !canUseFeature(subscription.effectivePlan, "advanced_customization")) {
    return NextResponse.json({ error: "تخصيص الخطوط متاح ضمن خطة Business." }, { status: 403 });
  }

  const admin = getAdminClient();
  const { error } = await admin
    .from("store_theme_settings")
    .upsert(
      {
        store_id: ownerStore.storeId,
        theme_id: payload.theme_id,
        primary_color: payload.primary_color,
        accent_color: payload.accent_color,
        font: payload.font,
        customization: {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: "store_id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, settings: payload });
}

export async function POST(request: Request) {
  const user = await authenticate(request);
  if (!user) return NextResponse.json({ error: "يجب تسجيل الدخول أولًا." }, { status: 401 });

  const ownerStore = await getOwnerStore(user.id);
  if (!ownerStore) return NextResponse.json({ error: "ليس لديك صلاحية على هذا المتجر." }, { status: 403 });

  const admin = getAdminClient();
  const { error } = await admin
    .from("store_theme_settings")
    .upsert(
      {
        store_id: ownerStore.storeId,
        theme_id: "minimal",
        primary_color: getTheme("minimal").defaults.primaryColor,
        accent_color: getTheme("minimal").defaults.accentColor,
        font: getTheme("minimal").defaults.font,
        customization: {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: "store_id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
