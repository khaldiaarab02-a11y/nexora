"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";

type GuardStatus = "checking" | "unauthenticated" | "forbidden" | "ready";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<GuardStatus>("checking");
  const checkId = useRef(0);

  useEffect(() => {
    async function check() {
      const currentCheckId = ++checkId.current;
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        if (checkId.current !== currentCheckId) return;
        setStatus("unauthenticated");
        router.replace("/auth");
        return;
      }

      const { data: adminRow } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (checkId.current !== currentCheckId) return;

      setStatus(adminRow ? "ready" : "forbidden");
    }

    check();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => check());

    return () => subscription.unsubscribe();
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  if (status === "checking" || status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-sm text-zinc-400">
        جاري التحقق من الجلسة...
      </div>
    );
  }

  if (status === "forbidden") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
        <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">
            غير مصرح لك بالوصول
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            هذه اللوحة مخصصة لفريق Nexora فقط.
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white"
          >
            الذهاب إلى لوحة متجري
          </Link>
        </div>
      </div>
    );
  }

  const links = [
    { href: "/admin", label: "الرئيسية" },
    { href: "/admin/stores", label: "المتاجر" },
    { href: "/admin/subscriptions", label: "الاشتراكات" },
    { href: "/admin/support", label: "الدعم" },
  ];

  function isActive(href: string) {
    return href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(href);
  }

  return (
    <div>
      <nav className="sticky top-0 z-30 border-b border-zinc-200 bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <span className="text-sm font-bold text-white">
              Nexora Admin
            </span>

            <div className="hidden gap-1 md:flex">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive(link.href)
                      ? "bg-white text-zinc-900"
                      : "text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language */}
            <LanguageSwitcher />

            <button
              onClick={handleSignOut}
              className="rounded-lg px-3 py-2 text-sm font-medium text-red-300 hover:bg-zinc-800"
              type="button"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="flex gap-1 overflow-x-auto border-t border-zinc-800 px-4 py-2 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium ${
                isActive(link.href)
                  ? "bg-white text-zinc-900"
                  : "text-zinc-300"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {children}
    </div>
  );
}
