"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Logo from "@/components/shared/Logo";
import { useI18n } from "@/i18n/LanguageProvider";

type GuardStatus = "checking" | "unauthenticated" | "forbidden" | "ready";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
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
        {t.adminNav.checkingSession}
      </div>
    );
  }

  if (status === "forbidden") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
        <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">
            {t.adminNav.forbiddenTitle}
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            {t.adminNav.forbiddenText}
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white"
          >
            {t.adminNav.goToDashboard}
          </Link>
        </div>
      </div>
    );
  }

  const links = [
    { href: "/admin", label: t.adminNav.home },
    { href: "/admin/stores", label: t.adminNav.stores },
    { href: "/admin/subscriptions", label: t.adminNav.subscriptions },
    { href: "/admin/support", label: t.adminNav.support },
  ];

  function isActive(href: string) {
    return href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(href);
  }

  return (
    <div>
      <nav className="sticky top-0 z-30 border-b border-zinc-200 bg-zinc-900 dark:border-[var(--nx-border)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex shrink-0 items-center" aria-label="Nexora Admin">
              <Logo variant="compact" height={20} background="dark" />
              <span className="ms-2 rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-300">
                Admin
              </span>
            </Link>

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
            <ThemeToggle />
            <LanguageSwitcher />

            <button
              onClick={handleSignOut}
              className="rounded-lg px-3 py-2 text-sm font-medium text-red-300 hover:bg-zinc-800"
              type="button"
            >
              {t.adminNav.logout}
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
