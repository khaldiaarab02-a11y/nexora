"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { addToCart } from "@/lib/cart";
import ThemeProductDetail from "@/components/storefront/ThemeProductDetail";
import { resolveTheme } from "@/themes/utils";
import type { ThemeId } from "@/themes/types";
import { useI18n } from "@/i18n/LanguageProvider";

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

type Store = { id: string; name: string; slug: string };
type RelatedProduct = { id: string; name: string; slug: string; price: number; image_url: string | null };
type ThemeSettings = { theme_id: ThemeId; primary_color: string; accent_color: string; font: string };

const SWIPE_THRESHOLD = 40;

export default function ProductPage() {
  const { t } = useI18n();
  const params = useParams<{ slug: string; productSlug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [related, setRelated] = useState<RelatedProduct[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [currency, setCurrency] = useState("DZD");
  const [themeSettings, setThemeSettings] = useState<ThemeSettings | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    async function load() {
      const { data: storeData } = await supabase.from("stores").select("id,name,slug").eq("slug", params.slug).eq("is_active", true).maybeSingle();
      if (!storeData) { setError(t.shopPage.storeNotFound); setLoading(false); return; }

      const { data, error: productError } = await supabase
        .from("products")
        .select("id,store_id,name,slug,description,price,compare_at_price,stock_quantity,is_active,image_url,sku")
        .eq("store_id", storeData.id).eq("slug", params.productSlug).eq("is_active", true).maybeSingle();

      if (productError || !data) { setError(t.shopPage.productNotFound); setLoading(false); return; }

      const [{ data: imagesData }, { data: relatedData }, { data: settingsData }, { data: themeData }] = await Promise.all([
        supabase.from("product_images").select("image_url").eq("product_id", data.id).order("sort_order", { ascending: true }),
        supabase.from("products").select("id,name,slug,price,image_url").eq("store_id", storeData.id).eq("is_active", true).neq("id", data.id).order("created_at", { ascending: false }).limit(4),
        supabase.from("store_settings").select("currency").eq("store_id", storeData.id).maybeSingle(),
        supabase.from("store_theme_settings").select("theme_id,primary_color,accent_color,font").eq("store_id", storeData.id).maybeSingle(),
      ]);

      const urls = (imagesData ?? []).map((img) => img.image_url);
      setStore(storeData);
      setProduct(data);
      setGallery(urls.length > 0 ? urls : data.image_url ? [data.image_url] : []);
      setRelated(relatedData ?? []);
      if (settingsData?.currency) setCurrency(settingsData.currency);
      if (themeData) setThemeSettings(themeData as ThemeSettings);
      setLoading(false);
    }
    load();
  }, [params.slug, params.productSlug]);

  function goToImage(index: number) {
    if (!gallery.length) return;
    setSelectedIndex(((index % gallery.length) + gallery.length) % gallery.length);
  }
  function handleTouchStart(event: React.TouchEvent) { touchStartX.current = event.touches[0]?.clientX ?? null; }
  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0]?.clientX - touchStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD) goToImage(delta < 0 ? selectedIndex + 1 : selectedIndex - 1);
    touchStartX.current = null;
  }
  function handleAdd() {
    if (!product || !store || product.stock_quantity <= 0) return;
    addToCart({
      productId: product.id, storeId: product.store_id, storeSlug: store.slug, name: product.name, slug: product.slug,
      price: Number(product.price), quantity, stockQuantity: product.stock_quantity, imageUrl: product.image_url, sku: product.sku,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  if (loading) return <main className="min-h-screen bg-zinc-50 p-6"><div className="mx-auto max-w-5xl animate-pulse"><div className="h-14 rounded-2xl bg-zinc-200" /><div className="mt-6 grid gap-0 overflow-hidden rounded-[2rem] bg-white md:grid-cols-2"><div className="aspect-square bg-zinc-200" /><div className="space-y-4 p-8"><div className="h-6 w-2/3 rounded bg-zinc-200" /><div className="h-4 w-full rounded bg-zinc-200" /><div className="h-10 w-1/3 rounded bg-zinc-200" /></div></div></div></main>;

  if (error || !product || !store) return <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-8"><div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-10 text-center"><h1 className="text-2xl font-bold text-red-600">{error || t.shopPage.productNotFound}</h1><Link href="/" className="mt-4 inline-block text-sm font-medium text-zinc-500">{t.shopPage.home}</Link></div></main>;

  const resolved = resolveTheme(themeSettings?.theme_id, themeSettings?.primary_color, themeSettings?.accent_color, themeSettings?.font);

  return (
    <ThemeProductDetail
      theme={resolved.theme}
      primaryColor={resolved.primaryColor}
      accentColor={resolved.accentColor}
      fontStack={resolved.fontStack}
      store={store}
      product={product}
      gallery={gallery}
      selectedIndex={selectedIndex}
      related={related}
      quantity={quantity}
      added={added}
      currency={currency}
      onSelectImage={goToImage}
      onPrevious={() => goToImage(selectedIndex - 1)}
      onNext={() => goToImage(selectedIndex + 1)}
      onQuantity={setQuantity}
      onAdd={handleAdd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    />
  );
}
