"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { addToCart, getCart, type CartItem } from "@/lib/cart";

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
  sku: string | null;
  created_at: string;
  extraImageCount: number;
};

type Settings = { currency: string };

type SortOption = "newest" | "priceLow" | "priceHigh" | "nameAsc";

const sortLabel: Record<SortOption, string> = {
  newest: "الأحدث",
  priceLow: "السعر: من الأقل للأعلى",
  priceHigh: "السعر: من الأعلى للأقل",
  nameAsc: "الاسم أبجديًا",
};

export default function StorefrontPage() {
  const params = useParams<{ slug: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings>({ currency: "DZD" });
  const [cartCount, setCartCount] = useState(0);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  function refreshCartCount() {
    setCartCount(
      getCart().reduce((total: number, item: CartItem) => total + item.quantity, 0)
    );
  }

  useEffect(() => {
    refreshCartCount();
    window.addEventListener("nexora-cart-updated", refreshCartCount);
    return () => window.removeEventListener("nexora-cart-updated", refreshCartCount);
  }, []);

  // Debounce search so filtering doesn't run on every keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => setSearchTerm(searchInput.trim().toLowerCase()), 250);
    return () => clearTimeout(timeout);
  }, [searchInput]);

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
            .select(
              "id,name,slug,description,price,compare_at_price,stock_quantity,is_active,is_featured,image_url,sku,created_at"
            )
            .eq("store_id", storeData.id)
            .eq("is_active", true)
            .order("created_at", { ascending: false }),
          supabase
            .from("store_settings")
            .select("currency")
            .eq("store_id", storeData.id)
            .maybeSingle(),
        ]);

      if (productError) {
        setError(productError.message);
        setLoading(false);
        return;
      }

      const productList = productData ?? [];

      // Single bulk query (no N+1): only used as a fallback for products
      // whose image_url is somehow empty, and to know how many extra
      // photos exist for the small "+N" badge on the card.
      const imageCountByProduct = new Map<string, number>();
      const firstImageByProduct = new Map<string, string>();

      if (productList.length > 0) {
        const { data: imagesData } = await supabase
          .from("product_images")
          .select("product_id,image_url,sort_order")
          .in("product_id", productList.map((p) => p.id))
          .order("sort_order", { ascending: true });

        for (const img of imagesData ?? []) {
          imageCountByProduct.set(img.product_id, (imageCountByProduct.get(img.product_id) ?? 0) + 1);
          if (!firstImageByProduct.has(img.product_id)) {
            firstImageByProduct.set(img.product_id, img.image_url);
          }
        }
      }

      setProducts(
        productList.map((p) => ({
          ...p,
          image_url: p.image_url || firstImageByProduct.get(p.id) || null,
          extraImageCount: Math.max((imageCountByProduct.get(p.id) ?? 0) - 1, 0),
        }))
      );

      if (settingsData?.currency) setSettings({ currency: settingsData.currency });

      setLoading(false);
    }

    loadStore();
  }, [params.slug]);

  const visibleProducts = useMemo(() => {
    let result = products;

    if (searchTerm) {
      result = result.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(searchTerm);
        const skuMatch = p.sku?.toLowerCase().includes(searchTerm);
        return nameMatch || skuMatch;
      });
    }

    const sorted = [...result];
    switch (sortOption) {
      case "newest":
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "priceLow":
        sorted.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "priceHigh":
        sorted.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "nameAsc":
        sorted.sort((a, b) => a.name.localeCompare(b.name, "ar"));
        break;
    }
    return sorted;
  }, [products, searchTerm, sortOption]);

  function handleAdd(product: Product) {
    if (!store || product.stock_quantity <= 0) return;

    addToCart({
      productId: product.id,
      storeId: store.id,
      storeSlug: store.slug,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      quantity: 1,
      stockQuantity: product.stock_quantity,
      imageUrl: product.image_url,
      sku: product.sku,
    });

    setAddedId(product.id);
    refreshCartCount();
    setTimeout(() => setAddedId(null), 1800);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fafafa] p-6" dir="rtl">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-48 rounded-[2rem] bg-zinc-200" />
          <div className="mt-8 h-14 rounded-2xl bg-zinc-200" />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-80 rounded-3xl bg-zinc-200" />
            ))}
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
          <h1 className="mt-4 text-2xl font-bold text-zinc-900">
            {error || "المتجر غير موجود"}
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900" dir="rtl">
      <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="h-11 w-11 shrink-0 rounded-2xl object-cover" />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-sm font-bold text-white">
                {store.name.slice(0, 1)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[0.2em] text-zinc-400">NEXORA</p>
              <h1 className="truncate font-bold">{store.name}</h1>
            </div>
          </div>

          <Link
            href="/cart"
            className="relative shrink-0 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white"
          >
            السلة 🛒
            {cartCount > 0 && (
              <span className="mr-2 inline-flex min-w-6 items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-xs font-bold text-zinc-900">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-8 pt-10">
        <div className="overflow-hidden rounded-[2rem] bg-zinc-900 px-7 py-12 text-white sm:px-12">
          <p className="text-sm font-medium text-zinc-400">متجر إلكتروني</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            {store.name}
          </h2>
          {store.description && (
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
              {store.description}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="ابحثي عن منتج بالاسم أو SKU..."
            className="w-full rounded-2xl border border-zinc-200 bg-white px-5 py-3.5 text-sm outline-none focus:border-zinc-900 sm:flex-1"
          />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-zinc-900 sm:w-auto"
          >
            {(Object.keys(sortLabel) as SortOption[]).map((option) => (
              <option key={option} value={option}>
                {sortLabel[option]}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm text-zinc-400">اكتشفي مجموعتنا</p>
            <h2 className="mt-1 text-2xl font-bold">المنتجات</h2>
          </div>
          <span className="text-sm text-zinc-400">{visibleProducts.length} منتج</span>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center">
            <h3 className="text-xl font-bold">لا توجد منتجات متاحة حاليًا</h3>
            <p className="mt-2 text-sm text-zinc-500">سيتم عرض المنتجات هنا عندما تصبح متاحة.</p>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center">
            <h3 className="text-xl font-bold">لم نجد أي منتج مطابق</h3>
            <p className="mt-2 text-sm text-zinc-500">جرّبي كلمة بحث مختلفة.</p>
            <button
              onClick={() => setSearchInput("")}
              className="mt-5 inline-flex rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white"
            >
              مسح البحث
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"
              >
                <Link href={`/shop/${store.slug}/product/${product.slug}`} className="block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                        لا توجد صورة
                      </div>
                    )}

                    <div className="absolute right-4 top-4 flex flex-col items-end gap-1.5">
                      {product.is_featured && (
                        <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold shadow-sm">
                          مميز
                        </span>
                      )}
                      {product.extraImageCount > 0 && (
                        <span className="rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-medium text-white">
                          +{product.extraImageCount} صور
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 pb-2">
                    <h3 className="text-lg font-bold">{product.name}</h3>
                    {product.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">
                        {product.description}
                      </p>
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
                  </div>
                </Link>

                <div className="px-5 pb-5">
                  <button
                    type="button"
                    disabled={product.stock_quantity <= 0}
                    onClick={() => handleAdd(product)}
                    className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
                  >
                    {addedId === product.id ? "تمت الإضافة ✓" : "أضف إلى السلة"}
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
