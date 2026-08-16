import { supabase } from "@/lib/supabase/client";

export default async function SupabaseTestPage() {
  const { error } = await supabase.from("stores").select("id").limit(1);
  const connected = !error;

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border p-8 text-center shadow-sm">
        <p className="mb-2 text-sm text-zinc-500">Nexora</p>
        <h1 className="text-2xl font-bold">Supabase Connection Test</h1>

        <div
          className={`mx-auto mt-6 rounded-xl p-4 ${
            connected
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {connected
            ? "Supabase connection is working."
            : "Supabase connection failed."}
        </div>

        {!connected && (
          <p className="mt-4 text-sm text-zinc-600">
            Check the Vercel environment variables and redeploy Nexora.
          </p>
        )}
      </div>
    </main>
  );
}
