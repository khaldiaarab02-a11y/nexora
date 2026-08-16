"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Store = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  image_url: string | null;
};

type Settings = {
  currency: string;
};

export default function StorefrontPage() {
  const params = useParams<{ slug: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings>({ currency: "DZD" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStore() {
      const slug = params.slug;
      if (!slug) return;

      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("id,name,slug,description,logo_url")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (storeError || !storeData) {
        setError("المتجر غير موجود أو غير متاح.");
        setLoading(false);
        return;
      }

      setStore(storeData);

      const [{ data: productData, error: productError }, { data: settingsData }] =
        await Promise.all([
          supabase
            .from("products")
            .select("id,name,slug,description,price,compare_at_price,stock_quantity,is_active,is_featured,image_url")
            .eq("store_id", storeData.id)
            .eq("is_active", true)
            .order("is_featured", { ascending: false })
            .order("created_at", { ascending: false }),
          supabase
            .from("store_settings")
            .select("currency")
            .eq("store_id", storeData.id)
            .maybeSingle(),
        ]);

      if (productError) {
        setError(productError.message);
      } else {
        setProducts(productData ?? []);
      }

      if (settingsData?.currency) {
        setSettings({ currency: settingsData.currency });
      }

      setLoading(false);
    }

    loadStore();
  }, [params.slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fafafa] p-6" dir="rtl">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-48 rounded-[2rem] bg-zinc-200" />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => <div key={item} className="h-80 rounded-3xl bg-zinc-200" />)}
          </div>
        </div>
      </main>
    );
  }

  if (error || !store) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafafa] p-6" dir="rtl">
        <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-10 text-center">
          <p className="text-sm font-semibold tracking-[0.25em] text-zinc-400">NEXORA</p>
          <h1 className="mt-4 text-2xl font-bold text-zinc-900">{error || "المتجر غير موجود"}</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900" dir="rtl">
      <header className="border-b border-zinc-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="h-11 w-11 rounded-2xl object-cover" />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 text-sm font-bold text-white">
                {store.name.slice(0, 1)}
              </div>
            )}
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-zinc-400">NEXORA</p>
              <h1 className="font-bold">{store.name}</h1>
            </div>
          </div>

          <Link href="/dashboard" className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-50">
            لوحة التحكم
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-8 pt-10">
        <div className="overflow-hidden rounded-[2rem] bg-zinc-900 px-7 py-12 text-white sm:px-12">
          <p className="text-sm font-medium text-zinc-400">متجر إلكتروني</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">{store.name}</h2>
          {store.description && (
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">{store.description}</p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm text-zinc-400">اكتشفي مجموعتنا</p>
            <h2 className="mt-1 text-2xl font-bold">المنتجات</h2>
          </div>
          <span className="text-sm text-zinc-400">{products.length} منتج</span>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center">
            <h3 className="text-xl font-bold">لا توجد منتجات متاحة حاليًا</h3>
            <p className="mt-2 text-sm text-zinc-500">سيتم عرض المنتجات هنا عندما تصبح متاحة.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="group overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-zinc-400">لا توجد صورة</div>
                  )}
                  {product.is_featured && (
                    <span className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold shadow-sm">
                      مميز
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold">{product.name}</h3>
                  {product.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">{product.description}</p>
                  )}

                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xl font-bold">
                        {Number(product.price).toLocaleString("fr-DZ")} {settings.currency}
                      </p>
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <p className="mt-1 text-sm text-zinc-400 line-through">
                          {Number(product.compare_at_price).toLocaleString("fr-DZ")} {settings.currency}
                        </p>
                      )}
                    </div>

                    <span className={product.stock_quantity > 0 ? "text-sm text-emerald-600" : "text-sm text-red-500"}>
                      {product.stock_quantity > 0 ? "متوفر" : "نفد المخزون"}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={product.stock_quantity <= 0}
                    className="mt-5 w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
                  >
                    {product.stock_quantity > 0 ? "أضف إلى السلة" : "غير متوفر"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-zinc-200 bg-white py-8 text-center text-sm text-zinc-400">
        متجر {store.name} — مدعوم بواسطة Nexora
      </footer>
    </main>
  );
}