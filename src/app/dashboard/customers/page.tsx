"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Order = { id: string; customer_name: string; customer_phone: string; customer_email: string | null; wilaya: string; total: number; status: string; created_at: string };
type Customer = { key: string; name: string; phone: string; email: string | null; wilaya: string; orders: number; spent: number; lastOrder: string };

export default function CustomersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) { setMessage("يجب تسجيل الدخول أولًا."); setLoading(false); return; }
      const { data: membership } = await supabase.from("store_members").select("store_id").eq("user_id", userData.user.id).eq("role", "owner").limit(1).maybeSingle();
      if (!membership) { setMessage("لم يتم العثور على متجرك."); setLoading(false); return; }
      const { data, error } = await supabase.from("orders").select("id,customer_name,customer_phone,customer_email,wilaya,total,status,created_at").eq("store_id", membership.store_id).order("created_at", { ascending: false });
      if (error) setMessage(error.message); else setOrders(data ?? []);
      setLoading(false);
    }
    void load();
  }, []);

  const customers = useMemo<Customer[]>(() => {
    const map = new Map<string, Customer>();
    for (const order of orders) {
      const key = order.customer_phone.trim() || `${order.customer_name.trim().toLowerCase()}|${order.wilaya.trim().toLowerCase()}`;
      const current = map.get(key);
      if (current) { current.orders += 1; if (order.status !== "cancelled") current.spent += Number(order.total || 0); if (new Date(order.created_at) > new Date(current.lastOrder)) current.lastOrder = order.created_at; }
      else map.set(key, { key, name: order.customer_name, phone: order.customer_phone, email: order.customer_email, wilaya: order.wilaya, orders: 1, spent: order.status === "cancelled" ? 0 : Number(order.total || 0), lastOrder: order.created_at });
    }
    return Array.from(map.values()).filter((customer) => `${customer.name} ${customer.phone} ${customer.email ?? ""}`.toLowerCase().includes(search.trim().toLowerCase()));
  }, [orders, search]);

  return <main className="min-h-screen bg-zinc-50"><header className="border-b border-zinc-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6"><div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">Nexora · Phase 3</p><h1 className="mt-1 text-2xl font-bold">العملاء</h1></div><Link href="/dashboard" className="text-sm text-zinc-500">العودة للوحة التحكم</Link></div></header><div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{message && <div className="mb-5 rounded-2xl bg-red-50 p-4 text-red-700">{message}</div>}<div className="mb-5 flex items-center justify-between gap-3"><p className="text-sm text-zinc-500">{loading ? "..." : `${customers.length} عميل`}</p><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث بالاسم أو الهاتف..." className="w-full max-w-sm rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-zinc-900" /></div><div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-right text-sm"><thead className="border-b bg-zinc-50 text-zinc-500"><tr><th className="px-5 py-4">العميل</th><th className="px-5 py-4">الهاتف</th><th className="px-5 py-4">الولاية</th><th className="px-5 py-4">الطلبات</th><th className="px-5 py-4">الإنفاق</th><th className="px-5 py-4">آخر طلب</th></tr></thead><tbody>{customers.map((customer) => <tr key={customer.key} className="border-b last:border-0"><td className="px-5 py-4"><p className="font-semibold">{customer.name}</p>{customer.email && <p className="text-xs text-zinc-400">{customer.email}</p>}</td><td className="px-5 py-4">{customer.phone}</td><td className="px-5 py-4">{customer.wilaya}</td><td className="px-5 py-4">{customer.orders}</td><td className="px-5 py-4 font-semibold">{Math.round(customer.spent).toLocaleString("fr-DZ")} DZD</td><td className="px-5 py-4 text-zinc-500">{new Date(customer.lastOrder).toLocaleDateString("fr-DZ")}</td></tr>)}{!loading && customers.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-zinc-500">لا يوجد عملاء مطابقون.</td></tr>}</tbody></table></div></div></div></main>;
}
