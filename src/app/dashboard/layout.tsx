"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const navLinks = [
  { href: "/dashboard", label: "الرئيسية" },
  { href: "/dashboard/orders", label: "الطلبات" },
  { href: "/dashboard/products", label: "المنتجات" },
  { href: "/dashboard/settings/store", label: "إعدادات المتجر" },
  { href: "/dashboard/account", label: "الحساب" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function loadStoreSlug() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: membership } = await supabase
        .from("store_members")
        .select("store_id")
        .eq("user_id", userData.user.id)
        .eq("role", "owner")
        .limit(1)
        .maybeSingle();

      if (!membership) return;

      const { data: store } = await supabase
        .from("stores")
        .select("slug")
        .eq("id", membership.store_id)
        .maybeSingle();

      if (store?.slug) setStoreSlug(store.slug);
    }

    loadStoreSlug();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  function isActive(href: string) {
    return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
  }

  return (
    <div dir="rtl">
      <nav className="sticky top-0 z-30 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/dashboard" className="text-sm font-bold tracking-wide text-zinc-900">
            Nexora
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive(link.href) ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {storeSlug && (
              <Link
                href={`/shop/${storeSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
              >
                عرض المتجر
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              تسجيل الخروج
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 md:hidden"
            aria-label="القائمة"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile menu panel */}
        {menuOpen && (
          <div className="border-t border-zinc-100 px-4 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive(link.href) ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {storeSlug && (
                <Link
                  href={`/shop/${storeSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
                >
                  عرض المتجر
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="rounded-lg px-3 py-2.5 text-right text-sm font-medium text-red-600 hover:bg-red-50"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        )}
      </nav>

      {children}
    </div>
  );
}
