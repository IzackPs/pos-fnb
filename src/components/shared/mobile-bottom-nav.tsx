"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UtensilsCrossed, Package, Banknote, BarChart3, Settings,
} from "lucide-react";
import { useI18n } from "@/i18n/context";

const NAV_ITEMS: { href: string; icon: typeof UtensilsCrossed; labelKey: string; module?: string }[] = [
  { href: "/order", icon: UtensilsCrossed, labelKey: "sales" },
  { href: "/inventory", icon: Package, labelKey: "inventory", module: "inventory" },
  { href: "/cash", icon: Banknote, labelKey: "cash" },
  { href: "/reports", icon: BarChart3, labelKey: "reports", module: "reports" },
  { href: "/settings", icon: Settings, labelKey: "settings" },
];

export function MobileBottomNav({ enabledModules }: { enabledModules: Set<string> }) {
  const pathname = usePathname();
  const { t } = useI18n();

  const items = NAV_ITEMS.filter(item => !item.module || enabledModules.has(item.module));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-pb"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="grid grid-cols-5 h-14">
        {items.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors active:scale-95 touch-manipulation ${
                active ? "text-amber-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-semibold leading-none">
                {(t.nav as Record<string, string>)[item.labelKey] || item.labelKey}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
