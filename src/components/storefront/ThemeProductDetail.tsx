import Link from "next/link";
import type { ThemeConfig } from "@/themes/types";

export default function ThemeProductDetail({
  theme,
  primaryColor,
  accentColor,
  fontStack,
  store,
  product,
  gallery,
  selectedIndex,
  related,
  quantity,
  added,
  currency,
  onSelectImage,
  onPrevious,
  onNext,
  onQuantity,
  onAdd,
  onTouchStart,
  onTouchEnd,
}: {
  theme: ThemeConfig;
  primaryColor: string;
  accentColor: string;
  fontStack: string;
  store: { name: string; slug: string };
  product: { id: string; name: string; description: string | null; price: number; compare_at_price: number | null; stock_quantity: number; image_url: string | null; sku: string | null };
  gallery: string[];
  selectedIndex: number;
  related: { id: string; name: string; slug: string; price: number; image_url: string | null }[];
  quantity: number;
  added: boolean;
  currency: string;
  onSelectImage: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onQuantity: (quantity: number) => void;
  onAdd: () => void;
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchEnd: (event: React.TouchEvent) => void;
}) {
  const unavailable = product.stock_quantity <= 0;
  const selectedImage = gallery[selectedIndex] || null;

  return (
    <main className="min-h-screen" style={{ background: theme.preview.background, color: theme.preview.foreground, fontFamily: fontStack, "--nexora-primary": primaryColor, "--nexora-accent": accentColor } as React.CSSProperties}>
      <header className={`${theme.layout.header} border-b`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link href={`/shop/${store.slug}`} className="text-sm font-medium opacity-60">← العودة للمتجر</Link>
          <Link href="/cart" className={`${theme.layout.button} bg-[var(--nexora-primary)] px-4 py-2.5 text-sm font-semibold text-white`}>السلة 🛒</Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-8">
        <div className={`grid overflow-hidden md:grid-cols-2 ${theme.layout.productDetail}`}>
          <div className="min-w-0">
            <div className="relative aspect-square touch-pan-y select-none bg-black/5" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              {selectedImage ? <img src={selectedImage} alt={product.name} className="h-full w-full object-cover" draggable={false} /> : <div className="flex h-full items-center justify-center opacity-40">لا توجد صورة</div>}
              {gallery.length > 1 && <>
                <button type="button" onClick={onPrevious} aria-label="الصورة السابقة" className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-lg shadow">›</button>
                <button type="button" onClick={onNext} aria-label="الصورة التالية" className="absolute start-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-lg shadow">‹</button>
                <span className="absolute bottom-3 start-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white">{selectedIndex + 1} / {gallery.length}</span>
              </>}
            </div>
            {gallery.length > 1 && <div className="flex gap-2.5 overflow-x-auto p-4">{gallery.map((url, index) => <button key={url + index} type="button" onClick={() => onSelectImage(index)} className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${selectedIndex === index ? "border-[var(--nexora-accent)]" : "border-transparent"}`}><img src={url} alt="" className="h-full w-full object-cover" /></button>)}</div>}
          </div>

          <div className="p-7 sm:p-10">
            <p className="text-sm opacity-50">{store.name}</p>
            <h1 className="mt-3 text-3xl font-bold">{product.name}</h1>
            {product.description && <p className="mt-5 leading-7 opacity-70">{product.description}</p>}
            <div className="mt-7"><span className="text-3xl font-bold">{Number(product.price).toLocaleString("fr-DZ")} {currency}</span>{product.compare_at_price && product.compare_at_price > product.price && <span className="ms-3 opacity-40 line-through">{Number(product.compare_at_price).toLocaleString("fr-DZ")} {currency}</span>}</div>
            <p className={`mt-3 text-sm ${unavailable ? "text-red-500" : "text-emerald-600"}`}>{unavailable ? "نفد المخزون" : `متوفر — ${product.stock_quantity} قطعة`}</p>

            {!unavailable && <div className="mt-7"><label className="mb-2 block text-sm font-medium">الكمية</label><div className="flex w-fit items-center overflow-hidden rounded-xl border border-black/10"><button type="button" className="px-5 py-3" onClick={() => onQuantity(Math.max(1, quantity - 1))}>−</button><span className="min-w-12 text-center">{quantity}</span><button type="button" className="px-5 py-3" onClick={() => onQuantity(Math.min(product.stock_quantity, quantity + 1))}>+</button></div></div>}

            <button type="button" disabled={unavailable} onClick={onAdd} className={`${theme.layout.button} mt-7 w-full bg-[var(--nexora-primary)] px-5 py-4 font-semibold text-white disabled:bg-black/10 disabled:text-black/30`}>{added ? "تمت الإضافة ✓" : "أضف إلى السلة"}</button>
            {added && <Link href="/cart" className="mt-3 block text-center text-sm font-medium opacity-60">الانتقال إلى السلة →</Link>}
          </div>
        </div>

        {related.length > 0 && <div className="mt-10"><h2 className="text-xl font-bold">منتجات أخرى قد تعجبك</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{related.map((item) => <Link key={item.id} href={`/shop/${store.slug}/product/${item.slug}`} className={`overflow-hidden ${theme.layout.card}`}><div className="aspect-square bg-black/5">{item.image_url ? <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" /> : null}</div><div className="p-4"><p className="font-semibold">{item.name}</p><p className="mt-2 font-bold">{Number(item.price).toLocaleString("fr-DZ")} {currency}</p></div></Link>)}</div></div>}
      </section>
    </main>
  );
}
