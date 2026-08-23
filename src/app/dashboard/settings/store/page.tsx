"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/i18n/LanguageProvider";

type Store = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  is_active: boolean;
};

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_LOGO_SIZE = 5 * 1024 * 1024;
const DESCRIPTION_MAX = 500;

function extractStoragePath(url: string) {
  const marker = "/storage/v1/object/public/product-images/";
  const index = url.indexOf(marker);
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length));
}

function sanitizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

export default function StoreSettingsPage() {
  const toast = useToast();
  const { t } = useI18n();
  const [store, setStore] = useState<Store | null>(null);
  const [originalSlug, setOriginalSlug] = useState("");
  const [currency, setCurrency] = useState("DZD");
  const [shippingFee, setShippingFee] = useState("0");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");
  const [copyFeedback, setCopyFeedback] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const storeUrl = store ? `${typeof window !== "undefined" ? window.location.origin : ""}/shop/${store.slug}` : "";

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setMessage(t.feedback.authRequired);
        setMessageType("error");
        setLoading(false);
        return;
      }

      const { data: membership } = await supabase
        .from("store_members")
        .select("store_id")
        .eq("user_id", userData.user.id)
        .eq("role", "owner")
        .limit(1)
        .maybeSingle();

      if (!membership) {
        setMessage(t.feedback.storeNotFoundForAccount);
        setMessageType("error");
        setLoading(false);
        return;
      }

      const [{ data: storeData, error: storeError }, { data: settingsData }] = await Promise.all([
        supabase
          .from("stores")
          .select("id,name,slug,description,logo_url,is_active")
          .eq("id", membership.store_id)
          .maybeSingle(),
        supabase
          .from("store_settings")
          .select("currency,default_shipping_fee")
          .eq("store_id", membership.store_id)
          .maybeSingle(),
      ]);

      if (storeError || !storeData) {
        setMessage(storeError?.message || t.feedback.storeLoadError);
        setMessageType("error");
        setLoading(false);
        return;
      }

      setStore(storeData);
      setOriginalSlug(storeData.slug);
      if (settingsData?.currency) setCurrency(settingsData.currency);
      if (settingsData?.default_shipping_fee != null) setShippingFee(String(settingsData.default_shipping_fee));

      setLoading(false);
    }

    load();
  }, []);

  async function handleLogoSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0 || !store) return;
    const file = fileList[0];

    if (!file || file.size === 0) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setMessage(t.feedback.imageTypeError);
      setMessageType("error");
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      setMessage(t.feedback.logoSizeError);
      setMessageType("error");
      return;
    }

    setUploadingLogo(true);
    setMessage("");

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setMessage(t.feedback.authRequired);
      setMessageType("error");
      setUploadingLogo(false);
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/logo-${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });

    if (uploadError) {
      const msg = `${t.feedback.logoUploadError}: ${uploadError.message}`;
      setMessage(msg);
      setMessageType("error");
      toast.error(msg);
      setUploadingLogo(false);
      return;
    }

    const publicUrl = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
    const previousLogoPath = store.logo_url ? extractStoragePath(store.logo_url) : null;

    const { error: updateError } = await supabase.from("stores").update({ logo_url: publicUrl }).eq("id", store.id);

    if (updateError) {
      const msg = `${t.feedback.logoUploadPartialError}: ${updateError.message}`;
      setMessage(msg);
      setMessageType("error");
      toast.error(msg);
      await supabase.storage.from("product-images").remove([path]);
      setUploadingLogo(false);
      return;
    }

    if (previousLogoPath) {
      await supabase.storage.from("product-images").remove([previousLogoPath]);
    }

    setStore({ ...store, logo_url: publicUrl });
    setMessage(t.feedback.logoUpdateSuccess);
    setMessageType("success");
    toast.success(t.feedback.logoUpdateSuccess);
    setUploadingLogo(false);
  }

  async function removeLogo() {
    if (!store || !store.logo_url) return;
    const confirmed = window.confirm(t.feedback.logoRemoveConfirm);
    if (!confirmed) return;

    setUploadingLogo(true);
    setMessage("");

    const path = extractStoragePath(store.logo_url);
    const { error: updateError } = await supabase.from("stores").update({ logo_url: null }).eq("id", store.id);

    if (updateError) {
      setMessage(updateError.message);
      setMessageType("error");
      toast.error(updateError.message);
      setUploadingLogo(false);
      return;
    }

    if (path) {
      await supabase.storage.from("product-images").remove([path]);
    }

    setStore({ ...store, logo_url: null });
    setMessage(t.feedback.logoRemoveSuccess);
    setMessageType("success");
    toast.success(t.feedback.logoRemoveSuccess);
    setUploadingLogo(false);
  }

  async function handleSave() {
    if (!store || saving) return;

    const trimmedName = store.name.trim();
    const cleanSlug = sanitizeSlug(store.slug);
    const trimmedDescription = (store.description || "").slice(0, DESCRIPTION_MAX).trim();
    const fee = Number(shippingFee);

    if (!trimmedName) {
      setMessage(t.feedback.storeNameRequired);
      setMessageType("error");
      return;
    }
    if (!cleanSlug || cleanSlug.length < 3) {
      setMessage(t.feedback.storeSlugInvalid);
      setMessageType("error");
      return;
    }
    if (!currency.trim()) {
      setMessage(t.feedback.currencyRequired);
      setMessageType("error");
      return;
    }
    if (Number.isNaN(fee) || fee < 0) {
      setMessage(t.feedback.shippingFeeInvalid);
      setMessageType("error");
      return;
    }

    setSaving(true);
    setMessage("");

    if (cleanSlug !== originalSlug) {
      const { data: conflict } = await supabase
        .from("stores")
        .select("id")
        .eq("slug", cleanSlug)
        .neq("id", store.id)
        .maybeSingle();

      if (conflict) {
        setMessage(t.feedback.slugTaken);
        setMessageType("error");
        setSaving(false);
        return;
      }
    }

    const { error: storeUpdateError } = await supabase
      .from("stores")
      .update({
        name: trimmedName,
        slug: cleanSlug,
        description: trimmedDescription || null,
        is_active: store.is_active,
      })
      .eq("id", store.id);

    if (storeUpdateError) {
      setMessage(storeUpdateError.message);
      setMessageType("error");
      toast.error(storeUpdateError.message || t.feedback.settingsSaveError);
      setSaving(false);
      return;
    }

    const { error: settingsUpdateError } = await supabase
      .from("store_settings")
      .upsert({ store_id: store.id, currency: currency.trim(), default_shipping_fee: fee }, { onConflict: "store_id" });

    if (settingsUpdateError) {
      const msg = `${t.feedback.settingsSavePartialError}: ${settingsUpdateError.message}`;
      setMessage(msg);
      setMessageType("error");
      toast.error(msg);
      setSaving(false);
      return;
    }

    setOriginalSlug(cleanSlug);
    setStore({ ...store, name: trimmedName, slug: cleanSlug, description: trimmedDescription || null });
    setMessage(t.feedback.settingsSaveSuccess);
    setMessageType("success");
    toast.success(t.feedback.settingsSaveSuccess);
    setSaving(false);
  }

  async function copyStoreLink() {
    if (!storeUrl) return;
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopyFeedback(true);
      toast.success(t.feedback.linkCopySuccess);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch {
      setMessage(t.feedback.linkCopyError);
      setMessageType("error");
      toast.error(t.feedback.linkCopyError);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50 p-4 sm:p-6">
        <div className="mx-auto max-w-2xl animate-pulse space-y-4 py-6">
          <div className="h-8 w-48 rounded bg-zinc-200" />
          <div className="h-40 rounded-3xl bg-zinc-200" />
          <div className="h-64 rounded-3xl bg-zinc-200" />
        </div>
      </main>
    );
  }

  if (!store) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6 text-center">
        <p className="rounded-2xl bg-red-50 p-4 text-red-700">{message}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-zinc-900">{t.storeSettings.title}</h1>
        <p className="mt-1 text-sm text-zinc-500">{t.storeSettings.subtitle}</p>

        {/* Public preview */}
        <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-bold text-zinc-900">{t.storeSettings.yourStore}</h2>
          <p className="mt-2 break-all text-sm text-zinc-500">{storeUrl}</p>
          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
            <a
              href={`/shop/${store.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-xl bg-zinc-900 px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              {t.storeSettings.viewStore}
            </a>
            <button
              onClick={copyStoreLink}
              className="flex-1 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700"
            >
              {copyFeedback ? t.storeSettings.linkCopied : t.storeSettings.copyLink}
            </button>
          </div>
        </section>

        {/* Logo */}
        <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-bold text-zinc-900">{t.storeSettings.logoTitle}</h2>
          <div className="mt-4 flex items-center gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-zinc-400">{t.storeSettings.none}</div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <label className="cursor-pointer rounded-xl border border-zinc-300 px-4 py-2.5 text-center text-sm font-medium text-zinc-700">
                {uploadingLogo ? t.storeSettings.uploading : store.logo_url ? t.storeSettings.replaceLogo : t.storeSettings.uploadLogo}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={uploadingLogo}
                  onChange={(e) => {
                    handleLogoSelected(e.target.files);
                    if (logoInputRef.current) logoInputRef.current.value = "";
                  }}
                />
              </label>
              {store.logo_url && (
                <button
                  onClick={removeLogo}
                  disabled={uploadingLogo}
                  className="rounded-xl border border-red-100 px-4 py-2.5 text-sm font-medium text-red-600 disabled:opacity-50"
                >
                  {t.storeSettings.removeLogo}
                </button>
              )}
            </div>
          </div>
          <p className="mt-3 text-xs text-zinc-400">{t.storeSettings.logoHint}</p>
        </section>

        {/* Store details */}
        <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-bold text-zinc-900">{t.storeSettings.detailsTitle}</h2>

          <div className="mt-5 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">{t.storeSettings.storeName}</label>
              <input
                value={store.name}
                onChange={(e) => setStore({ ...store, name: e.target.value })}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">{t.storeSettings.storeUrl}</label>
              <div className="flex items-center rounded-xl border border-zinc-300 focus-within:border-zinc-900">
                <span className="border-l px-3 text-sm text-zinc-400">/shop/</span>
                <input
                  value={store.slug}
                  onChange={(e) => setStore({ ...store, slug: e.target.value })}
                  onBlur={(e) => setStore({ ...store, slug: sanitizeSlug(e.target.value) })}
                  className="w-full rounded-xl px-3 py-3 outline-none"
                />
              </div>
              <p className="mt-2 text-xs text-zinc-400">{t.storeSettings.urlHint}</p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-zinc-700">{t.storeSettings.description}</label>
                <span className="text-xs text-zinc-400">
                  {(store.description || "").length}/{DESCRIPTION_MAX}
                </span>
              </div>
              <textarea
                value={store.description || ""}
                maxLength={DESCRIPTION_MAX}
                onChange={(e) => setStore({ ...store, description: e.target.value })}
                className="min-h-32 w-full resize-y rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
                placeholder={t.storeSettings.descriptionPlaceholder}
              />
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4">
              <input
                type="checkbox"
                checked={store.is_active}
                onChange={(e) => setStore({ ...store, is_active: e.target.checked })}
              />
              <span className="text-sm font-medium text-zinc-700">
                {t.storeSettings.activeLabel}
              </span>
            </label>
          </div>
        </section>

        {/* Shipping & currency */}
        <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-bold text-zinc-900">{t.storeSettings.shippingTitle}</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">{t.storeSettings.currencyLabel}</label>
              <input
                value={currency}
                maxLength={6}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
                placeholder="DZD"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">{t.storeSettings.shippingFeeLabel}</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={shippingFee}
                onChange={(e) => setShippingFee(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
              />
            </div>
          </div>
        </section>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 w-full rounded-xl bg-zinc-900 px-4 py-3.5 font-semibold text-white disabled:opacity-50"
        >
          {saving ? t.common.saving : t.storeSettings.saveChanges}
        </button>

        {message && (
          <p
            className={`mt-4 rounded-xl p-3 text-center text-sm ${
              messageType === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
