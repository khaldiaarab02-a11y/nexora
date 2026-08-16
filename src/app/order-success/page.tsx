"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const params = useSearchParams();
  const order = params.get("order");
  const store = params.get("store");

  return (
    <div className="w-full max-w-lg rounded-[2rem] border border-zinc-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl">✓</div>
      <p className="mt-6 text-sm font-semibold tracking-[0.2em] text-zinc-400">NEXORA</p>
      <h1 className="mt-3 text-3xl font-bold">تم استلام طلبك ❤️</h1>
      <p className="mt-3 leading-7 text-zinc-500">
        شكرًا لك. تم تسجيل الطلب وسيتم التواصل معك لتأكيده.
      </p>

      {order && (
        <div className="mt-6 rounded-2xl bg-zinc-50 p-5">
          <p className="text-sm text-zinc-500">رقم الطلب</p>
          <p className="mt-1 text-2xl font-bold">#{order}</p>
        </div>
      )}

      {store && (
        <Link href={`/shop/${store}`} className="mt-6 block rounded-xl bg-zinc-900 px-4 py-3 font-semibold text-white">
          العودة إلى المتجر
        </Link>
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