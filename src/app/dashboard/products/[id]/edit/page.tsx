"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  image_url: string | null;
};

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setMessage("يجب تسجيل الدخول أولًا.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("id,name,slug,description,sku,price,compare_at_price,stock_quantity,is_active,is_featured,image_url")
        .eq("id", params.id)
        .maybeSingle();

      if (error || !data) {
        setMessage(error?.message || "لم يتم العثور على المنتج.");
      } else {
        setProduct(data);
      }
      setLoading(false);
    }

    load();
  }, [params.id]);

  async function save() {
    if (!product) return;
    setSaving(true);
    setMessage("");

    let imageUrl = product.image_url;

    if (newImage) {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        setMessage("يجب تسجيل الدخول أولًا.");
        setSaving(false);
        return;
      }

      const extension = newImage.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, newImage, {
          cacheControl: "3600",
          upsert: false,
          contentType: newImage.type,
        });

      if (uploadError) {
        setMessage(`تعذر رفع الصورة: ${uploadError.message}`);
        setSaving(false);
        return;
      }

      imageUrl = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;

      if (product.image_url) {
        const marker = "/storage/v1/object/public/product-images/";
        const index = product.image_url.indexOf(marker);
        if (index !== -1) {
          const oldPath = decodeURIComponent(product.image_url.slice(index + marker.length));
          await supabase.storage.from("product-images").remove([oldPath]);
        }
      }
    }

    const { error } = await supabase
      .from("products")
      .update({
        name: product.name.trim(),
        slug: product.slug.trim(),
        description: product.description?.trim() || null,
        sku: product.sku?.trim() || null,
        price: Number(product.price),
        compare_at_price: product.compare_at_price ? Number(product.compare_at_price) : null,
        stock_quantity: Number(product.stock_quantity),
        is_active: product.is_active,
        is_featured: product.is_featured,
        image_url: imageUrl,
      })
      .eq("id", product.id);

    if (error) {
      setMessage(error.message);
    } else {
      router.push("/dashboard/products");
      router.refresh();
    }

    setSaving(false);
  }

  async function removeProduct() {
    if (!product) return;
    const confirmed = window.confirm(
      `هل أنتِ متأكدة من حذف "${product.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`
    );
    if (!confirmed) return;

    setDeleting(true);
    setMessage("");

    if (product.image_url) {
      const marker = "/storage/v1/object/public/product-images/";
      const index = product.image_url.indexOf(marker);
      if (index !== -1) {
        const path = decodeURIComponent(product.image_url.slice(index + marker.length));
        await supabase.storage.from("product-images").remove([path]);
      }
    }

    const { error } = await supabase.from("products").delete().eq("id", product.id);

    if (error) {
      setMessage(error.message);
      setDeleting(false);
      return;
    }

    router.push("/dashboard/products");
    router.refresh();
  }

  if (loading) {
    return <main className="min-h-screen bg-zinc-50 p-6 text-center text-zinc-500">جاري تحميل المنتج...</main>;
  }

  if (!product) {
    return <main className="min-h-screen bg-zinc-50 p-6 text-center text-red-700">{message}</main>;
  }

  return (
    <main className="min-h-screen bg-zinc-50 py-8" dir="rtl">
      <div className="mx-auto max-w-2xl px-4">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Nexora</p>
          <h1 className="mt-2 text-3xl font-bold text-zinc-900">تعديل المنتج</h1>

          <div className="mt-7 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">صورة المنتج</label>
              <label className="block cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-zinc-300">
                {preview || product.image_url ? (
                  <img src={preview || product.image_url || ""} alt={product.name} className="h-56 w-full object-cover" />
                ) : (
                  <div className="py-12 text-center text-sm text-zinc-400">لا توجد صورة — اضغطي لاختيار صورة</div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
                      setMessage("اختاري JPG أو PNG أو WEBP بحجم أقل من 5MB.");
                      return;
                    }
                    setNewImage(file);
                    setPreview(URL.createObjectURL(file));
                    setMessage("");
                  }}
                />
              </label>
            </div>

            <Field label="اسم المنتج">
              <input className={inputClass} value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })} />
            </Field>

            <Field label="رابط المنتج">
              <input className={inputClass} value={product.slug}
                onChange={(e) => setProduct({ ...product, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} />
            </Field>

            <Field label="الوصف">
              <textarea className={`${inputClass} min-h-28`} value={product.description || ""}
                onChange={(e) => setProduct({ ...product, description: e.target.value })} />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="السعر (DZD)">
                <input type="number" min="0" className={inputClass} value={product.price}
                  onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })} />
              </Field>

              <Field label="السعر قبل التخفيض">
                <input type="number" min="0" className={inputClass} value={product.compare_at_price ?? ""}
                  onChange={(e) => setProduct({ ...product, compare_at_price: e.target.value ? Number(e.target.value) : null })} />
              </Field>

              <Field label="المخزون">
                <input type="number" min="0" className={inputClass} value={product.stock_quantity}
                  onChange={(e) => setProduct({ ...product, stock_quantity: Number(e.target.value) })} />
              </Field>

              <Field label="SKU">
                <input className={inputClass} value={product.sku || ""}
                  onChange={(e) => setProduct({ ...product, sku: e.target.value })} />
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4">
                <input type="checkbox" checked={product.is_active}
                  onChange={(e) => setProduct({ ...product, is_active: e.target.checked })} />
                <span className="text-sm font-medium">المنتج نشط</span>
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4">
                <input type="checkbox" checked={product.is_featured}
                  onChange={(e) => setProduct({ ...product, is_featured: e.target.checked })} />
                <span className="text-sm font-medium">منتج مميز</span>
              </label>
            </div>

            <button onClick={save} disabled={saving || deleting}
              className="w-full rounded-xl bg-zinc-900 px-4 py-3 font-medium text-white disabled:opacity-50">
              {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>

            <button onClick={removeProduct} disabled={saving || deleting}
              className="w-full rounded-xl border border-red-200 px-4 py-3 font-medium text-red-600 disabled:opacity-50">
              {deleting ? "جاري الحذف..." : "حذف المنتج"}
            </button>

            {message && <p className="rounded-xl bg-red-50 p-3 text-center text-sm text-red-700">{message}</p>}
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-2 block text-sm font-medium text-zinc-700">{label}</label>{children}</div>;
}

const inputClass = "w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900";