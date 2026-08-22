"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { PlanId } from "@/config/plans";
import ThemePreviewCard from "@/components/storefront/ThemePreviewCard";
import { FONT_OPTIONS, THEMES, getTheme } from "@/themes/registry";
import type { FontId, ThemeId } from "@/themes/types";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/i18n/LanguageProvider";

type Settings = {
  theme_id: ThemeId;
  primary_color: string;
  accent_color: string;
  font: FontId;
};

type Store = { name: string; logo_url: string | null };
type Subscription = { plan_id: string; status: string; effectivePlan: PlanId };

export default function AppearancePage() {
  const toast = useToast();
  const { t } = useI18n();
  const [store, setStore] = useState<Store | null>(null);
  const [settings, setSettings] = useState<Settings>({
    theme_id: "minimal",
    primary_color: getTheme("minimal").defaults.primaryColor,
    accent_color: getTheme("minimal").defaults.accentColor,
    font: getTheme("minimal").defaults.font,
  });
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const activeTheme = useMemo(() => getTheme(settings.theme_id), [settings.theme_id]);
  const canAdvancedThemes = subscription?.effectivePlan === "business" && subscription.status === "active";
  const canAdvancedCustomization = canAdvancedThemes;

  const authHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const { data } = await supabase.auth.getSession();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (data.session?.access_token) {
      headers.Authorization = `Bearer ${data.session.access_token}`;
    }
    return headers;
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    const headers = await authHeaders();
    const response = await fetch("/api/appearance", { headers, cache: "no-store" });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "تعذر تحميل المظهر.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    setStore(data.store);
    setSubscription(data);
    setSettings({
      theme_id: data.settings.theme_id,
      primary_color: data.settings.primary_color,
      accent_color: data.settings.accent_color,
      font: data.settings.font,
    });
    setLoading(false);
  }, [authHeaders]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    if (saving) return;
    setSaving(true);
    setMessage("");
    const headers = await authHeaders();
    const response = await fetch("/api/appearance", {
      method: "PUT",
      headers,
      body: JSON.stringify(settings),
    });
    const data = await response.json();

    if (!response.ok) {
      const msg = data.error || t.feedback.appearanceSaveError;
      setMessage(msg);
      setMessageType("error");
      toast.error(msg);
    } else {
      setMessage("تم حفظ تخصيص المتجر بنجاح.");
      setMessageType("success");
      toast.success(t.feedback.appearanceSaveSuccess);
    }
    setSaving(false);
  }

  async function reset() {
    if (resetting) return;
    setResetting(true);
    setMessage("");
    const headers = await authHeaders();
    const response = await fetch("/api/appearance", { method: "POST", headers });
    const data = await response.json();

    if (!response.ok) {
      const msg = data.error || t.feedback.appearanceSaveError;
      setMessage(msg);
      setMessageType("error");
      toast.error(msg);
    } else {
      setMessage("تمت إعادة المظهر إلى Minimal وإعداداته الافتراضية.");
      setMessageType("success");
      toast.success(t.feedback.appearanceSaveSuccess);
      await load();
    }
    setResetting(false);
  }

  function chooseTheme(themeId: ThemeId) {
    const theme = getTheme(themeId);
    const locked = Boolean(theme.requiredFeature) && !canAdvancedThemes;
    if (locked) {
      setMessage("هذه الميزة متاحة ضمن خطة Business.");
      setMessageType("error");
      return;
    }
    setSettings((current) => ({
      ...current,
      theme_id: themeId,
      primary_color: theme.defaults.primaryColor,
      accent_color: theme.defaults.accentColor,
      font: canAdvancedCustomization ? current.font : theme.defaults.font,
    }));
  }

  if (loading) {
    return <main className="min-h-screen bg-zinc-50 p-6"><div className="mx-auto max-w-6xl animate-pulse"><div className="h-10 w-48 rounded bg-zinc-200" /><div className="mt-8 h-96 rounded-3xl bg-zinc-200" /></div></main>;
  }

  return (
    <main className="min-h-screen bg-zinc-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">Nexora</p>
            <h1 className="mt-2 text-3xl font-bold text-zinc-900">المظهر والتخصيص</h1>
            <p className="mt-2 text-sm text-zinc-500">اختر مظهرًا جاهزًا ثم خصصي ألوان متجرك وهويته البصرية.</p>
          </div>
          <Link href="/dashboard/settings/store" className="text-sm font-medium text-zinc-500 hover:text-zinc-900">إدارة بيانات المتجر ←</Link>
        </div>

        {subscription?.status !== "active" && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            الاشتراك الحالي {subscription?.status === "pending" ? "قيد الانتظار" : subscription?.status === "expired" ? "منتهي" : "غير فعال"}.
            ميزات Business ستبقى مقفلة حتى يصبح الاشتراك فعالًا.
          </div>
        )}

        {message && (
          <div className={`mb-6 rounded-2xl border p-4 text-sm ${messageType === "error" ? "border-red-100 bg-red-50 text-red-700" : "border-emerald-100 bg-emerald-50 text-emerald-700"}`}>
            {message}
          </div>
        )}

        <section className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Themes</h2>
              <p className="mt-1 text-sm text-zinc-500">المظهر يغيّر طريقة عرض نفس المنتجات والسلة والشراء.</p>
            </div>
            {store?.logo_url && <img src={store.logo_url} alt={store.name} className="h-12 w-12 rounded-xl object-cover" />}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {THEMES.map((theme) => {
              const locked = Boolean(theme.requiredFeature) && !canAdvancedThemes;
              return (
                <ThemePreviewCard
                  key={theme.id}
                  theme={theme}
                  active={settings.theme_id === theme.id}
                  locked={locked}
                  onSelect={() => chooseTheme(theme.id)}
                />
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-5 sm:p-7">
          <div>
            <h2 className="text-xl font-bold">الألوان</h2>
            <p className="mt-1 text-sm text-zinc-500">تعديلاتك تستبدل ألوان الثيم فقط، ولا تغيّر منطق المتجر.</p>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <ColorField label="Primary color" value={settings.primary_color} onChange={(value) => setSettings({ ...settings, primary_color: value })} />
            <ColorField label="Accent color" value={settings.accent_color} onChange={(value) => setSettings({ ...settings, accent_color: value })} />
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Typography</h2>
              <p className="mt-1 text-sm text-zinc-500">خطوط آمنة من النظام بدون تحميل أصول ثقيلة.</p>
            </div>
            {!canAdvancedCustomization && <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600">🔒 Business</span>}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FONT_OPTIONS.map((font) => {
              const locked = !canAdvancedCustomization && font.id !== activeTheme.defaults.font;
              return (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => {
                    if (locked) {
                      setMessage("تخصيص الخطوط متاح ضمن خطة Business.");
                      setMessageType("error");
                      return;
                    }
                    setSettings({ ...settings, font: font.id as FontId });
                  }}
                  className={`rounded-2xl border p-4 text-right ${settings.font === font.id ? "border-zinc-900 ring-2 ring-zinc-900/10" : "border-zinc-200"} ${locked ? "opacity-60" : "hover:border-zinc-400"}`}
                  style={{ fontFamily: font.stack }}
                >
                  <p className="font-bold">{font.name}</p>
                  <p className="mt-2 text-sm text-zinc-500">نص تجريبي للمتجر</p>
                  {locked && <span className="mt-2 inline-block text-[10px] font-bold text-zinc-500">🔒 Business</span>}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 p-5 sm:p-7">
            <h2 className="text-xl font-bold">معاينة سريعة</h2>
          </div>
          <div
            className="p-5 sm:p-8"
            style={{
              background: activeTheme.preview.background,
              color: settings.primary_color,
              fontFamily: FONT_OPTIONS.find((font) => font.id === settings.font)?.stack,
            }}
          >
            <div className="mx-auto max-w-4xl">
              <div className="rounded-2xl p-6 text-white" style={{ background: settings.primary_color }}>
                <p className="text-xs opacity-70">NEXORA STORE</p>
                <h3 className="mt-2 text-3xl font-bold">{store?.name || "متجرك"}</h3>
                <div className="mt-5 h-2 w-24 rounded-full" style={{ background: settings.accent_color }} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="aspect-square rounded-2xl bg-white/80 p-3 shadow-sm">
                    <div className="h-2/3 rounded-xl" style={{ background: `${settings.accent_color}22` }} />
                    <div className="mt-3 h-3 w-2/3 rounded-full" style={{ background: `${settings.primary_color}33` }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="sticky bottom-3 z-20 mt-6 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:justify-end">
          <button type="button" onClick={reset} disabled={resetting || saving} className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-700 disabled:opacity-50">
            {resetting ? "جاري إعادة الضبط..." : "Reset to defaults"}
          </button>
          <button type="button" onClick={save} disabled={saving || resetting} className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? "جاري الحفظ..." : "Save customization"}
          </button>
        </div>
      </div>
    </main>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 p-3">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-12 w-12 shrink-0 cursor-pointer rounded-xl border-0 bg-transparent p-0" aria-label={label} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-zinc-800">{label}</span>
        <span className="mt-1 block text-xs text-zinc-400">{value}</span>
      </span>
    </label>
  );
}
