"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { orderStatuses, statusLabel, type OrderStatus } from "@/lib/orderStatus";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/i18n/LanguageProvider";

type OrderDetail = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  wilaya: string;
  commune: string | null;
  address: string;
  notes: string | null;
  subtotal: number;
  shipping_fee: number;
  total: number;
  status: string;
  created_at: string;
};

type OrderItem = {
  product_id: string;
  product_name: string;
  product_sku: string | null;
  unit_price: number;
  quantity: number;
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;
  const toast = useToast();
  const { t } = useI18n();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [productImages, setProductImages] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [status, setStatus] = useState<string>("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusError, setStatusError] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setMessage("رقم الطلب غير صالح.");
        setLoading(false);
        return;
      }

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

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(
          "id,customer_name,customer_phone,customer_email,wilaya,commune,address,notes,subtotal,shipping_fee,total,status,created_at"
        )
        .eq("id", orderId)
        .eq("store_id", membership.store_id)
        .maybeSingle();

      if (orderError) {
        setMessage(orderError.message);
        setLoading(false);
        return;
      }

      if (!orderData) {
        setMessage("الطلب غير موجود أو لا تملك صلاحية الوصول إليه.");
        setLoading(false);
        return;
      }

      setOrder(orderData);
      setStatus(orderData.status);

      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("product_id,product_name,product_sku,unit_price,quantity")
        .eq("order_id", orderId);

      if (itemsError) {
        setMessage(itemsError.message);
        setLoading(false);
        return;
      }

      setItems(itemsData ?? []);

      const productIds = (itemsData ?? []).map((item) => item.product_id).filter(Boolean);
      if (productIds.length) {
        const { data: products } = await supabase
          .from("products")
          .select("id,image_url")
          .in("id", productIds);

        const imageMap: Record<string, string | null> = {};
        (products ?? []).forEach((product) => {
          imageMap[product.id] = product.image_url;
        });
        setProductImages(imageMap);
      }

      setLoading(false);
    }
    loadOrder();
  }, [orderId]);

  async function handleStatusSave() {
    if (!order || status === order.status || savingStatus) return;
    setSavingStatus(true);
    setStatusMessage("");
    setStatusError(false);

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (sessionError || !token) {
      setStatusError(true);
      setStatusMessage(t.feedback.sessionExpired);
      toast.error(t.feedback.sessionExpired);
      setSavingStatus(false);
      return;
    }

    const response = await fetch(`/api/orders/${order.id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.error || t.feedback.orderStatusUpdateError;
      setStatusError(true);
      setStatusMessage(errMsg);
      toast.error(errMsg);
      setSavingStatus(false);
      return;
    }

    setOrder({ ...order, status: data.status });
    setStatus(data.status);
    setStatusError(false);
    setStatusMessage(t.feedback.orderStatusUpdateSuccess);
    toast.success(t.feedback.orderStatusUpdateSuccess);
    setSavingStatus(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50 p-8 text-center text-zinc-500">
        جاري تحميل تفاصيل الطلب...
      </main>
    );
  }

  if (message || !order) {
    return (
      <main className="min-h-screen bg-zinc-50 p-8">
        <div className="mx-auto max-w-2xl rounded-3xl border border-red-100 bg-red-50 p-6 text-center text-red-700">
          {message || "تعذر تحميل الطلب."}
        </div>
        <div className="mx-auto mt-6 max-w-2xl text-center">
          <Link href="/dashboard/orders" className="text-sm font-medium text-zinc-500">
            العودة إلى الطلبات
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">Nexora</p>
            <h1 className="mt-1 text-2xl font-bold text-zinc-900">طلب #{order.id.slice(0, 8)}</h1>
          </div>
          <Link href="/dashboard/orders" className="text-sm font-medium text-zinc-500">
            العودة إلى الطلبات
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-bold text-zinc-900">معلومات العميل</h2>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <Detail label="اسم العميل" value={order.customer_name} />
                <Detail label="الهاتف" value={order.customer_phone} />
                {order.customer_email && <Detail label="البريد الإلكتروني" value={order.customer_email} />}
                <Detail label="الولاية" value={order.wilaya} />
                {order.commune && <Detail label="البلدية" value={order.commune} />}
                <div className="sm:col-span-2">
                  <Detail label="العنوان" value={order.address} />
                </div>
                {order.notes && (
                  <div className="sm:col-span-2">
                    <Detail label="ملاحظات" value={order.notes} />
                  </div>
                )}
                <Detail
                  label="تاريخ الطلب"
                  value={new Date(order.created_at).toLocaleDateString("fr-DZ", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
              </dl>
            </section>

            <section className="rounded-3xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-bold text-zinc-900">المنتجات المطلوبة</h2>
              <div className="mt-5 space-y-4">
                {items.map((item) => (
                  <div key={item.product_id} className="flex items-center gap-4 border-b border-zinc-50 pb-4 last:border-0 last:pb-0">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                      {productImages[item.product_id] ? (
                        <img
                          src={productImages[item.product_id] as string}
                          alt={item.product_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-zinc-400">لا توجد صورة</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-zinc-900">{item.product_name}</p>
                      {item.product_sku && <p className="text-xs text-zinc-400">{item.product_sku}</p>}
                      <p className="mt-1 text-sm text-zinc-500">
                        {Number(item.unit_price).toLocaleString("fr-DZ")} DZD × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-zinc-900">
                      {(Number(item.unit_price) * item.quantity).toLocaleString("fr-DZ")} DZD
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="h-fit space-y-6">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-bold text-zinc-900">حالة الطلب</h2>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-4 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
              >
                {orderStatuses.map((s: OrderStatus) => (
                  <option key={s} value={s}>
                    {statusLabel[s]}
                  </option>
                ))}
              </select>
              <button
                onClick={handleStatusSave}
                disabled={savingStatus || status === order.status}
                className="mt-4 w-full rounded-xl bg-zinc-900 px-4 py-3 font-semibold text-white disabled:opacity-50"
              >
                {savingStatus ? "جاري الحفظ..." : "حفظ الحالة"}
              </button>
              {statusMessage && (
                <p className={`mt-3 rounded-xl p-3 text-sm ${statusError ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                  {statusMessage}
                </p>
              )}
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-bold text-zinc-900">ملخص الطلب</h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between"><span>المجموع الفرعي</span><strong>{Number(order.subtotal).toLocaleString("fr-DZ")} DZD</strong></div>
                <div className="flex justify-between"><span>التوصيل</span><strong>{Number(order.shipping_fee).toLocaleString("fr-DZ")} DZD</strong></div>
                <div className="flex justify-between border-t border-zinc-100 pt-3 text-lg"><span>الإجمالي</span><strong>{Number(order.total).toLocaleString("fr-DZ")} DZD</strong></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-zinc-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-zinc-900">{value}</dd>
    </div>
  );
}
