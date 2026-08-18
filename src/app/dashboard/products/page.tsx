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
type SortOption =
  | "newest"
  | "oldest"
  | "priceLow"
  | "priceHigh"
  | "nameAsc"
  | "nameDesc";

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
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");
  const [stockFilter, setStockFilter] =
    useState<StockFilter>("all");
  const [sortOption, setSortOption] =
    useState<SortOption>("newest");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchTerm(searchInput.trim().toLowerCase());
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  async function loadProducts(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

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
      .select(
        "id,name,slug,sku,price,stock_quantity,is_active,image_url,created_at"
      )
      .eq("store_id", membership.store_id)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setProducts(data ?? []);
    }

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
      if (product.is_active) {
        active += 1;
      } else {
        inactive += 1;
      }

      const state = stockState(product);

      if (state === "low") {
        low += 1;
      } else if (state === "out") {
        out += 1;
      }
    }

    return {
      all: products.length,
      active,
      inactive,
      low,
      out,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (statusFilter !== "all") {
      result = result.filter((product) =>
        statusFilter === "active"
          ? product.is_active
          : !product.is_active
      );
    }

    if (stockFilter !== "all") {
      result = result.filter(
        (product) => stockState(product) === stockFilter
      );
    }

    if (searchTerm) {
      result = result.filter((product) => {
        const nameMatch = product.name
          ?.toLowerCase()
          .includes(searchTerm);

        const skuMatch = product.sku
          ?.toLowerCase()
          .includes(searchTerm);

        return nameMatch || skuMatch;
      });
    }

    const sorted = [...result];

    switch (sortOption) {
      case "newest":
        sorted.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
        break;

      case "oldest":
        sorted.sort(
          (a, b) =>
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
        );
        break;

      case "priceLow":
        sorted.sort(
          (a, b) => Number(a.price) - Number(b.price)
        );
        break;

      case "priceHigh":
        sorted.sort(
          (a, b) => Number(b.price) - Number(a.price)
        );
        break;

      case "nameAsc":
        sorted.sort((a, b) =>
          a.name.localeCompare(b.name, "ar")
        );
        break;

      case "nameDesc":
        sorted.sort((a, b) =>
          b.name.localeCompare(a.name, "ar")
        );
        break;
    }

    return sorted;
  }, [
    products,
    statusFilter,
    stockFilter,
    searchTerm,
    sortOption,
  ]);

  function clearFilters() {
    setSearchInput("");
    setSearchTerm("");
    setStatusFilter("all");
    setStockFilter("all");
  }

  const hasActiveFilters =
    searchTerm !== "" ||
    statusFilter !== "all" ||
    stockFilter !== "all";

  return (
    <main className="min-h-screen bg-zinc-50" dir="rtl">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">
              Nexora
            </p>

            <h1 className="mt-1 text-2xl font-bold text-zinc-900">
              المنتجات
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="hidden text-sm font-medium text-zinc-500 sm:inline"
            >
              العودة للوحة التحكم
            </Link>

            <Link
              href="/dashboard/products/new"
              className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text
