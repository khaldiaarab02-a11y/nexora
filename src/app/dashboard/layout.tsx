"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const navLinks = [
  { href: "/dashboard", label: "الرئيسية" },
  { href: "/dashboard/orders", label: "الطلبات" },
  { href: "/dashboard/products", label: "المنتجات" },
  { href: "/dashboard/settings/store", label: "إعدادات المتجر" },
  { href: "/dashboard/appearance", label: "المظهر" },
  { href: "/dashboard/subscription", label: "الاشتراك" },
  { href: "/dashboard/support", label: "الدعم" },
  { href: "/dashboard/account", label: "الحساب" },
];

const ONBOARDING_PATH = "/dashboard/store/new";

type GuardStatus = "checking" | "unauthenticated" | "no-store" | "ready";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<GuardStatus>("checking");
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Avoids acting on a stale check if the effect re-runs (auth state
  // change) while an earlier check is still in flight.
  const checkId = useRef(0);

  useEffect(() => {
    async function check() {
      const currentCheckId = ++checkId.current;

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        if (checkId.current !== currentCheckId) return;
        setStatus("unauthenticated");
        setStoreSlug(null);
        if (pathname !== "/auth") router.replace("/auth");
        return;
      }

      const { data: membership } = await supabase
        .from("store_members")
        .select("store_id")
        .eq("user_id", user.id)
        .eq("role", "owner")
        .limit(1)
        .maybeSingle();

      if (checkId.current !== currentCheckId) return;

      if (!membership) {
        setStatus("no-store");
        setStoreSlug(null);
        if (pathname !== ONBOARDING_PATH) router.replace(ONBOARDING_PATH);
        return;
      }

      // Already has a store - the onboarding page has nothing left to do
      // for this user (this project is single-store-per-owner, matching
      // every store_id lookup already used throughout the app).
      if (pathname === ONBOARDING_PATH) {
        router.replace("/dashboard");
        return;
      }

      const { data: store } = await supabase
        .from("stores")
        .select("slug")
        .eq("id", membership.store_id)
        .maybeSingle();

      if (checkId.current !== currentCheckId) return;

      setStoreSlug(store?.slug ?? null);
      setStatus("ready");
    }

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => check());
    return () => subscription.unsubscribe();
  }, [pathname, router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  function isActive(href: string) {
    return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
  }

  // While the guard is still deciding, or actively redirecting, don't flash
  // protected content or the onboarding form to the wrong audience.
  if (status === "checking" || status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-sm text-zinc-400">
        جاري التحقق من الجلسة...
      </div>
    );
  }

  // A user with no store yet only ever sees the onboarding page itself -
  // no dashboard nav/shell around it, since none of those links are usable
  // without a store yet.
  if (status === "no-store") {
    return <>{children}</>;
  }

  return (
    <div>
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
