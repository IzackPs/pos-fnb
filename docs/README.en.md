# 🍜 POS-F&B — User Guide

## Table of Contents
1. [Getting Started](#1-getting-started)
2. [Order Management](#2-order-management)
3. [Inventory](#3-inventory)
4. [Cash Flow](#4-cash-flow)
5. [Reports](#5-reports)
6. [Settings](#6-settings)
7. [Printing](#7-printing)
8. [Multi-Language](#8-multi-language)
9. [FAQ](#9-faq)

---

## 1. Getting Started

### Login
Open your browser → go to app URL → enter username & password → pick a language.

Default credentials: `admin` / `admin123`

### Main Interface
- **Left sidebar**: modules (Dashboard, Sales, Inventory, Cash, Reports, Settings)
- **Header**: Language Switcher, Logout
- **Dashboard**: revenue stats, order count, active tables, top seller, activity timeline

---

## 2. Order Management

### 2.1 Open Table
1. Go to **Sales**
2. Click a free table → enter guest count → **Open Table**
3. Occupied tables = amber, free = gray

### 2.2 Add Items
1. Click occupied table → order panel opens on right
2. Browse categories → click items to add
3. Select toppings (size, sweetness, extras)
4. Adjust quantities, remove items as needed

### 2.3 Send to Kitchen
- Click **Send** → prints kitchen ticket (order #, table, items × qty, NO prices)

### 2.4 Pre-bill
- Click **Pre-bill** → prints temporary bill for customer review

### 2.5 Checkout
1. Click **Checkout**
2. Select payment method (Cash, Transfer, Momo...)
3. Enter amount → Confirm
4. Final bill prints automatically

### 2.6 Merge / Split Tables
- **Merge**: select 2+ occupied tables → Merge → choose destination table
- **Split**: select table with multiple items → Split → choose items to move

### 2.7 Bluetooth Printing (mobile)
1. Click Bluetooth button on order panel
2. Browser prompts device selection → pick thermal printer
3. Connected → print normally

---

## 3. Inventory

### 3.1 View Stock
**Stock Status** tab: list of ingredients, current quantity, stock value

### 3.2 Stock In
1. **Stock In** tab → **Add Stock In**
2. Choose supplier → select ingredient → enter quantity, unit price
3. Save → auto-updates stock

### 3.3 Stock Out
1. **Stock Out** tab → select ingredient → enter quantity, reason
2. Save → auto-deducts stock

### 3.4 Low Stock Alerts
Ingredients below minimum level highlighted in amber. Configure min levels in Settings → Ingredients.

---

## 4. Cash Flow

### 4.1 Open Register (Start Shift)
Click **Open** → enter opening balance → system records it

### 4.2 Record Income/Expense
- Click **+** → choose Income or Expense → enter amount, category, description
- List shows all transactions for the shift

### 4.3 Close Register (End Shift)
Click **Close** → enter actual cash count → system compares with expected → shows discrepancy

---

## 5. Reports

### 5.1 Revenue
- Filter: Today / This Week / This Month / Custom
- Shows: total revenue, subtotal, tax, expenses, profit
- Charts: by payment method, by day, by expense category

### 5.2 Invoices
- All completed transactions
- Per-invoice detail: items, quantities, prices, taxes, discounts

### 5.3 Ingredients
- Stock in by supplier, stock out by reason
- Per-transaction detail

### 5.4 Warehouse
- Overview: ingredient count, stock value, products, suppliers
- Low stock warnings

### 5.5 Excel Export
Every report tab has **Export Excel** → downloads .xlsx file

---

## 6. Settings

### 6.1 General
- Restaurant name, address, phone, email, tax code
- Tax mode: Inclusive / Exclusive

### 6.2 Users & Roles
- Add/edit/delete staff accounts
- JSON-based permissions per role

### 6.3 Products
- Add items: name, price, category, VAT, excise tax, topping group
- Assign ingredients (recipe) for auto stock deduction

### 6.4 Areas & Tables
- Create areas: Restaurant, Karaoke, Takeaway
- Add tables per area, configure capacity

### 6.5 Discounts
- % or fixed amount off
- Scope: all items or by category
- Conditions: date range, happy hour, min order value

### 6.6 Service Charges
- Service fee, holiday surcharge, takeaway fee
- Flexible application conditions

### 6.7 Printers & Templates
- Add thermal printers: name, IP, port, paper width, print areas
- Create templates: toggle per field for Order (kitchen) and Bill (checkout)
- Live preview

### 6.8 System Modules
- Toggle modules: Orders, Inventory, Reports, Karaoke, KDS
- Disabled modules auto-hide from menu

---

## 7. Printing

### 7.1 Print Modes
- **Server**: printer on same LAN as server → enter IP & Port
- **Device**: print from phone/tablet via WiFi/Bluetooth → no IP needed

### 7.2 Printer Setup
1. Settings → Printers → Add Printer
2. Name, type (Kitchen/Bar/Bill), print mode
3. IP/Port for server mode
4. Paper width: 58mm or 80mm

### 7.3 Templates
- **Order Ticket**: order #, table, time, items × qty, toppings, notes
- **Bill**: logo, address, phone, tax code, date/time, order #, item list + prices, VAT, discount, service charge, total, thank you

### 7.4 Mobile Printing (Bluetooth)
- Android: Chrome/Edge support Web Bluetooth
- iOS: needs PWA or WiFi printer

---

## 8. Multi-Language

- Switch language from header dropdown or login page
- Supported: 🇻🇳 Vietnamese | 🇬🇧 English | 🇨🇳 Chinese | 🇰🇷 Korean | 🇯🇵 Japanese
- Language saved in localStorage, persists across refreshes

---

## 9. FAQ

**Q: Forgot admin password?**  
A: Access SQLite database → User table → reset password hash (or re-seed database)

**Q: Printer not working?**  
A: Check: (1) Printer is on, (2) Same network as server (Server mode), (3) Correct IP & Port, (4) Paper width matches

**Q: Change currency from VND to USD?**  
A: Modify `Intl.NumberFormat("vi-VN")` in code or add currency setting to Settings

**Q: Add a new language?**  
A: Copy `src/i18n/vi.ts` → translate values → register in `src/i18n/dictionaries.ts` → add to `index.ts`

**Q: Backup data?**  
A: Copy `prisma/dev.db` (SQLite file). For production, migrate to PostgreSQL.

---

_Need more help? Open a GitHub Issue or contact the authors._
