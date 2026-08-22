"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useI18n } from "@/i18n/LanguageProvider";

export type ToastType = "success" | "error" | "warning" | "info";

type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
  duration: number;
};

type ToastOptions = {
  duration?: number;
};

type ToastContextValue = {
  showToast: (type: ToastType, message: string, options?: ToastOptions) => number;
  dismissToast: (id: number) => void;
  success: (message: string, options?: ToastOptions) => number;
  error: (message: string, options?: ToastOptions) => number;
  warning: (message: string, options?: ToastOptions) => number;
  info: (message: string, options?: ToastOptions) => number;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION: Record<ToastType, number> = {
  success: 4200,
  info: 4200,
  warning: 5200,
  error: 6200,
};

function ToastIcon({ type }: { type: ToastType }) {
  if (type === "success") {
    return (
      <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="10" className="fill-emerald-100" />
        <path d="M6 10.2l2.6 2.6L14.4 7" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "error") {
    return (
      <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="10" className="fill-rose-100" />
        <path d="M7 7l6 6M13 7l-6 6" stroke="#e11d48" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "warning") {
    return (
      <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="10" className="fill-amber-100" />
        <path d="M10 6v4.5" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="10" cy="13.4" r="0.9" fill="#b45309" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="10" className="fill-violet-100" />
      <path d="M10 9v4.4" stroke="#6d28d9" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="10" cy="6.6" r="0.9" fill="#6d28d9" />
    </svg>
  );
}

const TYPE_STYLES: Record<ToastType, string> = {
  success: "border-emerald-200/80 bg-white",
  error: "border-rose-200/80 bg-white",
  warning: "border-amber-200/80 bg-white",
  info: "border-violet-200/80 bg-white",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { dir, t } = useI18n();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const timersRef = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, options?: ToastOptions) => {
      const id = ++idRef.current;
      const duration = options?.duration ?? DEFAULT_DURATION[type];
      setToasts((current) => [...current, { id, type, message, duration }]);
      if (duration > 0) {
        const timer = setTimeout(() => dismissToast(id), duration);
        timersRef.current.set(id, timer);
      }
      return id;
    },
    [dismissToast]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      dismissToast,
      success: (message, options) => showToast("success", message, options),
      error: (message, options) => showToast("error", message, options),
      warning: (message, options) => showToast("warning", message, options),
      info: (message, options) => showToast("info", message, options),
    }),
    [showToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        dir={dir}
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2.5 px-4 sm:inset-x-auto sm:end-4 sm:items-end"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === "error" ? "alert" : "status"}
            className={`nexora-toast pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-[0_18px_45px_rgba(24,24,27,0.14)] backdrop-blur-xl ${TYPE_STYLES[toast.type]}`}
          >
            <ToastIcon type={toast.type} />
            <p className="min-w-0 flex-1 pt-0.5 text-[13px] font-semibold leading-5 text-zinc-800">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label={t.common.close}
              className="-m-1 shrink-0 rounded-full p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
            >
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used inside ToastProvider");
  return value;
}
