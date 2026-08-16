"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProducts() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        setMessage("يجب تسجيل الدخول أولًا.");
        setLoading(false);
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
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("id,name,slug,price,stock_quantity,is_active")
        .eq("store_id", membership.store_id)
        .order("created_at", { ascending: false });

      if (error) setMessage(error.message);
      else setProducts(data ?? []);

      setLoading(false);
    }

    loadProducts();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50" dir="rtl">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">Nexora</p>
            <h1 className="mt-1 text-2xl font-bold text-zinc-900">المنتجات</h1>
          </div>
          <Link href="/dashboard/products/new"
            className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white">
            + إضافة منتج
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {loading ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center text-zinc-500">
            جاري تحميل المنتجات...
          </div>
        ) : message ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-center text-red-700">{message}</div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center">
            <h2 className="text-2xl font-bold text-zinc-900">لا توجد منتجات بعد</h2>
            <p className="mt-2 text-sm text-zinc-500">أول منتج لمتجرك يبدأ من هنا.</p>
            <Link href="/dashboard/products/new"
              className="mt-6 inline-flex rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white">
              إضافة أول منتج
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white">
            <div className="grid grid-cols-[1fr_120px_100px_90px] gap-4 border-b border-zinc-200 px-5 py-4 text-sm font-semibold text-zinc-500">
              <span>المنتج</span><span>السعر</span><span>المخزون</span><span>الحالة</span>
            </div>
            {products.map((product) => (
              <div key={product.id} className="grid grid-cols-[1fr_120px_100px_90px] gap-4 border-b border-zinc-100 px-5 py-5 last:border-0">
                <div>
                  <p className="font-semibold text-zinc-900">{product.name}</p>
                  <p className="mt-1 text-xs text-zinc-400">{product.slug}</p>
                </div>
                <span className="font-medium text-zinc-800">{Number(product.price).toLocaleString("fr-DZ")} DZD</span>
                <span className="text-zinc-700">{product.stock_quantity}</span>
                <span className={product.is_active ? "text-emerald-600" : "text-zinc-400"}>
                  {product.is_active ? "نشط" : "متوقف"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}