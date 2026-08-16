"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { statusLabel } from "@/lib/orderStatus";

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  wilaya: string;
  commune: string | null;
  address: string;
  total: number;
  status: string;
  created_at: string;
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadOrders() {
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
        .from("orders")
        .select("id,customer_name,customer_phone,wilaya,commune,address,total,status,created_at")
        .eq("store_id", membership.store_id)
        .order("created_at", { ascending: false });

      if (error) setMessage(error.message);
      else setOrders(data ?? []);
      setLoading(false);
    }
    loadOrders();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50" dir="rtl">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">Nexora</p>
            <h1 className="mt-1 text-2xl font-bold text-zinc-900">الطلبات</h1>
          </div>
          <Link href="/dashboard" className="text-sm font-medium text-zinc-500">
            العودة للوحة التحكم
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {loading ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center text-zinc-500">جاري تحميل الطلبات...</div>
        ) : message ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-center text-red-700">{message}</div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center">
            <h2 className="text-2xl font-bold text-zinc-900">لا توجد طلبات بعد</h2>
            <p className="mt-2 text-sm text-zinc-500">ستظهر هنا الطلبات فور استلامها من صفحة المتجر.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white">
            <table className="w-full text-right text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50 text-zinc-500">
                <tr>
                  <th className="px-5 py-3 font-medium">رقم الطلب</th>
                  <th className="px-5 py-3 font-medium">العميل</th>
                  <th className="px-5 py-3 font-medium">الهاتف</th>
                  <th className="px-5 py-3 font-medium">الولاية / البلدية</th>
                  <th className="px-5 py-3 font-medium">الإجمالي</th>
                  <th className="px-5 py-3 font-medium">الحالة</th>
                  <th className="px-5 py-3 font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") router.push(`/dashboard/orders/${order.id}`);
                    }}
                    className="cursor-pointer border-b border-zinc-50 transition hover:bg-zinc-50 last:border-0"
                  >
                    <td className="px-5 py-4 font-semibold text-zinc-900">#{order.id.slice(0, 8)}</td>
                    <td className="px-5 py-4">{order.customer_name}</td>
                    <td className="px-5 py-4 text-zinc-500">{order.customer_phone}</td>
                    <td className="px-5 py-4 text-zinc-500">{order.wilaya}{order.commune ? ` / ${order.commune}` : ""}</td>
                    <td className="px-5 py-4 font-semibold text-zinc-900">{Number(order.total).toLocaleString("fr-DZ")} DZD</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                        {statusLabel[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-500">
                      {new Date(order.created_at).toLocaleDateString("fr-DZ", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
