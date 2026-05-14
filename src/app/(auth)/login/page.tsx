"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChefHat } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { LanguageSwitcher } from "@/i18n/language-switcher";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ username: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await signIn("credentials", { username: form.username, password: form.password, redirect: false });
      if (res?.error) { toast.error(t.login.wrongCredentials); return; }
      router.push("/dashboard");
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <main className="w-full max-w-[360px] bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col p-8 gap-8">
        <div className="flex justify-end"><LanguageSwitcher /></div>
        <header className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center shadow-sm">
            <ChefHat className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">POS F&B</h1>
            <p className="text-sm text-gray-500 mt-1">{t.login.title}</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">{t.login.username}</label>
            <input name="username" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="w-full h-11 px-4 rounded-lg border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-sm"
              placeholder={t.login.usernamePlaceholder} autoComplete="username" />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-700">{t.login.password}</label>
              <a href="#" className="text-xs font-medium text-amber-600 hover:underline">{t.login.forgotPassword}</a>
            </div>
            <input name="password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full h-11 px-4 rounded-lg border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-sm"
              placeholder={t.login.passwordPlaceholder} autoComplete="current-password" />
          </div>

          <button type="submit" disabled={pending}
            className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm shadow-sm active:scale-[0.98] transition-all disabled:opacity-50">
            {pending ? t.login.loggingIn : t.login.login}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{t.login.systemLabel}</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <p className="text-center text-xs text-gray-400">{t.login.version}</p>
      </main>
    </div>
  );
}
