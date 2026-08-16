import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-zinc-50" dir="rtl">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">
              Nexora
            </p>
            <h1 className="mt-1 text-2xl font-bold text-zinc-900">
              لوحة التحكم
            </h1>
          </div>
          <Link
            href="/dashboard/store/new"
            className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white"
          >
            + متجر جديد
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <section className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">المتجر الحالي</p>
          <h2 className="mt-2 text-3xl font-bold text-zinc-900">
            Nexora Test
          </h2>
          <p className="mt-1 text-sm text-zinc-500">nexora-test</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardCard title="المنتجات" value="0" href="#" />
            <DashboardCard title="الطلبات" value="0" href="#" />
            <DashboardCard title="العملاء" value="0" href="#" />
            <DashboardCard title="الإيرادات" value="0 DZD" href="#" />
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-zinc-200 bg-white p-7">
            <h3 className="text-lg font-bold text-zinc-900">الخطوة التالية</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              لوحة التحكم الأساسية جاهزة. المرحلة التالية ستكون إضافة المنتجات
              وإدارة المتجر.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-7">
            <h3 className="text-lg font-bold text-zinc-900">حالة المتجر</h3>
            <div className="mt-4 flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-zinc-700">
                المتجر نشط
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  value,
  href,
}: {
  title: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-zinc-200 p-5 transition hover:border-zinc-400"
    >
      <p className="text-sm text-zinc-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-zinc-900">{value}</p>
    </Link>
  );
}