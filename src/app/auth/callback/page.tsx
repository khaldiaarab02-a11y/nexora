"use client";
import { useEffect } from "react"; import { useRouter } from "next/navigation"; import { supabase } from "@/lib/supabase/client";
export default function AuthCallback(){const router=useRouter();useEffect(()=>{supabase.auth.getSession().then(()=>router.replace("/dashboard"));},[router]);return <main className="flex min-h-screen items-center justify-center bg-zinc-50 text-sm text-zinc-500">جاري تأكيد الحساب...</main>}
