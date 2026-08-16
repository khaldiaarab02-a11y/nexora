"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCart, clearCart, type CartItem } from "@/lib/cart";

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", email: "", wilaya: "", commune: "", address: "", notes: "" });
  const [shipping, setShipping] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cart = getCart();
    setItems(cart);
    if (cart.length) {
      fetch(`/api/store-settings?storeId=${cart[0].storeId}`)
        .then((r) => r.json())
        .then((data) => setShipping(Number(data.defaultShippingFee || 0)))
        .catch(() => {});
    }
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + shipping;

  async function submitOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!items.length) return;
    setSubmitting(true);
    setError("");

    const storeId = items[0].storeId;
    const storeSlug = items[0].storeSlug;

    if (items.some((item) => item.storeId !== storeId)) {
      setError("السلة تحتوي منتجات من متاجر مختلفة. أفرغي السلة وابدئي من متجر واحد.");
      setSubmitting(false);
      return;
    }

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId,
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email,
        wilaya: form.wilaya,
        commune: form.commune,
        address: form.address,
        notes: form.notes,
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "تعذر إنشاء الطلب.");
      setSubmitting(false);
      return;
    }

    clearCart();
    window.location.href = `/order-success?order=${encodeURIComponent(data.orderId)}&store=${encodeURIComponent(storeSlug)}`;
  }

  if (!items.length) {
    return <main className="min-h-screen bg-zinc-50 p-8 text-center" dir="rtl"><h1 className="text-2xl font-bold">السلة فارغة</h1><Link href="/" className="mt-4 inline-block text-zinc-500">العودة</Link></main>;
  }

  return (
    <main className="min-h-screen bg-zinc-50 py-8" dir="rtl">
      <div className="mx-auto max-w-4xl px-5">
        <p className="text-xs font-semibold tracking-[0.25em] text-zinc-400">NEXORA</p>
        <h1 className="mt-2 text-3xl font-bold">إتمام الطلب</h1>

        <form onSubmit={submitOrder} className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6">
            <h2 className="text-xl font-bold">معلومات التوصيل</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="الاسم الكامل" required><input required className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="رقم الهاتف" required><input required type="tel" className={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
              <Field label="البريد الإلكتروني"><input type="email" className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
              <Field label="الولاية" required><input required className={input} value={form.wilaya} onChange={(e) => setForm({ ...form, wilaya: e.target.value })} /></Field>
              <Field label="البلدية"><input className={input} value={form.commune} onChange={(e) => setForm({ ...form, commune: e.target.value })} /></Field>
              <Field label="العنوان" required><input required className={input} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
              <div className="sm:col-span-2"><Field label="ملاحظات"><textarea className={`${input} min-h-24`} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field></div>
            </div>
            {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          </div>

          <aside className="h-fit rounded-3xl border border-zinc-200 bg-white p-6">
            <h2 className="text-xl font-bold">ملخص الطلب</h2>
            <div className="mt-5 space-y-3 text-sm">
              {items.map((item) => <div key={item.productId} className="flex justify-between gap-3"><span>{item.name} × {item.quantity}</span><span>{(item.price * item.quantity).toLocaleString("fr-DZ")} DZD</span></div>)}
            </div>
            <div className="mt-5 space-y-3 border-t border-zinc-100 pt-5">
              <div className="flex justify-between"><span>المجموع الفرعي</span><strong>{subtotal.toLocaleString("fr-DZ")} DZD</strong></div>
              <div className="flex justify-between"><span>التوصيل</span><strong>{shipping.toLocaleString("fr-DZ")} DZD</strong></div>
              <div className="flex justify-between text-lg"><span>الإجمالي</span><strong>{total.toLocaleString("fr-DZ")} DZD</strong></div>
            </div>
            <button disabled={submitting} className="mt-6 w-full rounded-xl bg-zinc-900 px-4 py-3 font-semibold text-white disabled:opacity-50">{submitting ? "جاري إرسال الطلب..." : "تأكيد الطلب"}</button>
          </aside>
        </form>
      </div>
    </main>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <div><label className="mb-2 block text-sm font-medium text-zinc-700">{label}{required ? " *" : ""}</label>{children}</div>;
}
const input = "w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900";