"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/context";
import {
  Building2, Users, FolderTree, Tags, Scale,
  MapPin, Printer, FileText, Coffee, ListChecks, ShieldCheck,
  Clock, CreditCard, Percent, Receipt, Package, Puzzle, Truck,
  CalendarDays,
} from "lucide-react";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();

  const groups = [
    { label: t.dashboard.modules.settings, items: [
      { href: "/settings", label: t.settings.sidebar.generalConfig, icon: Building2, exact: true },
      { href: "/settings/users", label: t.settings.sidebar.usersRoles, icon: Users },
      { href: "/settings/shifts", label: t.settings.sidebar.shifts, icon: Clock },
      { href: "/settings/holidays", label: t.settings.sidebar.holidays, icon: CalendarDays },
    ]},
    { label: t.settings.sidebar.menuItems, items: [
      { href: "/settings/categories", label: t.settings.sidebar.categories, icon: FolderTree },
      { href: "/settings/products", label: t.settings.sidebar.products, icon: Coffee },
      { href: "/settings/toppings", label: t.settings.toppings, icon: ListChecks },
      { href: "/settings/ingredients", label: t.settings.sidebar.ingredients, icon: Package },
      { href: "/settings/suppliers", label: t.settings.sidebar.suppliers, icon: Truck },
    ]},
    { label: t.settings.sidebar.taxUnits, items: [
      { href: "/settings/vat", label: t.settings.sidebar.vat, icon: Tags },
      { href: "/settings/excise-tax", label: t.settings.sidebar.exciseTax, icon: ShieldCheck },
      { href: "/settings/units", label: t.settings.sidebar.units, icon: Scale },
    ]},
    { label: t.settings.sidebar.locations, items: [
      { href: "/settings/areas", label: t.settings.sidebar.areasTables, icon: MapPin },
      { href: "/settings/karaoke", label: t.settings.karaoke, icon: Clock },
    ]},
    { label: t.settings.sidebar.printing, items: [
      { href: "/settings/printers", label: t.settings.sidebar.printers, icon: Printer },
      { href: "/settings/print-templates", label: t.settings.sidebar.templates, icon: FileText },
    ]},
    { label: t.settings.sidebar.other, items: [
      { href: "/settings/payment-methods", label: t.settings.sidebar.payments, icon: CreditCard },
      { href: "/settings/discounts", label: t.settings.sidebar.discounts, icon: Percent },
      { href: "/settings/service-charges", label: t.settings.sidebar.serviceCharges, icon: Receipt },
      { href: "/settings/modules", label: t.settings.sidebar.systemModules, icon: Puzzle },
    ]},
  ];

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        <aside className="w-full lg:w-52 shrink-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.settings.title}</h2>
          {groups.map(group => (
            <div key={group.label} className="pb-3">
              <p className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{group.label}</p>
              {group.items.map(item => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      active ? "bg-amber-50 text-amber-700 font-semibold" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}>
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </aside>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
