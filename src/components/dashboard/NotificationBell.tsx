"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/i18n/LanguageProvider";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  href?: string | null;
  read_at?: string | null;
};

type NotificationsResponse = {
  notifications?: NotificationItem[];
  unread?: number;
};

export default function NotificationBell() {
  const { t } = useI18n();

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);

  async function load() {
    const { data } = await supabase.auth.getSession();

    const response = await fetch("/api/notifications", {
      headers: {
        Authorization: `Bearer ${data.session?.access_token || ""}`,
      },
    });

    if (!response.ok) return;

    const result = (await response.json()) as NotificationsResponse;

    setItems(result.notifications ?? []);
    setUnread(result.unread ?? 0);
  }

  useEffect(() => {
    void load();

    const id = window.setInterval(() => {
      void load();
    }, 30000);

    return () => window.clearInterval(id);
  }, []);

  async function mark(id?: string) {
    const { data } = await supabase.auth.getSession();

    await fetch("/api/notifications", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${data.session?.access_token || ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(id ? { id } : {}),
    });

    await load();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-xl border border-zinc-200 px-3 py-2 text-sm"
        aria-label={t.notifications.title}
      >
        🔔

        {unread > 0 && (
          <span className="absolute -end-1 -top-1 min-w-5 rounded-full bg-red-500 px-1.5 text-center text-[10px] font-bold leading-5 text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border bg-white p-2 shadow-xl">
          <div className="flex items-center justify-between px-3 py-2">
            <b>{t.notifications.title}</b>

            {unread > 0 && (
              <button
                type="button"
                onClick={() => void mark()}
                className="text-xs text-zinc-500"
              >
                {t.notifications.markAllRead}
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-auto">
            {items.length === 0 ? (
              <p className="p-4 text-sm text-zinc-500">
                {t.notifications.empty}
              </p>
            ) : (
              items.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.href || "#"}
                  onClick={() => void mark(notification.id)}
                  className={`block rounded-xl p-3 ${
                    notification.read_at ? "" : "bg-violet-50"
                  }`}
                >
                  <p className="text-sm font-semibold">
                    {notification.title}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    {notification.body}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
