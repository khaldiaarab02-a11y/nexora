import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";

function AuthLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <div className="w-full max-w-md rounded-3xl border bg-white p-8 text-center text-sm text-zinc-400">
        جاري التحميل...
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
        <AuthForm />
      </main>
    </Suspense>
  );
}
