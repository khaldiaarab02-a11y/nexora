"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function ProductForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
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

  function handleImageChange(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("اختاري ملف صورة فقط.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage("حجم الصورة يجب أن يكون أقل من 5MB.");
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setMessage("يجب تسجيل الدخول أولًا.");
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
      setMessage("لم يتم العثور على متجر مرتبط بهذا الحساب.");
      setLoading(false);
      return;
    }

    let imageUrl: string | null = null;

    if (imageFile) {
      const extension = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: imageFile.type,
        });

      if (uploadError) {
        setMessage(`تعذر رفع الصورة: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      imageUrl = publicUrl.publicUrl;
    }

    const { error } = await supabase.from("products").insert({
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
      image_url: imageUrl,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard/products");
    router.refresh();
  }

  return (
    <div className="w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-7" dir="rtl">
      <div className="mb-7">
        <p className="text-sm font-medium text-zinc-400">Nexora</p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-900">إضافة منتج</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          أضف بيانات المنتج وصورته إلى متجرك.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">صورة المنتج</label>
          <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-zinc-300 p-4 text-center">
            {preview ? (
              <img src={preview} alt="معاينة المنتج" className="mx-auto h-56 w-full rounded-xl object-cover" />
            ) : (
              <div className="py-10">
                <p className="font-medium text-zinc-700">اضغطي لاختيار صورة</p>
                <p className="mt-1 text-xs text-zinc-400">JPG, PNG, WEBP — حتى 5MB</p>
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

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
          {loading ? "جاري حفظ المنتج والصورة..." : "حفظ المنتج"}
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