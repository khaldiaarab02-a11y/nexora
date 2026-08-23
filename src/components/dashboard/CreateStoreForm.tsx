"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/i18n/LanguageProvider";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_LOGO_SIZE = 5 * 1024 * 1024;

export default function CreateStoreForm() {
  const router = useRouter();
  const toast = useToast();
  const { t } = useI18n();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("DZD");
  const [shippingFee, setShippingFee] = useState("0");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");

  function handleSlugChange(value: string) {
    setSlug(
      value.toLowerCase().trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
    );
  }

  function handleLogoSelected(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

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

    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setMessage("");
  }

  function removeStagedLogo() {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(null);
    setLogoPreview(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const trimmedName = name.trim();
    const fee = Number(shippingFee);

    if (!trimmedName) {
      setMessage(t.feedback.storeNameRequired);
      setMessageType("error");
      return;
    }
    if (!slug || slug.length < 3) {
      setMessage(t.createStore.slugMinLength);
      setMessageType("error");
      return;
    }
    if (Number.isNaN(fee) || fee < 0) {
      setMessage(t.feedback.shippingFeeInvalid);
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setMessage(t.feedback.authRequired);
      setMessageType("error");
      setLoading(false);
      return;
    }

    // Core store creation stays exactly on the existing RPC - it is what
    // atomically creates the stores row AND makes the caller its owner
    // in store_members, using auth.uid() server-side (nothing here is
    // trusted from the client).
    const { error } = await supabase.rpc("create_store", {
      p_name: trimmedName,
      p_slug: slug,
    });

    if (error) {
      let msg: string;
      if (error.message.toLowerCase().includes("duplicate") || error.message.toLowerCase().includes("unique")) {
        msg = t.feedback.slugTaken;
      } else {
        msg = error.message;
      }
      setMessage(msg);
      setMessageType("error");
      toast.error(msg || t.feedback.storeCreateError);
      setLoading(false);
      return;
    }

    // The RPC's return shape isn't something this form assumes - instead,
    // look the new store up by its (guaranteed-unique) slug to get its real
    // id for the optional follow-up writes below.
    const { data: createdStore, error: lookupError } = await supabase
      .from("stores")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    const newStoreId = createdStore?.id;

    if (lookupError || !newStoreId) {
      // The store itself was created successfully by the RPC (no error
      // above) - only the optional extras below can't be applied right
      // now. The user can still set them from Settings afterward.
      toast.success(t.feedback.storeCreateSuccess);
      router.push("/dashboard/subscription");
      router.refresh();
      return;
    }

    // Everything below is optional polish on top of the now-real store.
    // A failure here does not leave an incomplete store - name, slug, and
    // ownership are already committed - so we surface a soft warning and
    // still continue to the dashboard.
    const extras: string[] = [];

    const trimmedDescription = description.trim();
    if (trimmedDescription) {
      const { error: descError } = await supabase
        .from("stores")
        .update({ description: trimmedDescription })
        .eq("id", newStoreId);
      if (descError) extras.push("الوصف");
    }

    if (logoFile) {
      const extension = logoFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userData.user.id}/logo-${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, logoFile, { cacheControl: "3600", upsert: false, contentType: logoFile.type });

      if (uploadError) {
        extras.push("الشعار");
      } else {
        const publicUrl = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
        const { error: logoUpdateError } = await supabase
          .from("stores")
          .update({ logo_url: publicUrl })
          .eq("id", newStoreId);
        if (logoUpdateError) extras.push("الشعار");
      }
    }

    const { error: settingsError } = await supabase
      .from("store_settings")
      .upsert({ store_id: newStoreId, currency: currency.trim() || "DZD", default_shipping_fee: fee }, { onConflict: "store_id" });
    if (settingsError) extras.push("إعدادات الشحن والعملة");

    // Business Core: every new store needs a subscription row. This RPC
    // always creates a 'pending' Starter subscription regardless of what
    // is passed to it - it cannot be used to self-activate or pick a
    // different plan. A failure here does not block the store itself;
    // Nexora admin can still create the subscription manually from
    // /admin/stores.
    const { error: subscriptionError } = await supabase.rpc("create_pending_subscription_for_new_store", {
      p_store_id: newStoreId,
    });
    if (subscriptionError) extras.push("تفعيل الاشتراك (سيتواصل معك فريق Nexora)");

    if (extras.length > 0) {
      setMessage(t.feedback.storeCreatePartialSuccess);
      setMessageType("success");
      toast.warning(t.feedback.storeCreatePartialSuccess);
    } else {
      toast.success(t.feedback.storeCreateSuccess);
    }

    router.push("/dashboard/subscription");
    router.refresh();
  }

  return (
    <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-7 text-center">
        <p className="text-sm font-medium text-zinc-500">Nexora</p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-900">{t.createStore.title}</h1>
        <p className="mt-2 text-sm text-zinc-500">
          {t.createStore.subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="store-name" className="mb-2 block text-sm font-medium text-zinc-700">{t.createStore.storeName}</label>
          <input id="store-name" required value={name} onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
            placeholder={t.createStore.storeNamePlaceholder} />
        </div>

        <div>
          <label htmlFor="store-slug" className="mb-2 block text-sm font-medium text-zinc-700">{t.createStore.storeUrl}</label>
          <div className="flex items-center rounded-xl border border-zinc-300 focus-within:border-zinc-900">
            <span className="border-l px-3 text-sm text-zinc-400">/shop/</span>
            <input id="store-slug" required minLength={3} value={slug} onChange={(e) => handleSlugChange(e.target.value)}
              className="w-full rounded-xl px-3 py-3 outline-none" placeholder="my-store" />
          </div>
          <p className="mt-2 text-xs text-zinc-400">{t.createStore.urlHint}</p>
        </div>

        <div>
          <label htmlFor="store-description" className="mb-2 block text-sm font-medium text-zinc-700">
            {t.createStore.descriptionLabel} <span className="text-zinc-400">{t.createStore.optional}</span>
          </label>
          <textarea id="store-description" value={description} maxLength={500}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-24 w-full resize-y rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
            placeholder={t.createStore.descriptionPlaceholder} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            {t.createStore.logoLabel} <span className="text-zinc-400">{t.createStore.optional}</span>
          </label>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
              {logoPreview ? (
                <img src={logoPreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-zinc-400">{t.createStore.none}</div>
              )}
            </div>
            <div className="flex flex-1 gap-2">
              <label className="flex-1 cursor-pointer rounded-xl border border-zinc-300 px-4 py-2.5 text-center text-sm font-medium text-zinc-700">
                {logoFile ? t.createStore.changeImage : t.createStore.uploadLogo}
                <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                  onChange={(e) => {
                    handleLogoSelected(e.target.files);
                    if (logoInputRef.current) logoInputRef.current.value = "";
                  }} />
              </label>
              {logoFile && (
                <button type="button" onClick={removeStagedLogo}
                  className="rounded-xl border border-red-100 px-4 py-2.5 text-sm font-medium text-red-600">
                  {t.createStore.remove}
                </button>
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-zinc-400">{t.createStore.logoHint}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="store-currency" className="mb-2 block text-sm font-medium text-zinc-700">{t.createStore.currency}</label>
            <input id="store-currency" value={currency} maxLength={6}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
              placeholder="DZD" />
          </div>
          <div>
            <label htmlFor="store-shipping" className="mb-2 block text-sm font-medium text-zinc-700">{t.createStore.shippingFee}</label>
            <input id="store-shipping" type="number" min="0" step="0.01" value={shippingFee}
              onChange={(e) => setShippingFee(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900" />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full rounded-xl bg-zinc-900 px-4 py-3 font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50">
          {loading ? t.createStore.creating : t.createStore.submit}
        </button>
      </form>

      {message && (
        <p className={`mt-5 rounded-xl p-3 text-center text-sm ${
          messageType === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
        }`}>
          {message}
        </p>
      )}
    </div>
  );
}
