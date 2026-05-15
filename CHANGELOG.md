# Changelog

All notable changes to POS-F&B are documented here.

---

## [1.1.0] — 2026-05-15

### 🌐 Complete i18n (5 Languages)
- **Client-side UI**: All 48+ pages use `useI18n()` — zero hardcoded Vietnamese strings remaining
  - Products (datagrid, pagination, recipe, toppings modal)
  - Inventory (stock-in panel, supplier auto-fill)
  - Cash (datagrid, register, petty cash categories)
  - Printers (form, labels, client hint)
  - Holidays (list, usage guide, dialog)
  - Toppings (groups, assignments, pricing)
  - Karaoke, VAT, Shifts, Users, Categories, Suppliers, Areas, Units, Ingredients, Payment Methods, Discounts, Service Charges, Modules
- **Server-side → English**: All Excel exports, error messages, print footer converted to English
  - `excel.ts`: 70+ titles/sections/headers/summaries → EN
  - `reports/actions.ts`, `order/actions.ts`, `inventory/actions.ts`, `print-actions.ts`, `dashboard/actions.ts`
- **4 translations re-generated from scratch** via sub-agents
  - `en.ts`: 644 keys — natural restaurant/F&B English
  - `zh.ts`: 699 keys — Chinese (Simplified)
  - `ko.ts`: 699 keys — Korean
  - `ja.ts`: 644 keys — Japanese (kanji + katakana)

### 🍪 Dynamic Locale via Cookie
- LanguageSwitcher sets `pos-locale` cookie on change + initial load
- Server components read cookie via `lib/locale.ts` → `getServerDictionary()`
- All 15 settings `page.tsx` files now dynamic — no more hardcoded `getDictionary("vi")`

### 🚀 CI/CD Pipeline
- GitHub Actions: `build-merge.yml`
- On push to `dev_lor`: `npm ci` → `prisma db push` → `tsc --noEmit` → `next build`
- Build success → auto-merge `dev_lor` → `main` (no-ff)
- Manual trigger via `workflow_dispatch`

### 🐛 Bug Fixes
- Fix profit double-count: `profit = income - expenses` only
- Fix printer type labels (`Bếp` → i18n key)
- Fix sync script overwriting translated dictionary values
- Fix `tsc` duplicate keys in `vi.ts`
- Fix literal strings rendered as text (`t.settings.vat`, `t.settings.addKaraokePrice`)

### 🏷️ Repository
- Branches: `main` (stable, CI-merged), `dev_lor` (development), `master` (legacy)
- Tag: `v1.1.0`

---

## [1.0.0] — 2026-05-14

### 🎉 First Release

#### ✨ Core Modules
- **Order Management** — Table grid with open/merge/split, product catalog with categories & toppings, send-to-kitchen, pre-bill, checkout
- **Inventory** — Stock in/out tracking, unit conversion, recipe-based auto deduction, low stock alerts
- **Cash Flow** — Register open/close, income/expense tracking, discrepancy detection
- **Reports** — Revenue, Ingredient, Warehouse, Sold Items, Invoice reports with Excel export
- **Settings** — Restaurant config, users/roles, products, categories, ingredients, units, suppliers, printers, print templates, areas/tables, discounts, service charges, VAT, excise tax, payment methods, shifts, holidays, karaoke pricing, modules

#### 🖨️ Printing System
- Dual-mode: Server TCP direct + Client WiFi/Bluetooth/USB
- Visual template editor with ORDER (kitchen ticket) vs BILL separation
- PrintJob queue with sequence numbers
- Web Bluetooth API hook for mobile printing

#### 🌐 i18n
- 5 languages: 🇻🇳 Vietnamese | 🇬🇧 English | 🇨🇳 Chinese | 🇰🇷 Korean | 🇯🇵 Japanese
- Custom context/provider with localStorage persistence
- Language switcher on header + login page
- All 48 pages fully translated

#### 🔐 Auth
- NextAuth.js v5 with credentials provider
- Role-based access control with custom permissions

#### ⚙️ System
- Module toggles (Orders, Inventory, Reports, Karaoke, KDS)
- Hidden menu items for disabled modules
- Restaurant info config (displayed on bills)

#### 🛠 Stack
- Next.js 16 (Turbopack) + TypeScript
- Prisma + SQLite (40+ models)
- shadcn/ui + Tailwind CSS
- ExcelJS for report export
- Recharts for charts
- Sonner for toasts

#### 🐛 Known Issues
- Web Bluetooth only works on Chromium-based browsers
- Thermal printer ESC/POS commands may need tuning per printer model
- Karaoke time tracking is UI-only (no background timer yet)
