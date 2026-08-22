"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import ProductImagesManager, { type ProductImagesManagerHandle } from "./ProductImagesManager";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/i18n/LanguageProvider";

export default function ProductForm() {
  const router = useRouter();
  const toast = useToast();
  const { t } = useI18n();
  const imagesRef = useRef<ProductImagesManagerHandle>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function makeSlug(value: string) {
    setSlug(
      value.toLowerCase().trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage("");

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setMessage("يجب تسجيل الدخول أولًا.");
      toast.error(t.feedback.sessionExpired);
      setLoading(false);
      return;
    }

    const { data: membership, error: membershipError } = await supabase
      .from("store_members")
      .select("store_id")
      .eq("user_id", user.id)
      .eq("role", "owner")
      .limit(1)
      .maybeSingle();

    if (membershipError || !membership) {
      const msg = "لم يتم العثور على متجر مرتبط بهذا الحساب.";
      setMessage(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    const { data: newProduct, error } = await supabase
      .from("products")
      .insert({
        store_id: membership.store_id,
        name: name.trim(),
        slug,
        description: description.trim() || null,
        sku: sku.trim() || null,
        price: Number(price),
        compare_at_price: compareAtPrice ? Number(compareAtPrice) : null,
        stock_quantity: Number(stock),
        is_active: active,
        is_featured: featured,
        image_url: null,
      })
      .select("id")
      .single();

    if (error || !newProduct) {
      const msg = error?.message || t.feedback.productCreateError;
      setMessage(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    if (imagesRef.current?.hasStaged()) {
      const primaryUrl = await imagesRef.current.commitStagedImages(newProduct.id, user.id);
      if (primaryUrl) {
        await supabase.from("products").update({ image_url: primaryUrl }).eq("id", newProduct.id);
      }
    }

    toast.success(t.feedback.productCreateSuccess);
    router.push("/dashboard/products");
    router.refresh();
  }

  return (
    <div className="w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="mb-7">
        <p className="text-sm font-medium text-zinc-400">Nexora</p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-900">إضافة منتج</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          أضف بيانات المنتج وصوره إلى متجرك.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <ProductImagesManager ref={imagesRef} productId={null} />

        <Field label="اسم المنتج">
          <input required value={name} onChange={(e) => { setName(e.target.value); makeSlug(e.target.value); }}
            className={inputClass} placeholder="مثال: حقيبة جلدية" />
        </Field>

        <Field label="رابط المنتج">
          <input required minLength={2} value={slug} onChange={(e) => makeSlug(e.target.value)}
            className={inputClass} placeholder="leather-bag" />
        </Field>

        <Field label="الوصف">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} min-h-28 resize-y`} placeholder="وصف مختصر للمنتج..." />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="السعر (DZD)">
            <input required type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)}
              className={inputClass} placeholder="2500" />
          </Field>

          <Field label="السعر قبل التخفيض (اختياري)">
            <input type="number" min="0" step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)}
              className={inputClass} placeholder="3000" />
          </Field>

          <Field label="المخزون">
            <input required type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)}
              className={inputClass} placeholder="10" />
          </Field>

          <Field label="SKU (اختياري)">
            <input value={sku} onChange={(e) => setSku(e.target.value)}
              className={inputClass} placeholder="BAG-001" />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            <span className="text-sm font-medium text-zinc-700">المنتج نشط</span>
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            <span className="text-sm font-medium text-zinc-700">منتج مميز</span>
          </label>
        </div>

        <button type="submit" disabled={loading}
          className="w-full rounded-xl bg-zinc-900 px-4 py-3 font-medium text-white disabled:opacity-50">
          {loading ? "جاري حفظ المنتج والصور..." : "حفظ المنتج"}
        </button>
      </form>

      {message && (
        <p className="mt-5 rounded-xl bg-red-50 p-3 text-center text-sm text-red-700">{message}</p>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-2 block text-sm font-medium text-zinc-700">{label}</label>{children}</div>;
}

const inputClass = "w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900";
