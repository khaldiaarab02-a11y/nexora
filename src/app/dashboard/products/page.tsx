"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
};

type StatusFilter = "all" | "active" | "inactive";
type StockFilter = "all" | "available" | "low" | "out";
type SortOption = "newest" | "oldest" | "priceLow" | "priceHigh" | "nameAsc" | "nameDesc";

// Kept in sync with the LOW_STOCK_THRESHOLD used on the dashboard home page
// (src/app/dashboard/page.tsx) so "low stock" means the same thing everywhere.
const LOW_STOCK_THRESHOLD = 5;

const sortLabel: Record<SortOption, string> = {
  newest: "الأحدث",
  oldest: "الأقدم",
  priceLow: "السعر الأقل",
  priceHigh: "السعر الأعلى",
  nameAsc: "الاسم A-Z",
  nameDesc: "الاسم Z-A",
};

function stockState(product: Product): "out" | "low" | "available" {
  if (product.stock_quantity <= 0) return "out";
  if (product.stock_quantity <= LOW_STOCK_THRESHOLD) return "low";
  return "available";
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  // Debounce the search input so filtering doesn't run on every keystroke.
  // Filtering itself runs entirely against the already-loaded products
  // list (client-side), so there is never a new query per character typed.
  useEffect(() => {
    const timeout = setTimeout(() => setSearchTerm(searchInput.trim().toLowerCase()), 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  async function loadProducts(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setMessage("");

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setMessage("يجب تسجيل الدخول أولًا.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const { data: membership } = await supabase
      .from("store_members")
      .select("store_id")
      .eq("user_id", userData.user.id)
      .eq("role", "owner")
      .limit(1)
      .maybeSingle();

    if (!membership) {
      setMessage("لم يتم العثور على متجر مرتبط بهذا الحساب.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .select("id,name,slug,sku,price,stock_quantity,is_active,image_url,created_at")
      .eq("store_id", membership.store_id)
      .order("created_at", { ascending: false });

    if (error) setMessage(error.message);
    else setProducts(data ?? []);

    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const stats = useMemo(() => {
    let active = 0;
    let inactive = 0;
    let low = 0;
    let out = 0;

    for (const product of products) {
      if (product.is_active) active += 1;
      else inactive += 1;

      const state = stockState(product);
      if (state === "low") low += 1;
      else if (state === "out") out += 1;
    }

    return { all: products.length, active, inactive, low, out };
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (statusFilter !== "all") {
      result = result.filter((product) => (statusFilter === "active" ? product.is_active : !product.is_active));
    }

    if (stockFilter !== "all") {
      result = result.filter((product) => stockState(product) === stockFilter);
    }

    if (searchTerm) {
      result = result.filter((product) => {
        const nameMatch = product.name?.toLowerCase().includes(searchTerm);
        const skuMatch = product.sku?.toLowerCase().includes(searchTerm);
        return nameMatch || skuMatch;
      });
    }

    const sorted = [...result];
    switch (sortOption) {
      case "newest":
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
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
      case "nameDesc":
        sorted.sort((a, b) => b.name.localeCompare(a.name, "ar"));
        break;
    }
    return sorted;
  }, [products, statusFilter, stockFilter, searchTerm, sortOption]);

  function clearFilters() {
    setSearchInput("");
    setSearchTerm("");
    setStatusFilter("all");
    setStockFilter("all");
  }

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || stockFilter !== "all";

  return (
    <main className="min-h-screen bg-zinc-50" dir="rtl">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">Nexora</p>
            <h1 className="mt-1 text-2xl font-bold text-zinc-900">المنتجات</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hidden text-sm font-medium text-zinc-500 sm:inline">
              العودة للوحة التحكم
            </Link>
            <Link href="/dashboard/products/new" className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white">
              + إضافة منتج
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl border border-zinc-200 bg-white" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard
              title="إجمالي المنتجات"
              value={stats.all}
              active={statusFilter === "all" && stockFilter === "all"}
              onClick={() => {
                setStatusFilter("all");
                setStockFilter("all");
              }}
            />
            <StatCard title="نشطة" value={stats.active} active={statusFilter === "active"} onClick={() => setStatusFilter("active")} />
            <StatCard title="غير نشطة" value={stats.inactive} active={statusFilter === "inactive"} onClick={() => setStatusFilter("inactive")} />
            <StatCard title="مخزون منخفض" value={stats.low} active={stockFilter === "low"} onClick={() => setStockFilter("low")} tone="warning" />
            <StatCard title="نافدة" value={stats.out} active={stockFilter === "out"} onClick={() => setStockFilter("out")} tone="danger" />
          </div>
        )}

        {/* Toolbar */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="ابحث باسم المنتج أو SKU..."
            className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-zinc-900 sm:flex-1"
          />
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-900"
            >
              <option value="all">كل الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as StockFilter)}
              className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-900"
            >
              <option value="all">كل المخزون</option>
              <option value="available">متوفر</option>
              <option value="low">مخزون منخفض</option>
              <option value="out">نفد</option>
            </select>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-900"
            >
              {(Object.keys(sortLabel) as SortOption[]).map((option) => (
                <option key={option} value={option}>
                  {sortLabel[option]}
                </option>
              ))}
            </select>
            <button
              onClick={() => loadProducts(true)}
              disabled={refreshing || loading}
              className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 disabled:opacity-50"
            >
              {refreshing ? "..." : "تحديث"}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="mt-6">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-3xl border border-zinc-200 bg-white" />
              ))}
            </div>
          ) : message ? (
            <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-center text-red-700">{message}</div>
          ) : products.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center">
              <h2 className="text-2xl font-bold text-zinc-900">لا توجد منتجات بعد</h2>
              <p className="mt-2 text-sm text-zinc-500">أول منتج لمتجرك يبدأ من هنا.</p>
              <Link href="/dashboard/products/new" className="mt-6 inline-flex rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white">
                إضافة أول منتج
              </Link>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center">
              <h2 className="text-xl font-bold text-zinc-900">لم نجد أي منتج مطابق</h2>
              <p className="mt-2 text-sm text-zinc-500">جرّبي تعديل كلمة البحث أو الفلاتر.</p>
              <button
                onClick={clearFilters}
                className="mt-5 inline-flex rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white"
              >
                مسح الفلاتر
              </button>
            </div>
          ) : (
            <>
              {hasActiveFilters && (
                <p className="mb-3 text-xs text-zinc-400">
                  {filteredProducts.length} من {products.length} منتج
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => {
                  const state = stockState(product);
                  return (
                    <Link
                      key={product.id}
                      href={`/dashboard/products/${product.id}/edit`}
                      className="block overflow-hidden rounded-3xl border border-zinc-200 bg-white transition hover:border-zinc-400"
                    >
                      <div className="aspect-[4/3] bg-zinc-100">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-zinc-400">لا توجد صورة</div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="truncate font-bold text-zinc-900">{product.name}</h2>
                            <p className="mt-1 truncate text-xs text-zinc-400">{product.sku ? `SKU: ${product.sku}` : product.slug}</p>
                          </div>
                          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${product.is_active ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                            {product.is_active ? "نشط" : "غير نشط"}
                          </span>
                        </div>
                        <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
                          <span className="font-bold text-zinc-900">{Number(product.price).toLocaleString("fr-DZ")} DZD</span>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              state === "out"
                                ? "bg-red-50 text-red-700"
                                : state === "low"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-zinc-100 text-zinc-600"
                            }`}
                          >
                            {state === "out" ? "نفد المخزون" : `المخزون: ${product.stock_quantity}`}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  active,
  onClick,
  tone = "default",
}: {
  title: string;
  value: number;
  active: boolean;
  onClick: () => void;
  tone?: "default" | "warning" | "danger";
}) {
  const toneText = active ? "text-white" : tone === "warning" ? "text-amber-600" : tone === "danger" ? "text-red-600" : "text-zinc-900";
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-4 text-right transition ${
        active ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white hover:border-zinc-400"
      }`}
    >
      <p className={`text-xs ${active ? "text-zinc-300" : "text-zinc-500"}`}>{title}</p>
      <p className={`mt-1 text-xl font-bold ${toneText}`}>{value}</p>
    </button>
  );
}
