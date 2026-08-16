"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type StoreSummary = {
  name: string;
  slug: string;
  productsCount: number;
  ordersCount: number;
  revenue: number;
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<StoreSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSummary() {
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

      const [{ data: store }, { count: productsCount }, { data: orders, count: ordersCount }] = await Promise.all([
        supabase.from("stores").select("name,slug").eq("id", membership.store_id).maybeSingle(),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("store_id", membership.store_id),
        supabase.from("orders").select("total", { count: "exact" }).eq("store_id", membership.store_id),
      ]);

      const revenue = (orders ?? []).reduce((sum, order) => sum + Number(order.total || 0), 0);

      setSummary({
        name: store?.name || "",
        slug: store?.slug || "",
        productsCount: productsCount ?? 0,
        ordersCount: ordersCount ?? 0,
        revenue,
      });
      setLoading(false);
    }
    loadSummary();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50" dir="rtl">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">Nexora</p>
            <h1 className="mt-1 text-2xl font-bold text-zinc-900">لوحة التحكم</h1>
          </div>
          <Link href="/dashboard/store/new" className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white">
            + متجر جديد
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <section className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">المتجر الحالي</p>
          {loading ? (
            <p className="mt-2 text-sm text-zinc-400">جاري التحميل...</p>
          ) : message ? (
            <p className="mt-2 text-sm text-red-600">{message}</p>
          ) : (
            <>
              <h2 className="mt-2 text-3xl font-bold text-zinc-900">{summary?.name}</h2>
              <p className="mt-1 text-sm text-zinc-500">{summary?.slug}</p>
            </>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardCard title="المنتجات" value={String(summary?.productsCount ?? 0)} href="/dashboard/products" />
            <DashboardCard title="الطلبات" value={String(summary?.ordersCount ?? 0)} href="/dashboard/orders" />
            <DashboardCard title="العملاء" value="0" href="#" />
            <DashboardCard title="الإيرادات" value={`${(summary?.revenue ?? 0).toLocaleString("fr-DZ")} DZD`} href="#" />
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-zinc-200 bg-white p-7">
            <h3 className="text-lg font-bold text-zinc-900">المنتجات</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-500">ابدأ بإضافة أول منتج إلى متجرك.</p>
            <Link href="/dashboard/products/new"
              className="mt-5 inline-flex rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white">
              إضافة منتج
            </Link>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-7">
            <h3 className="text-lg font-bold text-zinc-900">حالة المتجر</h3>
            <div className="mt-4 flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-zinc-700">المتجر نشط</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function DashboardCard({ title, value, href }: { title: string; value: string; href: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-zinc-200 p-5 transition hover:border-zinc-400">
      <p className="text-sm text-zinc-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-zinc-900">{value}</p>
    </Link>
  );
}