"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ChefHat, Menu, X, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { LanguageSwitcher } from "@/i18n/language-switcher";
import { useI18n } from "@/i18n/context";

export function PosLayoutClient({ children, enabledModules }: { children: React.ReactNode; enabledModules: Set<string> }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useI18n();
  const [mobileNav, setMobileNav] = useState(false);
  useEffect(() => { setMobileNav(false); }, [pathname]);

  const allNavItems: { href: string; label: string; module?: string }[] = [
    { href: "/order", label: t.nav.sales },
    { href: "/inventory", label: t.nav.inventory, module: "inventory" },
    { href: "/cash", label: t.nav.cash },
    { href: "/reports", label: t.nav.reports, module: "reports" },
    { href: "/settings", label: t.nav.settings },
  ];

  const navItems = allNavItems.filter(item => !item.module || enabledModules.has(item.module));

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f9fafb]">
      <header className="h-12 flex items-center justify-between px-4 shrink-0 bg-white border-b border-[#e5e7eb]">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
              <ChefHat className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm text-gray-900">POS F&B</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active ? "bg-amber-50 text-amber-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button className="md:hidden p-1" onClick={() => setMobileNav(!mobileNav)}>
            {mobileNav ? <X className="h-5 w-5 text-gray-700" /> : <Menu className="h-5 w-5 text-gray-700" />}
          </button>
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">
                {session?.user?.name?.[0] || "U"}
              </div>
              <span className="text-sm text-gray-700">{session?.user?.name}</span>
            </div>
            <button onClick={() => signOut({ callbackUrl: "/login" })} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {mobileNav && (
        <div className="md:hidden bg-white border-b border-[#e5e7eb] px-4 py-2 space-y-1">
          {navItems.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  active ? "bg-amber-50 text-amber-700" : "text-gray-600 hover:bg-gray-50"
                }`}>
                {item.label}
              </Link>
            );
          })}
          <LanguageSwitcher />
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50">
            {t.nav.logout}
          </button>
        </div>
      )}

      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
