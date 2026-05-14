"use server";

import ExcelJS from "exceljs";

function fmt(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n || 0);
}

// ─── Style helpers ───

const HEADER_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF59E0B" } };
const HEADER_FONT: Partial<ExcelJS.Font> = { bold: true, color: { argb: "FF000000" }, size: 11 };
const TITLE_FONT: Partial<ExcelJS.Font> = { bold: true, size: 16, color: { argb: "FFD97706" } };
const SUBTITLE_FONT: Partial<ExcelJS.Font> = { bold: false, size: 11, color: { argb: "FF6B7280" } };
const SECTION_FONT: Partial<ExcelJS.Font> = { bold: true, size: 12, color: { argb: "FFD97706" } };
const DATA_FONT: Partial<ExcelJS.Font> = { size: 10 };
const AMOUNT_FONT: Partial<ExcelJS.Font> = { size: 10, bold: true };
const BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FFD1D5DB" } },
  bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
  left: { style: "thin", color: { argb: "FFD1D5DB" } },
  right: { style: "thin", color: { argb: "FFD1D5DB" } },
};

function addTitle(ws: ExcelJS.Worksheet, title: string) {
  ws.mergeCells("A1:L1");
  const cell = ws.getCell("A1");
  cell.value = title;
  cell.font = TITLE_FONT;
  cell.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(1).height = 32;
}

function addSubtitle(ws: ExcelJS.Worksheet, subtitle: string, row: number = 2) {
  ws.mergeCells(`A${row}:L${row}`);
  const cell = ws.getCell(`A${row}`);
  cell.value = subtitle;
  cell.font = SUBTITLE_FONT;
  cell.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(row).height = 22;
}

function addSection(ws: ExcelJS.Worksheet, label: string, row: number, col: number) {
  const cell = ws.getCell(row, col);
  cell.value = label;
  cell.font = SECTION_FONT;
  cell.alignment = { vertical: "middle" };
  ws.getRow(row).height = 24;
}

function addHeaderRow(ws: ExcelJS.Worksheet, headers: string[], row: number) {
  ws.getRow(row).height = 28;
  headers.forEach((h, i) => {
    const cell = ws.getCell(row, i + 1);
    cell.value = h;
    cell.font = HEADER_FONT;
    cell.fill = HEADER_FILL;
    cell.border = BORDER;
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  });
}

function addDataRow(ws: ExcelJS.Worksheet, values: (string | number)[], row: number, startCol: number = 1) {
  values.forEach((v, i) => {
    const cell = ws.getCell(row, startCol + i);
    cell.value = v;
    cell.font = typeof v === "number" ? AMOUNT_FONT : DATA_FONT;
    cell.border = BORDER;
    cell.alignment = { vertical: "middle", horizontal: typeof v === "number" ? "right" : "left" };
    if (typeof v === "number") cell.numFmt = "#,##0";
  });
}

function colWidths(ws: ExcelJS.Worksheet, widths: number[]) {
  widths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });
}

// ======================== EXPORT FUNCTIONS ========================

export async function exportInvoicesToExcel(invoices: any[], summary: any, dateFrom: string, dateTo: string) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Hóa đơn");

  const d1 = new Date(dateFrom).toLocaleDateString("vi-VN");
  const d2 = new Date(dateTo).toLocaleDateString("vi-VN");
  addTitle(ws, "BÁO CÁO HÓA ĐƠN");
  addSubtitle(ws, `Từ ${d1} đến ${d2}`);

  // Summary
  let row = 4;
  addSection(ws, "📊 TỔNG QUAN", row, 1); row++;
  const summaryData = [
    ["Tổng số hóa đơn:", summary.totalOrders],
    ["Tổng doanh thu:", `${fmt(summary.totalRevenue)}đ`],
    ["Tổng tiền hàng:", `${fmt(summary.totalSubtotal)}đ`],
    ["Tổng thuế VAT:", `${fmt(summary.totalVat)}đ`],
    ["Tổng thuế TTĐB:", `${fmt(summary.totalExciseTax)}đ`],
    ["Tổng giảm giá:", `${fmt(summary.totalDiscount)}đ`],
    ["Tổng phí dịch vụ:", `${fmt(summary.totalServiceCharge)}đ`],
  ];
  summaryData.forEach(([k, v]) => {
    ws.getCell(row, 1).value = k;
    ws.getCell(row, 1).font = { bold: true, size: 10 };
    ws.getCell(row, 2).value = v;
    ws.getCell(row, 2).font = AMOUNT_FONT;
    row++;
  });
  row++;

  // Table
  addSection(ws, "📋 DANH SÁCH HÓA ĐƠN", row, 1); row++;
  const headers = ["Số HĐ", "Bàn", "Số khách", "Loại", "Nhân viên", "Tiền hàng", "VAT", "TTĐB", "Giảm giá", "Phí DV", "Tổng tiền", "PT Thanh toán", "Món", "Ngày đóng"];
  addHeaderRow(ws, headers, row); row++;

  invoices.forEach((inv) => {
    addDataRow(ws, [
      `${inv.orderNumber}${inv.orderNumberSuffix ? "-" + inv.orderNumberSuffix : ""}`,
      inv.table,
      inv.guestCount,
      inv.type === "COMP" ? "Tặng" : "Thường",
      inv.staff,
      inv.subtotal,
      inv.vatAmount,
      inv.exciseTaxAmount,
      inv.discountAmount,
      inv.serviceCharge,
      inv.totalAmount,
      inv.paymentMethods,
      inv.items,
      inv.closedAt ? new Date(inv.closedAt).toLocaleDateString("vi-VN") : "",
    ], row);
    row++;
  });

  colWidths(ws, [10, 10, 8, 8, 14, 14, 14, 14, 14, 14, 16, 24, 36, 14]);

  const buf = await wb.xlsx.writeBuffer();
  return buf;
}

export async function exportSoldItemsToExcel(items: any[], byProduct: any[], summary: any, dateFrom: string, dateTo: string) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Hàng đã bán");

  const d1 = new Date(dateFrom).toLocaleDateString("vi-VN");
  const d2 = new Date(dateTo).toLocaleDateString("vi-VN");
  addTitle(ws, "BÁO CÁO HÀNG ĐÃ BÁN");
  addSubtitle(ws, `Từ ${d1} đến ${d2}`);

  let row = 4;
  addSection(ws, "📊 TỔNG QUAN", row, 1); row++;
  const summaryData = [
    ["Tổng số dòng bán:", summary.totalItems],
    ["Tổng số lượng:", summary.totalQuantity],
    ["Tổng doanh thu:", `${fmt(summary.totalRevenue)}đ`],
  ];
  summaryData.forEach(([k, v]) => { ws.getCell(row, 1).value = k; ws.getCell(row, 1).font = { bold: true, size: 10 }; ws.getCell(row, 2).value = v; ws.getCell(row, 2).font = AMOUNT_FONT; row++; });
  row++;

  // By product
  addSection(ws, "📋 THEO SẢN PHẨM", row, 1); row++;
  const prodHeaders = ["#", "Sản phẩm", "Danh mục", "SL đã bán", "Doanh thu"];
  addHeaderRow(ws, prodHeaders, row); row++;
  byProduct.forEach((p, i) => {
    addDataRow(ws, [i + 1, p.name, p.category, p.quantity, p.revenue], row);
    row++;
  });
  row++;

  // Detail
  addSection(ws, "📋 CHI TIẾT TỪNG DÒNG", row, 1); row++;
  const detailHeaders = ["Món", "Danh mục", "SL", "Đơn giá", "Topping", "Thành tiền", "Hóa đơn", "Bàn", "Ngày bán"];
  addHeaderRow(ws, detailHeaders, row); row++;
  items.forEach((it) => {
    addDataRow(ws, [
      it.productName, it.category, it.quantity, it.unitPrice,
      it.toppings || "—", it.totalAmount, it.orderNumber, it.table,
      it.closedAt ? new Date(it.closedAt).toLocaleDateString("vi-VN") : "",
    ], row);
    row++;
  });

  colWidths(ws, [20, 14, 8, 14, 20, 16, 12, 8, 14]);

  const buf = await wb.xlsx.writeBuffer();
  return buf;
}

export async function exportRevenueToExcel(days: any[], summary: any, expensesByCategory: any, incomeByCategory: any, dateFrom: string, dateTo: string) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Doanh thu");

  const d1 = new Date(dateFrom).toLocaleDateString("vi-VN");
  const d2 = new Date(dateTo).toLocaleDateString("vi-VN");
  addTitle(ws, "BÁO CÁO DOANH THU");
  addSubtitle(ws, `Từ ${d1} đến ${d2}`);

  let row = 4;
  addSection(ws, "📊 TỔNG QUAN", row, 1); row++;
  const summaryData = [
    ["Tổng số hóa đơn:", summary.totalOrders],
    ["Tổng doanh thu bán hàng:", `${fmt(summary.totalRevenue)}đ`],
    ["Tổng tiền hàng:", `${fmt(summary.totalSubtotal)}đ`],
    ["Tổng thuế VAT:", `${fmt(summary.totalVat)}đ`],
    ["Tổng thuế TTĐB:", `${fmt(summary.totalExciseTax)}đ`],
    ["Tổng giảm giá:", `${fmt(summary.totalDiscount)}đ`],
    ["Tổng phí dịch vụ:", `${fmt(summary.totalServiceCharge)}đ`],
    ["Tổng thu nhập khác:", `${fmt(summary.totalOtherIncome)}đ`],
    ["Tổng chi phí:", `${fmt(summary.totalExpenses)}đ`],
    ["Lợi nhuận:", `${fmt(summary.profit)}đ`],
  ];
  summaryData.forEach(([k, v]) => { ws.getCell(row, 1).value = k; ws.getCell(row, 1).font = { bold: true, size: 10 }; ws.getCell(row, 2).value = v; ws.getCell(row, 2).font = AMOUNT_FONT; row++; });
  row++;

  // Payment methods
  if (Object.keys(summary.byPaymentMethod).length > 0) {
    addSection(ws, "💳 THEO PHƯƠNG THỨC THANH TOÁN", row, 1); row++;
    Object.entries(summary.byPaymentMethod).forEach(([method, amount]) => {
      ws.getCell(row, 1).value = method;
      ws.getCell(row, 1).font = { bold: true, size: 10 };
      ws.getCell(row, 2).value = `${fmt(amount as number)}đ`;
      ws.getCell(row, 2).font = AMOUNT_FONT;
      row++;
    });
    row++;
  }

  // Daily breakdown
  addSection(ws, "📅 DOANH THU THEO NGÀY", row, 1); row++;
  const dayHeaders = ["Ngày", "Số HĐ", "Tiền hàng", "VAT", "TTĐB", "Giảm giá", "Phí DV", "Doanh thu", "Thường", "Tặng"];
  addHeaderRow(ws, dayHeaders, row); row++;
  days.forEach((d) => {
    addDataRow(ws, [
      new Date(d.date).toLocaleDateString("vi-VN"), d.orders, d.subtotal, d.vat, d.excise,
      d.discount, d.service, d.revenue, d.normalCount, d.compCount,
    ], row);
    row++;
  });
  row++;

  // Expenses
  if (Object.keys(expensesByCategory).length > 0) {
    addSection(ws, "📉 CHI PHÍ THEO DANH MỤC", row, 1); row++;
    Object.entries(expensesByCategory).forEach(([cat, amount]) => {
      ws.getCell(row, 1).value = cat;
      ws.getCell(row, 1).font = { bold: true, size: 10 };
      ws.getCell(row, 2).value = `${fmt(amount as number)}đ`;
      ws.getCell(row, 2).font = AMOUNT_FONT;
      row++;
    });
  }

  colWidths(ws, [14, 10, 14, 14, 14, 14, 14, 16, 8, 8]);

  const buf = await wb.xlsx.writeBuffer();
  return buf;
}

export async function exportIngredientsToExcel(stockIns: any[], stockOuts: any[], stockInSummary: any, stockOutSummary: any, ingredients: any[], dateFrom: string, dateTo: string) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Nguyên liệu");

  const d1 = new Date(dateFrom).toLocaleDateString("vi-VN");
  const d2 = new Date(dateTo).toLocaleDateString("vi-VN");
  addTitle(ws, "BÁO CÁO NGUYÊN LIỆU");
  addSubtitle(ws, `Từ ${d1} đến ${d2}`);

  let row = 4;
  addSection(ws, "📊 TỔNG QUAN NHẬP KHO", row, 1); row++;
  const inSummary = [
    ["Tổng phiếu nhập:", stockInSummary.totalStockIns],
    ["Tổng số món nhập:", stockInSummary.totalItems],
    ["Tổng tiền nhập:", `${fmt(stockInSummary.totalAmount)}đ`],
  ];
  inSummary.forEach(([k, v]) => { ws.getCell(row, 1).value = k; ws.getCell(row, 1).font = { bold: true, size: 10 }; ws.getCell(row, 2).value = v; ws.getCell(row, 2).font = AMOUNT_FONT; row++; });
  row++;

  addSection(ws, "📊 TỔNG QUAN XUẤT KHO", row, 1); row++;
  const outSummary = [
    ["Tổng phiếu xuất:", stockOutSummary.totalStockOuts],
    ["Tổng số lượng xuất:", stockOutSummary.totalQuantity],
  ];
  outSummary.forEach(([k, v]) => { ws.getCell(row, 1).value = k; ws.getCell(row, 1).font = { bold: true, size: 10 }; ws.getCell(row, 2).value = v; ws.getCell(row, 2).font = AMOUNT_FONT; row++; });
  row++;

  // Stock In table
  addSection(ws, "📥 CHI TIẾT NHẬP KHO", row, 1); row++;
  const inHeaders = ["Mã phiếu", "Ngày nhập", "NCC", "Nguyên liệu", "SL", "Đơn giá", "Thành tiền", "Người nhập"];
  addHeaderRow(ws, inHeaders, row); row++;
  stockIns.forEach((si) => {
    si.items.forEach((item: any, idx: number) => {
      const date = new Date(si.createdAt).toLocaleDateString("vi-VN");
      addDataRow(ws, [
        idx === 0 ? si.code : "",
        idx === 0 ? date : "",
        idx === 0 ? (si.supplier || "—") : "",
        item.ingredient.name,
        item.quantity,
        item.unitPrice,
        item.totalPrice,
        idx === 0 ? (si.user?.name || "—") : "",
      ], row);
      row++;
    });
    if (si.items.length === 0) {
      addDataRow(ws, [si.code, new Date(si.createdAt).toLocaleDateString("vi-VN"), si.supplier || "—", "(không có món)", 0, 0, 0, si.user?.name || "—"], row);
      row++;
    }
  });
  row++;

  // Stock Out table
  addSection(ws, "📤 CHI TIẾT XUẤT KHO", row, 1); row++;
  const outHeaders = ["Ngày xuất", "Nguyên liệu", "Số lượng", "Lý do", "Người xuất", "Ghi chú"];
  addHeaderRow(ws, outHeaders, row); row++;
  stockOuts.forEach((so) => {
    addDataRow(ws, [
      new Date(so.createdAt).toLocaleDateString("vi-VN"),
      so.ingredient?.name || "—",
      so.quantity,
      so.reason,
      so.user?.name || "—",
      so.note || "",
    ], row);
    row++;
  });
  row++;

  // Current stock status
  addSection(ws, "📦 TỒN KHO HIỆN TẠI", row, 1); row++;
  const invHeaders = ["Tên", "ĐV Nhập", "ĐV Cơ bản", "Hệ số", "Tồn kho", "Tối thiểu", "Giá vốn", "Giá trị tồn", "Dùng cho món"];
  addHeaderRow(ws, invHeaders, row); row++;
  ingredients.forEach((ing) => {
    addDataRow(ws, [
      ing.name,
      ing.purchaseUnit,
      ing.baseUnit,
      ing.conversionFactor,
      ing.currentStock,
      ing.minStock,
      ing.costPerBaseUnit,
      ing.currentStock * ing.costPerBaseUnit,
      ing.recipes?.map((r: any) => r.product.name).join(", ") || "—",
    ], row);
    row++;
  });

  colWidths(ws, [14, 12, 16, 18, 10, 14, 14, 14, 14, 14, 14, 14, 14, 24]);

  const buf = await wb.xlsx.writeBuffer();
  return buf;
}

export async function exportWarehouseToExcel(ingredients: any[], summary: any, lowStock: any[], outOfStock: any[]) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Tồn kho");

  addTitle(ws, "BÁO CÁO KHO");
  addSubtitle(ws, `Cập nhật: ${new Date().toLocaleDateString("vi-VN")} ${new Date().toLocaleTimeString("vi-VN")}`);

  let row = 4;
  addSection(ws, "📊 TỔNG QUAN KHO", row, 1); row++;
  const summaryData = [
    ["Tổng số nguyên liệu:", summary.totalIngredients],
    ["Tổng giá trị tồn kho:", `${fmt(summary.totalStockValue)}đ`],
    ["Tổng số sản phẩm:", summary.totalProducts],
    ["Tổng số danh mục:", summary.totalCategories],
    ["Tổng số nhà cung cấp:", summary.totalSuppliers],
    ["Nguyên liệu dưới định mức:", summary.lowStockCount],
    ["Nguyên liệu hết hàng:", summary.outOfStockCount],
  ];
  summaryData.forEach(([k, v]) => { ws.getCell(row, 1).value = k; ws.getCell(row, 1).font = { bold: true, size: 10 }; ws.getCell(row, 2).value = v; ws.getCell(row, 2).font = AMOUNT_FONT; row++; });
  row++;

  // Low stock alerts
  if (lowStock.length > 0) {
    addSection(ws, "⚠️ NGUYÊN LIỆU DƯỚI ĐỊNH MỨC", row, 1); row++;
    const lowHeaders = ["Tên", "Tồn", "Tối thiểu", "ĐV Cơ bản", "Nhà cung cấp"];
    addHeaderRow(ws, lowHeaders, row); row++;
    lowStock.forEach((i) => {
      addDataRow(ws, [i.name, i.currentStock, i.minStock, i.baseUnit, i.supplier || "—"], row);
      row++;
    });
    row++;
  }

  if (outOfStock.length > 0) {
    addSection(ws, "🚫 NGUYÊN LIỆU HẾT HÀNG", row, 1); row++;
    const outHeaders = ["Tên", "Tồn", "Tối thiểu", "ĐV Cơ bản", "Nhà cung cấp"];
    addHeaderRow(ws, outHeaders, row); row++;
    outOfStock.forEach((i) => {
      addDataRow(ws, [i.name, i.currentStock, i.minStock, i.baseUnit, i.supplier || "—"], row);
      row++;
    });
    row++;
  }

  // All ingredients
  addSection(ws, "📦 TOÀN BỘ NGUYÊN LIỆU", row, 1); row++;
  const invHeaders = ["Tên", "ĐV Nhập", "ĐV Cơ bản", "Hệ số QĐ", "Tồn kho", "Tối thiểu", "Giá vốn / ĐV cơ bản", "Giá trị tồn", "Dùng cho món", "Nhà cung cấp"];
  addHeaderRow(ws, invHeaders, row); row++;
  ingredients.forEach((ing) => {
    addDataRow(ws, [
      ing.name,
      ing.purchaseUnit,
      ing.baseUnit,
      ing.conversionFactor,
      ing.currentStock,
      ing.minStock,
      ing.costPerBaseUnit,
      ing.currentStock * ing.costPerBaseUnit,
      ing.recipes?.map((r: any) => r.product.name).join(", ") || "—",
      ing.supplier || "—",
    ], row);
    row++;
  });

  colWidths(ws, [18, 12, 12, 10, 10, 10, 16, 14, 30, 16]);

  const buf = await wb.xlsx.writeBuffer();
  return buf;
}
