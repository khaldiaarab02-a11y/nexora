"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { useI18n } from "@/i18n/LanguageProvider";

function friendly(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  if (m.includes("email not confirmed")) return "يجب تأكيد بريدك الإلكتروني أولًا.";
  if (m.includes("already registered")) return "هذا البريد مسجل بالفعل. استخدمي تسجيل الدخول.";
  if (m.includes("password should be at least")) return "كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل.";
  if (m.includes("invalid email") || m.includes("unable to validate email")) return "صيغة البريد الإلكتروني غير صحيحة.";
  return message;
}
export default function AuthForm() {
  const router = useRouter(); const params = useSearchParams(); const { t, dir } = useI18n();
  const [mode,setMode]=useState<"login"|"signup">(params.get("mode")==="signup"?"signup":"login"); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [confirm,setConfirm]=useState(""); const [loading,setLoading]=useState(true); const [message,setMessage]=useState(""); const [success,setSuccess]=useState(false);
  useEffect(()=>{(async()=>{const {data}=await supabase.auth.getUser();if(data.user){const {data:admin}=await supabase.from("admin_users").select("user_id").eq("user_id",data.user.id).maybeSingle();router.replace(admin?"/admin":"/dashboard");}else setLoading(false);})();},[router]);
  async function submit(e:FormEvent){e.preventDefault(); if(loading)return; setMessage(""); setSuccess(false); if(mode==="signup"&&password!==confirm){setMessage("كلمتا المرور غير متطابقتين.");return;} setLoading(true);
    const result=mode==="signup"?await supabase.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:`${window.location.origin}/auth/callback`}}):await supabase.auth.signInWithPassword({email:email.trim(),password});
    if(result.error){setMessage(friendly(result.error.message));setLoading(false);return;}
    if(mode==="signup"&&!result.data.session){setSuccess(true);setMessage(t.auth.verifyText);setLoading(false);return;}
    const user = result.data.user;
    if (user) {
      const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
      router.replace(admin ? "/admin" : "/dashboard");
    }
  }
  async function resend(){setLoading(true);const {error}=await supabase.auth.resend({type:"signup",email:email.trim()});setMessage(error?friendly(error.message):"تمت إعادة إرسال رسالة التحقق.");setSuccess(!error);setLoading(false);}
  if(loading)return <div className="w-full max-w-md rounded-3xl border bg-white p-8 text-center text-zinc-400">{t.common.loading}</div>;
  return <div dir={dir} className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm"><div className="flex items-center justify-between"><Link href="/" className="font-black">Nexora</Link><LanguageSwitcher/></div><div className="mt-8"><h1 className="text-3xl font-bold">{mode==="login"?t.auth.login:t.auth.signup}</h1><p className="mt-2 text-sm text-zinc-500">{mode==="login"?"ادخلي إلى لوحة متجرك.":"أنشئي حسابك وابدئي رحلة متجرك."}</p></div><form onSubmit={submit} className="mt-7 space-y-4"><label className="block text-sm font-medium">{t.auth.email}<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-zinc-900"/></label><label className="block text-sm font-medium">{t.auth.password}<input required minLength={6} type="password" autoComplete={mode==="login"?"current-password":"new-password"} value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-zinc-900"/></label>{mode==="signup"&&<label className="block text-sm font-medium">{t.auth.confirm}<input required minLength={6} type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-zinc-900"/></label>}<button disabled={loading} className="w-full rounded-xl bg-zinc-900 px-4 py-3 font-semibold text-white disabled:opacity-50">{loading?"...":mode==="login"?t.auth.login:t.auth.signup}</button></form>{mode==="login"&&<div className="mt-4 text-center"><Link href="/auth/forgot-password" className="text-sm font-medium underline">{t.auth.forgot}</Link></div>}{message&&<div className={`mt-5 rounded-xl p-3 text-center text-sm ${success?"bg-emerald-50 text-emerald-700":"bg-red-50 text-red-700"}`}>{message}</div>}{success&&<button onClick={resend} className="mt-3 w-full rounded-xl border px-4 py-3 text-sm font-medium">{t.auth.resend}</button>}<div className="mt-6 text-center text-sm text-zinc-500"><button type="button" onClick={()=>{setMode(mode==="login"?"signup":"login");setMessage("");setSuccess(false);}} className="font-semibold underline">{mode==="login"?t.auth.signup:t.auth.login}</button></div></div>;
}
