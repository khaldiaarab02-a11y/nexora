"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type OrderSummary = {
  orderId: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;
  items: { name: string; quantity: number; price: number }[];
};

function SuccessContent() {
  const params = useSearchParams();
  const order = params.get("order");
  const store = params.get("store");
  const [summary, setSummary] = useState<OrderSummary | null>(null);

  useEffect(() => {
    if (!order) return;
    try {
      const raw = sessionStorage.getItem("nexora-last-order");
      if (!raw) return;
      const parsed = JSON.parse(raw) as OrderSummary;
      // Only trust this if it matches the order id in the URL - protects
      // against showing stale data from a previous order (e.g. back button,
      // bookmarked link visited later).
      if (parsed.orderId === order) {
        setSummary(parsed);
        sessionStorage.removeItem("nexora-last-order");
      }
    } catch {
      // Malformed/unavailable sessionStorage just means no rich summary -
      // the page still works with the order id alone.
    }
  }, [order]);

  return (
    <div className="w-full max-w-lg rounded-[2rem] border border-zinc-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl">✓</div>
      <p className="mt-6 text-sm font-semibold tracking-[0.2em] text-zinc-400">NEXORA</p>
      <h1 className="mt-3 text-3xl font-bold">تم استلام طلبك ❤️</h1>
      <p className="mt-3 leading-7 text-zinc-500">
        شكرًا لك. تم تسجيل الطلب وسيتم التواصل معك لتأكيده.
      </p>

      {order && (
        <div className="mt-6 rounded-2xl bg-zinc-50 p-5 text-right">
          <p className="text-center text-sm text-zinc-500">رقم الطلب</p>
          <p className="text-center text-2xl font-bold">#{order.slice(0, 8)}</p>

          {summary && (
            <>
              <div className="mt-5 space-y-2 border-t border-zinc-200 pt-4 text-sm">
                {summary.items.map((item, i) => (
                  <div key={i} className="flex justify-between gap-3">
                    <span className="text-zinc-600">{item.name} × {item.quantity}</span>
                    <span className="font-medium">{(item.price * item.quantity).toLocaleString("fr-DZ")} {summary.currency}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 border-t border-zinc-200 pt-4 text-sm">
                <div className="flex justify-between"><span>المجموع الفرعي</span><span>{summary.subtotal.toLocaleString("fr-DZ")} {summary.currency}</span></div>
                <div className="flex justify-between">
                  <span>التوصيل</span>
                  <span>{summary.shippingFee === 0 ? "مجاني" : `${summary.shippingFee.toLocaleString("fr-DZ")} ${summary.currency}`}</span>
                </div>
                <div className="flex justify-between text-base font-bold"><span>الإجمالي</span><span>{summary.total.toLocaleString("fr-DZ")} {summary.currency}</span></div>
              </div>
            </>
          )}
        </div>
      )}

      {store && (
        <div className="mt-6 space-y-3">
          <Link href={`/shop/${store}`} className="block rounded-xl bg-zinc-900 px-4 py-3 font-semibold text-white">
            العودة إلى المتجر
          </Link>
          <Link href={`/shop/${store}`} className="block rounded-xl border border-zinc-300 px-4 py-3 font-medium text-zinc-700">
            متابعة التسوق
          </Link>
        </div>
      )}
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6" dir="rtl">
      <Suspense fallback={
        <div className="w-full max-w-lg rounded-[2rem] border border-zinc-200 bg-white p-8 text-center text-zinc-500">
          جاري تحميل تفاصيل الطلب...
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
