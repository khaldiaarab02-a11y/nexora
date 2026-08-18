"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  getCart,
  removeFromCart,
  syncCartItem,
  updateCartQuantity,
  type CartItem,
} from "@/lib/cart";

type ProductRow = {
  id: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  store_id: string;
};

type ItemIssue = "removed_missing" | "removed_inactive" | "stock_reduced" | "price_changed";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [currency, setCurrency] = useState("DZD");
  const [checking, setChecking] = useState(true);
  const [issues, setIssues] = useState<ItemIssue[]>([]);
  const [outOfStockIds, setOutOfStockIds] = useState<string[]>([]);

  async function validateCart() {
    const localItems = getCart();

    if (localItems.length === 0) {
      setItems([]);
      setChecking(false);
      return;
    }

    setChecking(true);
    const foundIssues: ItemIssue[] = [];

    const { data: products, error } = await supabase
      .from("products")
      .select("id,price,stock_quantity,is_active,store_id")
      .in(
        "id",
        localItems.map((i) => i.productId)
      );

    if (error) {
      // Network/DB hiccup - fall back to showing the local cart as-is rather
      // than blocking the page; the order API will re-validate everything
      // for real at checkout time regardless.
      setItems(localItems);
      setChecking(false);
      return;
    }

    const productMap = new Map((products ?? []).map((p: ProductRow) => [p.id, p]));
    const outOfStock: string[] = [];

    for (const item of localItems) {
      const product = productMap.get(item.productId);

      if (!product) {
        removeFromCart(item.productId);
        foundIssues.push("removed_missing");
        continue;
      }

      if (!product.is_active) {
        removeFromCart(item.productId);
        foundIssues.push("removed_inactive");
        continue;
      }

      const currentPrice = Number(product.price);
      const currentStock = product.stock_quantity;

      if (currentPrice !== item.price || currentStock !== item.stockQuantity) {
        syncCartItem(item.productId, { price: currentPrice, stockQuantity: currentStock });
        if (currentPrice !== item.price) foundIssues.push("price_changed");
        if (currentStock < item.stockQuantity || currentStock < item.quantity) {
          foundIssues.push("stock_reduced");
        }
      }

      if (currentStock <= 0) outOfStock.push(item.productId);
    }

    setIssues(foundIssues);
    setOutOfStockIds(outOfStock);
    setItems(getCart());
    setChecking(false);
  }

  useEffect(() => {
    validateCart();
    const refresh = () => setItems(getCart());
    window.addEventListener("nexora-cart-updated", refresh);
    return () => window.removeEventListener("nexora-cart-updated", refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!items.length) return;
    fetch(`/api/store-settings?storeId=${items[0].storeId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.currency) setCurrency(data.currency);
      })
      .catch(() => {});
  }, [items.length ? items[0].storeId : null]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const continueShoppingHref = items[0]?.storeSlug ? `/shop/${items[0].storeSlug}` : "/";
  const hasBlockingIssue = items.some((item) => outOfStockIds.includes(item.productId));

  const issueMessage = (() => {
    if (issues.length === 0) return null;
    const parts: string[] = [];
    if (issues.includes("removed_missing") || issues.includes("removed_inactive")) {
      parts.push("تم حذف منتج أو أكثر من سلتك لأنه لم يعد متاحًا.");
    }
    if (issues.includes("price_changed")) {
      parts.push("تم تحديث سعر بعض المنتجات.");
    }
    if (issues.includes("stock_reduced")) {
      parts.push("تم تعديل كمية بعض المنتجات بسبب نقص المخزون.");
    }
    return parts.join(" ");
  })();

  if (checking) {
    return (
      <main className="min-h-screen bg-zinc-50 py-8" dir="rtl">
        <div className="mx-auto max-w-4xl animate-pulse px-5">
          <div className="h-10 w-48 rounded-xl bg-zinc-200" />
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 rounded-3xl bg-zinc-200" />
              ))}
            </div>
            <div className="h-48 rounded-3xl bg-zinc-200" />
          </div>
        </div>
      </main>
    );
  }

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

        {issueMessage && (
          <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
            {issueMessage}
          </div>
        )}

        {items.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-12 text-center">
            <h2 className="text-2xl font-bold">السلة فارغة</h2>
            <p className="mt-2 text-zinc-500">أضيفي منتجًا أولًا من المتجر.</p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white"
            >
              تصفّح المتاجر
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              <Link href={continueShoppingHref} className="inline-block text-sm font-medium text-zinc-500">
                ← متابعة التسوق
              </Link>
              {items.map((item) => {
                const isOutOfStock = outOfStockIds.includes(item.productId);
                return (
                  <article
                    key={item.productId}
                    className={`flex gap-4 rounded-3xl border bg-white p-4 ${
                      isOutOfStock ? "border-red-200" : "border-zinc-200"
                    }`}
                  >
                    <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-bold">{item.name}</h2>
                      <p className="mt-1 text-sm text-zinc-500">
                        {item.price.toLocaleString("fr-DZ")} {currency}
                      </p>
                      {isOutOfStock && (
                        <p className="mt-1 text-sm font-medium text-red-600">
                          نفد المخزون — يرجى حذف المنتج للمتابعة
                        </p>
                      )}
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="flex items-center overflow-hidden rounded-xl border border-zinc-300">
                          <button
                            className="px-3 py-2 disabled:opacity-40"
                            disabled={isOutOfStock}
                            onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          >
                            −
                          </button>
                          <span className="min-w-10 text-center">{item.quantity}</span>
                          <button
                            className="px-3 py-2 disabled:opacity-40"
                            disabled={isOutOfStock || item.quantity >= item.stockQuantity}
                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="text-sm text-red-500"
                          onClick={() => {
                            removeFromCart(item.productId);
                            setOutOfStockIds((ids) => ids.filter((id) => id !== item.productId));
                          }}
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="h-fit rounded-3xl border border-zinc-200 bg-white p-6">
              <h2 className="text-xl font-bold">ملخص الطلب</h2>
              <div className="mt-5 flex justify-between border-t border-zinc-100 pt-5">
                <span className="text-zinc-500">المجموع الفرعي</span>
                <strong>
                  {subtotal.toLocaleString("fr-DZ")} {currency}
                </strong>
              </div>
              <p className="mt-2 text-xs text-zinc-400">التوصيل يحسب في صفحة الطلب.</p>

              {hasBlockingIssue ? (
                <p className="mt-6 rounded-xl bg-red-50 p-3 text-center text-sm text-red-700">
                  أزيلي المنتجات غير المتوفرة من السلة قبل المتابعة
                </p>
              ) : (
                <Link
                  href={items.length ? "/checkout" : "#"}
                  className="mt-6 block rounded-xl bg-zinc-900 px-4 py-3 text-center font-semibold text-white"
                >
                  متابعة الطلب
                </Link>
              )}
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
