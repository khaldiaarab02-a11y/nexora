"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { addToCart } from "@/lib/cart";

type Product = {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  is_active: boolean;
  image_url: string | null;
  sku: string | null;
};

type Store = { name: string; slug: string };

export default function ProductPage() {
  const params = useParams<{ slug: string; productSlug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: storeData } = await supabase
        .from("stores")
        .select("id,name,slug")
        .eq("slug", params.slug)
        .eq("is_active", true)
        .maybeSingle();

      if (!storeData) {
        setError("المتجر غير موجود.");
        setLoading(false);
        return;
      }

      const { data, error: productError } = await supabase
        .from("products")
        .select("id,store_id,name,slug,description,price,compare_at_price,stock_quantity,is_active,image_url,sku")
        .eq("store_id", storeData.id)
        .eq("slug", params.productSlug)
        .eq("is_active", true)
        .maybeSingle();

      if (productError || !data) setError("المنتج غير موجود.");
      else {
        setStore(storeData);
        setProduct(data);
      }
      setLoading(false);
    }
    load();
  }, [params.slug, params.productSlug]);

  if (loading) return <main className="min-h-screen bg-zinc-50 p-8 text-center text-zinc-500">جاري تحميل المنتج...</main>;
  if (error || !product || !store) return <main className="min-h-screen bg-zinc-50 p-8 text-center text-red-600">{error}</main>;

  const unavailable = product.stock_quantity <= 0;

  function handleAdd() {
    addToCart({
      productId: product.id,
      storeId: product.store_id,
      storeSlug: store.slug,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      quantity,
      stockQuantity: product.stock_quantity,
      imageUrl: product.image_url,
      sku: product.sku,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <main className="min-h-screen bg-[#fafafa]" dir="rtl">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link href={`/shop/${store.slug}`} className="text-sm font-medium text-zinc-600">← العودة للمتجر</Link>
          <Link href="/cart" className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white">السلة 🛒</Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-8">
        <div className="grid overflow-hidden rounded-[2rem] border border-zinc-200 bg-white md:grid-cols-2">
          <div className="aspect-square bg-zinc-100">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-400">لا توجد صورة</div>
            )}
          </div>

          <div className="p-7 sm:p-10">
            <p className="text-sm text-zinc-400">{store.name}</p>
            <h1 className="mt-3 text-3xl font-bold">{product.name}</h1>

            {product.description && <p className="mt-5 leading-7 text-zinc-600">{product.description}</p>}

            <div className="mt-7">
              <span className="text-3xl font-bold">{Number(product.price).toLocaleString("fr-DZ")} DZD</span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="mr-3 text-zinc-400 line-through">{Number(product.compare_at_price).toLocaleString("fr-DZ")} DZD</span>
              )}
            </div>

            <p className={`mt-3 text-sm ${unavailable ? "text-red-500" : "text-emerald-600"}`}>
              {unavailable ? "نفد المخزون" : `متوفر — ${product.stock_quantity} قطعة`}
            </p>

            {!unavailable && (
              <div className="mt-7">
                <label className="mb-2 block text-sm font-medium">الكمية</label>
                <div className="flex w-fit items-center overflow-hidden rounded-xl border border-zinc-300">
                  <button className="px-5 py-3" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                  <span className="min-w-12 text-center">{quantity}</span>
                  <button className="px-5 py-3" onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}>+</button>
                </div>
              </div>
            )}

            <button
              disabled={unavailable}
              onClick={handleAdd}
              className="mt-7 w-full rounded-xl bg-zinc-900 px-5 py-4 font-semibold text-white disabled:bg-zinc-200 disabled:text-zinc-400"
            >
              {added ? "تمت الإضافة ✓" : "أضف إلى السلة"}
            </button>

            {added && (
              <Link href="/cart" className="mt-3 block text-center text-sm font-medium text-zinc-600">
                الانتقال إلى السلة →
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}