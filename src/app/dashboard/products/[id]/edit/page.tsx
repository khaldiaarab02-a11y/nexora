"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import ProductImagesManager, { type ProductImageRecord } from "@/components/dashboard/ProductImagesManager";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/i18n/LanguageProvider";

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

function extractStoragePath(url: string) {
  const marker = "/storage/v1/object/public/product-images/";
  const index = url.indexOf(marker);
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length));
}

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { t } = useI18n();

  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setMessage(t.feedback.authRequired);
        setLoading(false);
        return;
      }

      const [{ data: productData, error: productError }, { data: imagesData, error: imagesError }] = await Promise.all([
        supabase
          .from("products")
          .select("id,name,slug,description,sku,price,compare_at_price,stock_quantity,is_active,is_featured,image_url")
          .eq("id", params.id)
          .maybeSingle(),
        supabase
          .from("product_images")
          .select("id,image_url,sort_order,is_primary")
          .eq("product_id", params.id)
          .order("sort_order", { ascending: true }),
      ]);

      if (productError || !productData) {
        setMessage(productError?.message || t.productEdit.notFound);
        setLoading(false);
        return;
      }

      setProduct(productData);
      if (!imagesError) setImages(imagesData ?? []);
      setLoading(false);
    }

    load();
  }, [params.id]);

  async function save() {
    if (!product || saving) return;
    setSaving(true);
    setMessage("");

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
        image_url: product.image_url,
      })
      .eq("id", product.id);

    if (error) {
      setMessage(error.message);
      toast.error(error.message || t.feedback.productUpdateError);
    } else {
      toast.success(t.feedback.productUpdateSuccess);
      router.push("/dashboard/products");
      router.refresh();
    }

    setSaving(false);
  }

  async function removeProduct() {
    if (!product || deleting) return;
    const confirmed = window.confirm(
      `${t.productEdit.confirmDeletePrefix} "${product.name}"${t.productEdit.confirmDeleteSuffix}`
    );
    if (!confirmed) return;

    setDeleting(true);
    setMessage("");

    // Clean up every gallery image file from Storage (the DB rows cascade
    // automatically when the product row is deleted below).
    const galleryPaths = images.map((img) => extractStoragePath(img.image_url)).filter((p): p is string => Boolean(p));
    if (galleryPaths.length > 0) {
      await supabase.storage.from("product-images").remove(galleryPaths);
    }

    // Legacy safety net: older products may have an image_url that was
    // never mirrored into product_images.
    if (product.image_url) {
      const legacyPath = extractStoragePath(product.image_url);
      if (legacyPath && !galleryPaths.includes(legacyPath)) {
        await supabase.storage.from("product-images").remove([legacyPath]);
      }
    }

    const { error } = await supabase.from("products").delete().eq("id", product.id);

    if (error) {
      setMessage(error.message);
      toast.error(error.message || t.feedback.productDeleteError);
      setDeleting(false);
      return;
    }

    toast.success(t.feedback.productDeleteSuccess);
    router.push("/dashboard/products");
    router.refresh();
  }

  if (loading) {
    return <main className="min-h-screen bg-zinc-50 p-6 text-center text-zinc-500">{t.productEdit.loadingProduct}</main>;
  }

  if (!product) {
    return <main className="min-h-screen bg-zinc-50 p-6 text-center text-red-700">{message}</main>;
  }

  return (
    <main className="min-h-screen bg-zinc-50 py-8">
      <div className="mx-auto max-w-2xl px-4">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Nexora</p>
          <h1 className="mt-2 text-3xl font-bold text-zinc-900">{t.productEdit.title}</h1>

          <div className="mt-7 space-y-5">
            <ProductImagesManager
              productId={product.id}
              initialImages={images}
              onPrimaryUrlChange={(url) => setProduct((prev) => (prev ? { ...prev, image_url: url } : prev))}
            />

            <Field label={t.productEdit.name}>
              <input className={inputClass} value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })} />
            </Field>

            <Field label={t.productEdit.urlLabel}>
              <input className={inputClass} value={product.slug}
                onChange={(e) => setProduct({ ...product, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} />
            </Field>

            <Field label={t.productEdit.description}>
              <textarea className={`${inputClass} min-h-28`} value={product.description || ""}
                onChange={(e) => setProduct({ ...product, description: e.target.value })} />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t.productEdit.price}>
                <input type="number" min="0" className={inputClass} value={product.price}
                  onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })} />
              </Field>

              <Field label={t.productEdit.compareAtPrice}>
                <input type="number" min="0" className={inputClass} value={product.compare_at_price ?? ""}
                  onChange={(e) => setProduct({ ...product, compare_at_price: e.target.value ? Number(e.target.value) : null })} />
              </Field>

              <Field label={t.productEdit.stock}>
                <input type="number" min="0" className={inputClass} value={product.stock_quantity}
                  onChange={(e) => setProduct({ ...product, stock_quantity: Number(e.target.value) })} />
              </Field>

              <Field label={t.productEdit.sku}>
                <input className={inputClass} value={product.sku || ""}
                  onChange={(e) => setProduct({ ...product, sku: e.target.value })} />
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4">
                <input type="checkbox" checked={product.is_active}
                  onChange={(e) => setProduct({ ...product, is_active: e.target.checked })} />
                <span className="text-sm font-medium">{t.productEdit.activeLabel}</span>
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4">
                <input type="checkbox" checked={product.is_featured}
                  onChange={(e) => setProduct({ ...product, is_featured: e.target.checked })} />
                <span className="text-sm font-medium">{t.productEdit.featuredLabel}</span>
              </label>
            </div>

            <button onClick={save} disabled={saving || deleting}
              className="w-full rounded-xl bg-zinc-900 px-4 py-3 font-medium text-white disabled:opacity-50">
              {saving ? t.productEdit.saving : t.productEdit.saveChanges}
            </button>

            <button onClick={removeProduct} disabled={saving || deleting}
              className="w-full rounded-xl border border-red-200 px-4 py-3 font-medium text-red-600 disabled:opacity-50">
              {deleting ? t.productEdit.deleting : t.productEdit.deleteProduct}
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
