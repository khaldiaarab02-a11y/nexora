import Link from "next/link";
import type { ThemeConfig } from "@/themes/types";

export type ThemeStorefrontProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  is_featured: boolean;
  image_url: string | null;
  sku: string | null;
  extraImageCount: number;
  created_at: string;
};

export default function ThemeStorefront({
  theme,
  primaryColor,
  accentColor,
  fontStack,
  store,
  products,
  currency,
  cartCount,
  searchInput,
  sortOption,
  sortOptions,
  onSearchChange,
  onSortChange,
  onAdd,
  addedId,
}: {
  theme: ThemeConfig;
  primaryColor: string;
  accentColor: string;
  fontStack: string;
  store: { name: string; slug: string; description: string | null; logo_url: string | null };
  products: ThemeStorefrontProduct[];
  currency: string;
  cartCount: number;
  searchInput: string;
  sortOption: string;
  sortOptions: { value: string; label: string }[];
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onAdd: (product: ThemeStorefrontProduct) => void;
  addedId: string | null;
}) {
  const style = {} as React.CSSProperties;

  return (
    <main className="min-h-screen bg-[var(--nexora-page)] text-[var(--nexora-text)]" style={{
      ...style,
      "--nexora-primary": primaryColor,
      "--nexora-accent": accentColor,
      "--nexora-page": theme.preview.background,
      "--nexora-text": theme.preview.foreground,
      "--nexora-font": fontStack,
      fontFamily: "var(--nexora-font)",
    } as React.CSSProperties} dir="rtl">
      <header className={`${theme.layout.header} sticky top-0 z-20`} style={{ "--nexora-primary": "var(--nexora-primary)" } as React.CSSProperties}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="h-11 w-11 shrink-0 rounded-2xl object-cover" />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--nexora-primary)] text-sm font-bold text-white">
                {store.name.slice(0, 1)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[0.2em] opacity-50">NEXORA</p>
              <h1 className="truncate font-bold">{store.name}</h1>
            </div>
          </div>
          <Link href="/cart" className={`${theme.layout.button} relative shrink-0 bg-[var(--nexora-primary)] px-4 py-2.5 text-sm font-semibold text-white`}>
            السلة 🛒
            {cartCount > 0 && <span className="mr-2 inline-flex min-w-6 items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-xs font-bold text-[var(--nexora-primary)]">{cartCount}</span>}
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-8 pt-10">
        <div className={theme.layout.hero}>
          <p className="text-sm font-medium opacity-60">متجر إلكتروني</p>
          <h2 className={`mt-3 max-w-3xl ${theme.layout.heroTitle}`}>{store.name}</h2>
          {store.description && <p className="mt-4 max-w-2xl text-base leading-7 opacity-70">{store.description}</p>}
          <div className="mt-6 h-1.5 w-20 rounded-full" style={{ backgroundColor: "var(--nexora-accent)" }} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input value={searchInput} onChange={(e) => onSearchChange(e.target.value)} placeholder="ابحثي عن منتج بالاسم أو SKU..." className="w-full rounded-2xl border border-black/10 bg-white px-5 py-3.5 text-sm outline-none focus:border-[var(--nexora-accent)] sm:flex-1" />
          <select value={sortOption} onChange={(e) => onSortChange(e.target.value)} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none sm:w-auto">
            {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>

        <div className="mb-6 flex items-end justify-between">
          <div><p className="text-sm opacity-50">اكتشفي مجموعتنا</p><h2 className="mt-1 text-2xl font-bold">المنتجات</h2></div>
          <span className="text-sm opacity-50">{products.length} منتج</span>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-black/10 bg-white p-12 text-center">
            <h3 className="text-xl font-bold">لا توجد منتجات متاحة حاليًا</h3>
            <p className="mt-2 text-sm opacity-60">سيتم عرض المنتجات هنا عندما تصبح متاحة.</p>
          </div>
        ) : (
          <div className={`grid gap-5 ${theme.layout.grid}`}>
            {products.map((product) => (
              <article key={product.id} className={`group overflow-hidden transition hover:-translate-y-1 hover:shadow-xl ${theme.layout.card}`}>
                <Link href={`/shop/${store.slug}/product/${product.slug}`} className="block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-black/5">
                    {product.image_url ? <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-sm opacity-40">لا توجد صورة</div>}
                    <div className="absolute right-4 top-4 flex flex-col items-end gap-1.5">
                      {product.is_featured && <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold shadow-sm">مميز</span>}
                      {product.extraImageCount > 0 && <span className="rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-medium text-white">+{product.extraImageCount} صور</span>}
                    </div>
                  </div>
                  <div className="p-5 pb-2">
                    <h3 className="text-lg font-bold">{product.name}</h3>
                    {product.description && <p className="mt-2 line-clamp-2 text-sm leading-6 opacity-60">{product.description}</p>}
                    <div className="mt-5 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xl font-bold">{Number(product.price).toLocaleString("fr-DZ")} {currency}</p>
                        {product.compare_at_price && product.compare_at_price > product.price && <p className="mt-1 text-sm opacity-40 line-through">{Number(product.compare_at_price).toLocaleString("fr-DZ")} {currency}</p>}
                      </div>
                      <span className={product.stock_quantity > 0 ? "text-sm text-emerald-600" : "text-sm text-red-500"}>{product.stock_quantity > 0 ? "متوفر" : "نفد المخزون"}</span>
                    </div>
                  </div>
                </Link>
                <div className="px-5 pb-5">
                  <button type="button" disabled={product.stock_quantity <= 0} onClick={() => onAdd(product)} className={`${theme.layout.button} w-full bg-[var(--nexora-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/30`}>
                    {addedId === product.id ? "تمت الإضافة ✓" : "أضف إلى السلة"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className={`${theme.layout.footer} py-8 text-center text-sm opacity-50`}>متجر {store.name} — مدعوم بواسطة Nexora</footer>
    </main>
  );
}
