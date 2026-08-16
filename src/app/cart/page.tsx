"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCart, removeFromCart, updateCartQuantity, type CartItem } from "@/lib/cart";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const refresh = () => setItems(getCart());
    refresh();
    window.addEventListener("nexora-cart-updated", refresh);
    return () => window.removeEventListener("nexora-cart-updated", refresh);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className="min-h-screen bg-zinc-50 py-8" dir="rtl">
      <div className="mx-auto max-w-4xl px-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-zinc-400">NEXORA</p>
            <h1 className="mt-2 text-3xl font-bold">سلة المشتريات 🛒</h1>
          </div>
          <Link href="/" className="text-sm text-zinc-500">الرئيسية</Link>
        </div>

        {items.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-12 text-center">
            <h2 className="text-2xl font-bold">السلة فارغة</h2>
            <p className="mt-2 text-zinc-500">أضيفي منتجًا أولًا من المتجر.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              {items.map((item) => (
                <article key={item.productId} className="flex gap-4 rounded-3xl border border-zinc-200 bg-white p-4">
                  <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
                    {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold">{item.name}</h2>
                    <p className="mt-1 text-sm text-zinc-500">{item.price.toLocaleString("fr-DZ")} DZD</p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center overflow-hidden rounded-xl border border-zinc-300">
                        <button className="px-3 py-2" onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}>−</button>
                        <span className="min-w-10 text-center">{item.quantity}</span>
                        <button className="px-3 py-2" onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}>+</button>
                      </div>
                      <button className="text-sm text-red-500" onClick={() => removeFromCart(item.productId)}>حذف</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="h-fit rounded-3xl border border-zinc-200 bg-white p-6">
              <h2 className="text-xl font-bold">ملخص الطلب</h2>
              <div className="mt-5 flex justify-between border-t border-zinc-100 pt-5">
                <span className="text-zinc-500">المجموع الفرعي</span>
                <strong>{subtotal.toLocaleString("fr-DZ")} DZD</strong>
              </div>
              <p className="mt-2 text-xs text-zinc-400">التوصيل يحسب في صفحة الطلب.</p>
              <Link
                href={items.length ? "/checkout" : "#"}
                className="mt-6 block rounded-xl bg-zinc-900 px-4 py-3 text-center font-semibold text-white"
              >
                متابعة الطلب
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}