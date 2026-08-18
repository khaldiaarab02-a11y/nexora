"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
type Settings = { currency: string };

type RelatedProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
};

const SWIPE_THRESHOLD = 40;

export default function ProductPage() {
  const params = useParams<{ slug: string; productSlug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [related, setRelated] = useState<RelatedProduct[]>([]);
  const [settings, setSettings] = useState<Settings>({ currency: "DZD" });
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const touchStartX = useRef<number | null>(null);

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
        .select(
          "id,store_id,name,slug,description,price,compare_at_price,stock_quantity,is_active,image_url,sku"
        )
        .eq("store_id", storeData.id)
        .eq("slug", params.productSlug)
        .eq("is_active", true)
        .maybeSingle();

      if (productError || !data) {
        setError("المنتج غير موجود.");
        setLoading(false);
        return;
      }

      setStore(storeData);
      setProduct(data);
      setSelectedIndex(0);

      const [{ data: imagesData }, { data: relatedData }, { data: settingsData }] =
        await Promise.all([
          supabase
            .from("product_images")
            .select("image_url")
            .eq("product_id", data.id)
            .order("sort_order", { ascending: true }),
          supabase
            .from("products")
            .select("id,name,slug,price,image_url")
            .eq("store_id", storeData.id)
            .eq("is_active", true)
            .neq("id", data.id)
            .order("created_at", { ascending: false })
            .limit(4),
          supabase
            .from("store_settings")
            .select("currency")
            .eq("store_id", storeData.id)
            .maybeSingle(),
        ]);

      const urls = (imagesData ?? []).map((img) => img.image_url);
      setGallery(urls.length > 0 ? urls : data.image_url ? [data.image_url] : []);
      setRelated(relatedData ?? []);
      if (settingsData?.currency) setSettings({ currency: settingsData.currency });

      setLoading(false);
    }

    load();
  }, [params.slug, params.productSlug]);

  function goToImage(index: number) {
    if (gallery.length === 0) return;
    const next = ((index % gallery.length) + gallery.length) % gallery.length;
    setSelectedIndex(next);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      // Swipe left -> next image, swipe right -> previous image.
      goToImage(delta < 0 ? selectedIndex + 1 : selectedIndex - 1);
    }
    touchStartX.current = null;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6" dir="rtl">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-14 rounded-2xl bg-zinc-200" />
          <div className="mt-6 grid gap-0 overflow-hidden rounded-[2rem] bg-white md:grid-cols-2">
            <div className="aspect-square bg-zinc-200" />
            <div className="space-y-4 p-8">
              <div className="h-6 w-2/3 rounded bg-zinc-200" />
              <div className="h-4 w-full rounded bg-zinc-200" />
              <div className="h-4 w-3/4 rounded bg-zinc-200" />
              <div className="h-10 w-1/3 rounded bg-zinc-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product || !store) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-8" dir="rtl">
        <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-10 text-center">
          <h1 className="text-2xl font-bold text-red-600">{error || "المنتج غير موجود."}</h1>
          <Link href="/" className="mt-4 inline-block text-sm font-medium text-zinc-500">
            الرئيسية
          </Link>
        </div>
      </main>
    );
  }

  // Capture narrowed values so TypeScript keeps them non-null inside callbacks.
  const currentProduct = product;
  const currentStore = store;
  const unavailable = currentProduct.stock_quantity <= 0;
  const selectedImage = gallery[selectedIndex] || null;

  function handleAdd() {
    if (currentProduct.stock_quantity <= 0) return;

    addToCart({
      productId: currentProduct.id,
      storeId: currentProduct.store_id,
      storeSlug: currentStore.slug,
      name: currentProduct.name,
      slug: currentProduct.slug,
      price: Number(currentProduct.price),
      quantity,
      stockQuantity: currentProduct.stock_quantity,
      imageUrl: currentProduct.image_url,
      sku: currentProduct.sku,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <main className="min-h-screen bg-[#fafafa]" dir="rtl">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link href={`/shop/${currentStore.slug}`} className="text-sm font-medium text-zinc-600">
            ← العودة للمتجر
          </Link>
          <Link href="/cart" className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white">
            السلة 🛒
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-8">
        <div className="grid overflow-hidden rounded-[2rem] border border-zinc-200 bg-white md:grid-cols-2">
          <div className="min-w-0">
            <div
              className="relative aspect-square touch-pan-y select-none bg-zinc-100"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={currentProduct.name}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-400">
                  لا توجد صورة
                </div>
              )}

              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => goToImage(selectedIndex - 1)}
                    aria-label="الصورة السابقة"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-lg shadow"
                  >
                    ›
                  </button>
                  <button
                    type="button"
                    onClick={() => goToImage(selectedIndex + 1)}
                    aria-label="الصورة التالية"
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-lg shadow"
                  >
                    ‹
                  </button>
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white">
                    {selectedIndex + 1} / {gallery.length}
                  </span>
                </>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto p-4">
                {gallery.map((url, index) => (
                  <button
                    key={url + index}
                    type="button"
                    onClick={() => goToImage(index)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${
                      selectedIndex === index ? "border-zinc-900" : "border-transparent"
                    }`}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-7 sm:p-10">
            <p className="text-sm text-zinc-400">{currentStore.name}</p>
            <h1 className="mt-3 text-3xl font-bold">{currentProduct.name}</h1>
            {currentProduct.sku && (
              <p className="mt-1 text-xs text-zinc-400">SKU: {currentProduct.sku}</p>
            )}

            {currentProduct.description && (
              <p className="mt-5 leading-7 text-zinc-600">
                {currentProduct.description}
              </p>
            )}

            <div className="mt-7">
              <span className="text-3xl font-bold">
                {Number(currentProduct.price).toLocaleString("fr-DZ")} {settings.currency}
              </span>

              {currentProduct.compare_at_price &&
                currentProduct.compare_at_price > currentProduct.price && (
                  <span className="mr-3 text-zinc-400 line-through">
                    {Number(currentProduct.compare_at_price).toLocaleString("fr-DZ")} {settings.currency}
                  </span>
                )}
            </div>

            <p className={`mt-3 text-sm ${unavailable ? "text-red-500" : "text-emerald-600"}`}>
              {unavailable ? "نفد المخزون" : `متوفر — ${currentProduct.stock_quantity} قطعة`}
            </p>

            {!unavailable && (
              <div className="mt-7">
                <label className="mb-2 block text-sm font-medium">الكمية</label>
                <div className="flex w-fit items-center overflow-hidden rounded-xl border border-zinc-300">
                  <button
                    type="button"
                    className="px-5 py-3"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    −
                  </button>
                  <span className="min-w-12 text-center">{quantity}</span>
                  <button
                    type="button"
                    className="px-5 py-3"
                    onClick={() =>
                      setQuantity(Math.min(currentProduct.stock_quantity, quantity + 1))
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={unavailable}
              onClick={handleAdd}
              className="mt-7 w-full rounded-xl bg-zinc-900 px-5 py-4 font-semibold text-white disabled:bg-zinc-200 disabled:text-zinc-400"
            >
              {added ? "تمت الإضافة ✓" : "أضف إلى السلة"}
            </button>

            {added && (
              <Link
                href="/cart"
                className="mt-3 block text-center text-sm font-medium text-zinc-600"
              >
                الانتقال إلى السلة →
              </Link>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-zinc-900">منتجات أخرى قد تعجبك</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/shop/${currentStore.slug}/product/${item.slug}`}
                  className="overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="aspect-square bg-zinc-100">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-zinc-400">لا توجد صورة</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold text-zinc-900">{item.name}</p>
                    <p className="mt-1 text-sm font-bold text-zinc-900">
                      {Number(item.price).toLocaleString("fr-DZ")} {settings.currency}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
