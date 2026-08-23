"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { addToCart, getCart, type CartItem } from "@/lib/cart";
import ThemeStorefront, { type ThemeStorefrontProduct } from "@/components/storefront/ThemeStorefront";
import { getTheme } from "@/themes/registry";
import { resolveTheme } from "@/themes/utils";
import type { ThemeId } from "@/themes/types";
import { useI18n } from "@/i18n/LanguageProvider";

type Store = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
};

type Product = ThemeStorefrontProduct;
type Settings = { currency: string };
type ThemeSettings = {
  theme_id: ThemeId;
  primary_color: string;
  accent_color: string;
  font: string;
};

type SortOption = "newest" | "priceLow" | "priceHigh" | "nameAsc";

export default function StorefrontPage() {
  const { t } = useI18n();
  const sortLabel: Record<SortOption, string> = {
    newest: t.shopPage.sortNewest,
    priceLow: t.shopPage.sortPriceLow,
    priceHigh: t.shopPage.sortPriceHigh,
    nameAsc: t.shopPage.sortNameAsc,
  };
  const params = useParams<{ slug: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings>({ currency: "DZD" });
  const [themeSettings, setThemeSettings] = useState<ThemeSettings | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  function refreshCartCount() {
    setCartCount(getCart().reduce((total: number, item: CartItem) => total + item.quantity, 0));
  }

  useEffect(() => {
    refreshCartCount();
    window.addEventListener("nexora-cart-updated", refreshCartCount);
    return () => window.removeEventListener("nexora-cart-updated", refreshCartCount);
  }, []);

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
        setError(t.shopPage.storeNotFoundOrUnavailable);
        setLoading(false);
        return;
      }

      setStore(storeData);

      const [{ data: productData, error: productError }, { data: settingsData }, { data: themeData }] =
        await Promise.all([
          supabase.from("products").select("id,name,slug,description,price,compare_at_price,stock_quantity,is_active,is_featured,image_url,sku,created_at").eq("store_id", storeData.id).eq("is_active", true).order("created_at", { ascending: false }),
          supabase.from("store_settings").select("currency").eq("store_id", storeData.id).maybeSingle(),
          supabase.from("store_theme_settings").select("theme_id,primary_color,accent_color,font").eq("store_id", storeData.id).maybeSingle(),
        ]);

      if (productError) {
        setError(productError.message);
        setLoading(false);
        return;
      }

      const productList = productData ?? [];
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
          if (!firstImageByProduct.has(img.product_id)) firstImageByProduct.set(img.product_id, img.image_url);
        }
      }

      setProducts(productList.map((p) => ({
        ...p,
        image_url: p.image_url || firstImageByProduct.get(p.id) || null,
        extraImageCount: Math.max((imageCountByProduct.get(p.id) ?? 0) - 1, 0),
      })));

      if (settingsData?.currency) setSettings({ currency: settingsData.currency });
      if (themeData) setThemeSettings(themeData as ThemeSettings);
      setLoading(false);
    }

    loadStore();
  }, [params.slug]);

  const visibleProducts = useMemo(() => {
    let result = products;
    if (searchTerm) {
      result = result.filter((p) => p.name.toLowerCase().includes(searchTerm) || Boolean(p.sku?.toLowerCase().includes(searchTerm)));
    }
    const sorted = [...result];
    switch (sortOption) {
      case "priceLow": sorted.sort((a, b) => Number(a.price) - Number(b.price)); break;
      case "priceHigh": sorted.sort((a, b) => Number(b.price) - Number(a.price)); break;
      case "nameAsc": sorted.sort((a, b) => a.name.localeCompare(b.name, "ar")); break;
      default: sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
    return <main className="min-h-screen bg-zinc-50 p-6"><div className="mx-auto max-w-6xl animate-pulse"><div className="h-48 rounded-[2rem] bg-zinc-200" /><div className="mt-8 h-14 rounded-2xl bg-zinc-200" /><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((item) => <div key={item} className="h-80 rounded-3xl bg-zinc-200" />)}</div></div></main>;
  }

  if (error || !store) {
    return <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6"><div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-10 text-center"><p className="text-sm font-semibold tracking-[0.25em] text-zinc-400">NEXORA</p><h1 className="mt-4 text-2xl font-bold text-zinc-900">{error || t.shopPage.storeNotFound}</h1></div></main>;
  }

  const resolved = resolveTheme(themeSettings?.theme_id, themeSettings?.primary_color, themeSettings?.accent_color, themeSettings?.font);

  return (
    <ThemeStorefront
      theme={resolved.theme}
      primaryColor={resolved.primaryColor}
      accentColor={resolved.accentColor}
      fontStack={resolved.fontStack}
      store={store}
      products={visibleProducts}
      currency={settings.currency}
      cartCount={cartCount}
      searchInput={searchInput}
      sortOption={sortOption}
      sortOptions={(Object.keys(sortLabel) as SortOption[]).map((value) => ({ value, label: sortLabel[value] }))}
      onSearchChange={setSearchInput}
      onSortChange={(value) => setSortOption(value as SortOption)}
      onAdd={handleAdd}
      addedId={addedId}
    />
  );
}
