# Changelog

All notable changes to POS-F&B are documented here.

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
