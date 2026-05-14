import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { hash } from "bcryptjs";

const db = new PrismaClient({ adapter: new PrismaLibSql({ url: process.env.DATABASE_URL || "file:./prisma/dev.db" }) });

async function main() {
  console.log("🌱 Seeding POS F&B...\n");

  // ========== ROLES ==========
  const adminRole = await db.role.upsert({ where: { name: "Admin" }, update: {}, create: { name: "Admin", permissions: JSON.stringify(["*"]) } });
  await db.role.upsert({ where: { name: "Manager" }, update: {}, create: { name: "Manager", permissions: JSON.stringify(["reports.view","settings.*","inventory.*","cash.view"]) } });
  await db.role.upsert({ where: { name: "Cashier" }, update: {}, create: { name: "Cashier", permissions: JSON.stringify(["order.*","payments.*"]) } });
  await db.role.upsert({ where: { name: "Waiter" }, update: {}, create: { name: "Waiter", permissions: JSON.stringify(["order.open","order.item_add","order.send"]) } });
  console.log("✅ Roles");

  // ========== USERS ==========
  const hashPwd = await hash("admin123", 12);
  await db.user.upsert({ where: { username: "admin" }, update: {}, create: { username: "admin", password: hashPwd, name: "Admin", roleId: adminRole.id } });
  await db.user.upsert({ where: { username: "cashier1" }, update: {}, create: { username: "cashier1", password: hashPwd, name: "Thu Ngân", roleId: (await db.role.findUniqueOrThrow({ where: { name: "Cashier" } })).id } });
  await db.user.upsert({ where: { username: "waiter1" }, update: {}, create: { username: "waiter1", password: hashPwd, name: "Phục Vụ", roleId: (await db.role.findUniqueOrThrow({ where: { name: "Waiter" } })).id } });
  console.log("✅ Users (admin, cashier1, waiter1 / admin123)");

  // ========== GENERAL CONFIG ==========
  await db.generalConfig.upsert({ where: { id: "default" }, update: {}, create: { restaurantName: "Nhà Hàng Mập", address: "123 Nguyễn Huệ, Q.1, TP.HCM", phone: "0901234567", currency: "VND" } });
  console.log("✅ Config");

  // ========== VAT ==========
  const vat5 = await db.vat.upsert({ where: { code: "VAT5" }, update: {}, create: { code: "VAT5", name: "VAT 5%", rate: 0.05 } });
  const vat8 = await db.vat.upsert({ where: { code: "VAT8" }, update: {}, create: { code: "VAT8", name: "VAT 8%", rate: 0.08 } });
  const vat10 = await db.vat.upsert({ where: { code: "VAT10" }, update: {}, create: { code: "VAT10", name: "VAT 10%", rate: 0.10 } });
  console.log("✅ VAT (5%, 8%, 10%)");

  // ========== EXCISE TAX ==========
  await db.exciseTax.upsert({ where: { code: "NONE" }, update: {}, create: { code: "NONE", name: "Không áp dụng", rate: 0 } });
  const exciseBeer = await db.exciseTax.upsert({ where: { code: "BEER" }, update: {}, create: { code: "BEER", name: "Rượu bia", rate: 0.65 } });
  await db.exciseTax.upsert({ where: { code: "TOBACCO" }, update: {}, create: { code: "TOBACCO", name: "Thuốc lá", rate: 0.75 } });
  console.log("✅ Excise Tax");

  // ========== UNITS ==========
  const uPhan = await db.unit.upsert({ where: { name: "Phần" }, update: {}, create: { name: "Phần" } });
  const uLy = await db.unit.upsert({ where: { name: "Ly" }, update: {}, create: { name: "Ly" } });
  const uChai = await db.unit.upsert({ where: { name: "Chai" }, update: {}, create: { name: "Chai" } });
  const uLon = await db.unit.upsert({ where: { name: "Lon" }, update: {}, create: { name: "Lon" } });
  const uDia = await db.unit.upsert({ where: { name: "Dĩa" }, update: {}, create: { name: "Dĩa" } });
  const uTo = await db.unit.upsert({ where: { name: "Tô" }, update: {}, create: { name: "Tô" } });
  const uCai = await db.unit.upsert({ where: { name: "Cái" }, update: {}, create: { name: "Cái" } });
  // Ingredient units
  const uKg = await db.unit.upsert({ where: { name: "Kg" }, update: {}, create: { name: "Kg" } });
  const uGam = await db.unit.upsert({ where: { name: "Gam" }, update: {}, create: { name: "Gam" } });
  const uMl = await db.unit.upsert({ where: { name: "Ml" }, update: {}, create: { name: "Ml" } });
  const uLit = await db.unit.upsert({ where: { name: "Lít" }, update: {}, create: { name: "Lít" } });
  console.log("✅ Units");

  // ========== CATEGORIES ==========
  const catMain = await db.category.upsert({ where: { slug: "mon-chinh" }, update: {}, create: { name: "Món chính", slug: "mon-chinh", sortOrder: 1 } });
  const catDrink = await db.category.upsert({ where: { slug: "nuoc-uong" }, update: {}, create: { name: "Nước uống", slug: "nuoc-uong", sortOrder: 2 } });
  const catStarter = await db.category.upsert({ where: { slug: "khai-vi" }, update: {}, create: { name: "Khai vị", slug: "khai-vi", sortOrder: 3 } });
  const catDessert = await db.category.upsert({ where: { slug: "trang-mieng" }, update: {}, create: { name: "Tráng miệng", slug: "trang-mieng", sortOrder: 4 } });
  const catBeer = await db.category.upsert({ where: { slug: "bia-ruou" }, update: {}, create: { name: "Bia - Rượu", slug: "bia-ruou", sortOrder: 5 } });
  const catCoffee = await db.category.upsert({ where: { slug: "ca-phe" }, update: {}, create: { name: "Cà phê", slug: "ca-phe", sortOrder: 6 } });
  const catLau = await db.category.upsert({ where: { slug: "lau-nuong" }, update: {}, create: { name: "Lẩu - Nướng", slug: "lau-nuong", sortOrder: 7 } });
  console.log("✅ Categories (7)");

  // ========== PRODUCTS ==========
  const products = await Promise.all([
    // Món chính
    db.product.upsert({ where: { slug: "com-tam-suon" }, update: {}, create: { name: "Cơm Tấm Sườn", slug: "com-tam-suon", price: 55000, costPrice: 22000, categoryId: catMain.id, vatId: vat8.id, unitId: uDia.id, sortOrder: 1 } }),
    db.product.upsert({ where: { slug: "pho-bo" }, update: {}, create: { name: "Phở Bò Đặc Biệt", slug: "pho-bo", price: 65000, costPrice: 28000, categoryId: catMain.id, vatId: vat8.id, unitId: uTo.id, sortOrder: 2 } }),
    db.product.upsert({ where: { slug: "bun-bo-hue" }, update: {}, create: { name: "Bún Bò Huế", slug: "bun-bo-hue", price: 55000, costPrice: 24000, categoryId: catMain.id, vatId: vat8.id, unitId: uTo.id, sortOrder: 3 } }),
    db.product.upsert({ where: { slug: "com-ga-xoi-mo" }, update: {}, create: { name: "Cơm Gà Xối Mỡ", slug: "com-ga-xoi-mo", price: 60000, costPrice: 25000, categoryId: catMain.id, vatId: vat8.id, unitId: uDia.id, sortOrder: 4 } }),
    db.product.upsert({ where: { slug: "mi-xao-hai-san" }, update: {}, create: { name: "Mì Xào Hải Sản", slug: "mi-xao-hai-san", price: 75000, costPrice: 35000, categoryId: catMain.id, vatId: vat8.id, unitId: uDia.id, sortOrder: 5 } }),
    db.product.upsert({ where: { slug: "bo-luc-lac" }, update: {}, create: { name: "Bò Lúc Lắc", slug: "bo-luc-lac", price: 120000, costPrice: 60000, categoryId: catMain.id, vatId: vat8.id, unitId: uDia.id, sortOrder: 6 } }),
    // Khai vị
    db.product.upsert({ where: { slug: "cha-gio" }, update: {}, create: { name: "Chả Giò (4 cuốn)", slug: "cha-gio", price: 45000, costPrice: 18000, categoryId: catStarter.id, vatId: vat8.id, unitId: uPhan.id, sortOrder: 1 } }),
    db.product.upsert({ where: { slug: "goi-cuon" }, update: {}, create: { name: "Gỏi Cuốn Tôm Thịt", slug: "goi-cuon", price: 40000, costPrice: 16000, categoryId: catStarter.id, vatId: vat8.id, unitId: uPhan.id, sortOrder: 2 } }),
    db.product.upsert({ where: { slug: "sup-cua" }, update: {}, create: { name: "Súp Cua", slug: "sup-cua", price: 50000, costPrice: 20000, categoryId: catStarter.id, vatId: vat8.id, unitId: uTo.id, sortOrder: 3 } }),
    // Nước uống
    db.product.upsert({ where: { slug: "tra-da" }, update: {}, create: { name: "Trà Đá", slug: "tra-da", price: 5000, costPrice: 1000, categoryId: catDrink.id, vatId: vat8.id, unitId: uLy.id, sortOrder: 1 } }),
    db.product.upsert({ where: { slug: "nuoc-cam-ep" }, update: {}, create: { name: "Nước Cam Ép", slug: "nuoc-cam-ep", price: 45000, costPrice: 18000, categoryId: catDrink.id, vatId: vat8.id, unitId: uLy.id, sortOrder: 2 } }),
    db.product.upsert({ where: { slug: "nuoc-dua" }, update: {}, create: { name: "Nước Dừa Tươi", slug: "nuoc-dua", price: 35000, costPrice: 15000, categoryId: catDrink.id, vatId: vat8.id, unitId: uLy.id, sortOrder: 3 } }),
    db.product.upsert({ where: { slug: "soda-chanh" }, update: {}, create: { name: "Soda Chanh", slug: "soda-chanh", price: 25000, costPrice: 8000, categoryId: catDrink.id, vatId: vat8.id, unitId: uLy.id, sortOrder: 4 } }),
    // Cà phê
    db.product.upsert({ where: { slug: "ca-phe-den" }, update: {}, create: { name: "Cà Phê Đen", slug: "ca-phe-den", price: 25000, costPrice: 8000, categoryId: catCoffee.id, vatId: vat8.id, unitId: uLy.id, sortOrder: 1 } }),
    db.product.upsert({ where: { slug: "ca-phe-sua" }, update: {}, create: { name: "Cà Phê Sữa", slug: "ca-phe-sua", price: 30000, costPrice: 10000, categoryId: catCoffee.id, vatId: vat8.id, unitId: uLy.id, sortOrder: 2 } }),
    db.product.upsert({ where: { slug: "bac-xiu" }, update: {}, create: { name: "Bạc Xỉu", slug: "bac-xiu", price: 30000, costPrice: 10000, categoryId: catCoffee.id, vatId: vat8.id, unitId: uLy.id, sortOrder: 3 } }),
    // Bia - Rượu
    db.product.upsert({ where: { slug: "bia-saigon" }, update: {}, create: { name: "Bia Sài Gòn", slug: "bia-saigon", price: 20000, costPrice: 11000, categoryId: catBeer.id, vatId: vat10.id, exciseTaxId: exciseBeer.id, unitId: uChai.id, sortOrder: 1 } }),
    db.product.upsert({ where: { slug: "bia-heineken" }, update: {}, create: { name: "Heineken", slug: "bia-heineken", price: 30000, costPrice: 18000, categoryId: catBeer.id, vatId: vat10.id, exciseTaxId: exciseBeer.id, unitId: uChai.id, sortOrder: 2 } }),
    db.product.upsert({ where: { slug: "bia-tiger" }, update: {}, create: { name: "Tiger", slug: "bia-tiger", price: 25000, costPrice: 15000, categoryId: catBeer.id, vatId: vat10.id, exciseTaxId: exciseBeer.id, unitId: uLon.id, sortOrder: 3 } }),
    // Tráng miệng
    db.product.upsert({ where: { slug: "che-ba-mau" }, update: {}, create: { name: "Chè Ba Màu", slug: "che-ba-mau", price: 25000, costPrice: 8000, categoryId: catDessert.id, vatId: vat8.id, unitId: uLy.id, sortOrder: 1 } }),
    db.product.upsert({ where: { slug: "trai-cay-dia" }, update: {}, create: { name: "Trái Cây Đĩa", slug: "trai-cay-dia", price: 40000, costPrice: 20000, categoryId: catDessert.id, vatId: vat8.id, unitId: uDia.id, sortOrder: 2 } }),
    // Lẩu
    db.product.upsert({ where: { slug: "lau-thai" }, update: {}, create: { name: "Lẩu Thái", slug: "lau-thai", price: 250000, costPrice: 120000, categoryId: catLau.id, vatId: vat8.id, unitId: uPhan.id, sortOrder: 1 } }),
    db.product.upsert({ where: { slug: "lau-bo" }, update: {}, create: { name: "Lẩu Bò", slug: "lau-bo", price: 280000, costPrice: 140000, categoryId: catLau.id, vatId: vat8.id, unitId: uPhan.id, sortOrder: 2 } }),
  ]);
  console.log(`✅ Products (${products.length})`);

  // ========== TOPPING GROUPS ==========
  const tgSize = await db.toppingGroup.upsert({ where: { id: "tg-size" }, update: {}, create: { id: "tg-size", name: "Size", type: "SINGLE" } });
  const tgTopping = await db.toppingGroup.upsert({ where: { id: "tg-extra" }, update: {}, create: { id: "tg-extra", name: "Thêm Topping", type: "MULTIPLE" } });

  // Toppings
  await db.topping.upsert({ where: { id: "top-m" }, update: {}, create: { id: "top-m", name: "Size M", price: 0, toppingGroupId: tgSize.id, sortOrder: 1 } });
  await db.topping.upsert({ where: { id: "top-l" }, update: {}, create: { id: "top-l", name: "Size L", price: 10000, toppingGroupId: tgSize.id, sortOrder: 2 } });
  await db.topping.upsert({ where: { id: "top-bo" }, update: {}, create: { id: "top-bo", name: "Thêm bò", price: 20000, toppingGroupId: tgTopping.id, sortOrder: 1 } });
  await db.topping.upsert({ where: { id: "top-trung" }, update: {}, create: { id: "top-trung", name: "Thêm trứng ốp la", price: 10000, toppingGroupId: tgTopping.id, sortOrder: 2 } });
  console.log("✅ Toppings");

  // Link toppings to products: Phở + Bún Bò Huế
  const pho = await db.product.findUniqueOrThrow({ where: { slug: "pho-bo" } });
  const bun = await db.product.findUniqueOrThrow({ where: { slug: "bun-bo-hue" } });
  for (const p of [pho, bun]) {
    await db.productToppingGroup.upsert({ where: { productId_toppingGroupId: { productId: p.id, toppingGroupId: tgSize.id } }, update: {}, create: { productId: p.id, toppingGroupId: tgSize.id } });
    await db.productToppingGroup.upsert({ where: { productId_toppingGroupId: { productId: p.id, toppingGroupId: tgTopping.id } }, update: {}, create: { productId: p.id, toppingGroupId: tgTopping.id } });
  }

  // ========== INGREDIENTS ==========
  const ingredients = await Promise.all([
    db.ingredient.upsert({ where: { id: "ing-thit-heo" }, update: {}, create: { id: "ing-thit-heo", name: "Thịt heo", purchaseUnit: "Kg", baseUnit: "Gam", conversionFactor: 1000, currentStock: 10, minStock: 2, purchasePrice: 120000, costPerBaseUnit: 120, supplier: "Chợ Bến Thành" } }),
    db.ingredient.upsert({ where: { id: "ing-thit-bo" }, update: {}, create: { id: "ing-thit-bo", name: "Thịt bò", purchaseUnit: "Kg", baseUnit: "Gam", conversionFactor: 1000, currentStock: 8, minStock: 1.5, purchasePrice: 280000, costPerBaseUnit: 280, supplier: "Chợ Bến Thành" } }),
    db.ingredient.upsert({ where: { id: "ing-ga" }, update: {}, create: { id: "ing-ga", name: "Thịt gà", purchaseUnit: "Kg", baseUnit: "Gam", conversionFactor: 1000, currentStock: 6, minStock: 1, purchasePrice: 90000, costPerBaseUnit: 90, supplier: "CP" } }),
    db.ingredient.upsert({ where: { id: "ing-tom" }, update: {}, create: { id: "ing-tom", name: "Tôm sú", purchaseUnit: "Kg", baseUnit: "Gam", conversionFactor: 1000, currentStock: 3, minStock: 0.5, purchasePrice: 320000, costPerBaseUnit: 320, supplier: "Hải Sản Nha Trang" } }),
    db.ingredient.upsert({ where: { id: "ing-com" }, update: {}, create: { id: "ing-com", name: "Gạo tấm", purchaseUnit: "Kg", baseUnit: "Gam", conversionFactor: 1000, currentStock: 25, minStock: 5, purchasePrice: 20000, costPerBaseUnit: 20, supplier: "Đại lý gạo" } }),
    db.ingredient.upsert({ where: { id: "ing-banh-pho" }, update: {}, create: { id: "ing-banh-pho", name: "Bánh phở", purchaseUnit: "Kg", baseUnit: "Gam", conversionFactor: 1000, currentStock: 8, minStock: 1, purchasePrice: 25000, costPerBaseUnit: 25 } }),
    db.ingredient.upsert({ where: { id: "ing-bun" }, update: {}, create: { id: "ing-bun", name: "Bún tươi", purchaseUnit: "Kg", baseUnit: "Gam", conversionFactor: 1000, currentStock: 6, minStock: 1, purchasePrice: 18000, costPerBaseUnit: 18 } }),
    db.ingredient.upsert({ where: { id: "ing-mi" }, update: {}, create: { id: "ing-mi", name: "Mì trứng", purchaseUnit: "Kg", baseUnit: "Gam", conversionFactor: 1000, currentStock: 5, minStock: 1, purchasePrice: 30000, costPerBaseUnit: 30 } }),
    db.ingredient.upsert({ where: { id: "ing-trung" }, update: {}, create: { id: "ing-trung", name: "Trứng gà", purchaseUnit: "Chục", baseUnit: "Cái", conversionFactor: 10, currentStock: 60, minStock: 10, purchasePrice: 45000, costPerBaseUnit: 4500, supplier: "Trứng Ba Huân" } }),
    db.ingredient.upsert({ where: { id: "ing-rau-thom" }, update: {}, create: { id: "ing-rau-thom", name: "Rau thơm các loại", purchaseUnit: "Kg", baseUnit: "Gam", conversionFactor: 1000, currentStock: 3, minStock: 0.5, purchasePrice: 40000, costPerBaseUnit: 40, supplier: "Chợ Bến Thành" } }),
    db.ingredient.upsert({ where: { id: "ing-gia-vi" }, update: {}, create: { id: "ing-gia-vi", name: "Gia vị tổng hợp", purchaseUnit: "Kg", baseUnit: "Gam", conversionFactor: 1000, currentStock: 5, minStock: 1, purchasePrice: 100000, costPerBaseUnit: 100 } }),
    db.ingredient.upsert({ where: { id: "ing-ca-phe" }, update: {}, create: { id: "ing-ca-phe", name: "Cà phê hạt", purchaseUnit: "Kg", baseUnit: "Gam", conversionFactor: 1000, currentStock: 5, minStock: 1, purchasePrice: 200000, costPerBaseUnit: 200 } }),
    db.ingredient.upsert({ where: { id: "ing-sua-dac" }, update: {}, create: { id: "ing-sua-dac", name: "Sữa đặc", purchaseUnit: "Thùng", baseUnit: "Lon", conversionFactor: 48, currentStock: 96, minStock: 12, purchasePrice: 720000, costPerBaseUnit: 15000 } }),
    db.ingredient.upsert({ where: { id: "ing-duong" }, update: {}, create: { id: "ing-duong", name: "Đường cát", purchaseUnit: "Kg", baseUnit: "Gam", conversionFactor: 1000, currentStock: 10, minStock: 2, purchasePrice: 22000, costPerBaseUnit: 22 } }),
    db.ingredient.upsert({ where: { id: "ing-cam" }, update: {}, create: { id: "ing-cam", name: "Cam tươi", purchaseUnit: "Kg", baseUnit: "Gam", conversionFactor: 1000, currentStock: 8, minStock: 2, purchasePrice: 50000, costPerBaseUnit: 50, supplier: "Trái cây nhập" } }),
    db.ingredient.upsert({ where: { id: "ing-dau-an" }, update: {}, create: { id: "ing-dau-an", name: "Dầu ăn", purchaseUnit: "Lít", baseUnit: "Ml", conversionFactor: 1000, currentStock: 10, minStock: 2, purchasePrice: 55000, costPerBaseUnit: 55 } }),
  ]);
  console.log(`✅ Ingredients (${ingredients.length})`);

  // ========== RECIPES (Định lượng món) ==========
  const recipeData: { productSlug: string; items: { ingredientId: string; quantity: number; unitId: string }[] }[] = [
    { productSlug: "com-tam-suon", items: [
      { ingredientId: "ing-thit-heo", quantity: 200, unitId: uGam.id },
      { ingredientId: "ing-com", quantity: 250, unitId: uGam.id },
      { ingredientId: "ing-trung", quantity: 1, unitId: uCai.id },
      { ingredientId: "ing-gia-vi", quantity: 10, unitId: uGam.id },
      { ingredientId: "ing-dau-an", quantity: 15, unitId: uMl.id },
    ]},
    { productSlug: "pho-bo", items: [
      { ingredientId: "ing-thit-bo", quantity: 150, unitId: uGam.id },
      { ingredientId: "ing-banh-pho", quantity: 200, unitId: uGam.id },
      { ingredientId: "ing-rau-thom", quantity: 30, unitId: uGam.id },
      { ingredientId: "ing-gia-vi", quantity: 15, unitId: uGam.id },
    ]},
    { productSlug: "bun-bo-hue", items: [
      { ingredientId: "ing-thit-bo", quantity: 120, unitId: uGam.id },
      { ingredientId: "ing-thit-heo", quantity: 80, unitId: uGam.id },
      { ingredientId: "ing-bun", quantity: 200, unitId: uGam.id },
      { ingredientId: "ing-gia-vi", quantity: 15, unitId: uGam.id },
    ]},
    { productSlug: "com-ga-xoi-mo", items: [
      { ingredientId: "ing-ga", quantity: 250, unitId: uGam.id },
      { ingredientId: "ing-com", quantity: 250, unitId: uGam.id },
      { ingredientId: "ing-dau-an", quantity: 20, unitId: uMl.id },
      { ingredientId: "ing-gia-vi", quantity: 10, unitId: uGam.id },
    ]},
    { productSlug: "mi-xao-hai-san", items: [
      { ingredientId: "ing-tom", quantity: 100, unitId: uGam.id },
      { ingredientId: "ing-mi", quantity: 200, unitId: uGam.id },
      { ingredientId: "ing-rau-thom", quantity: 20, unitId: uGam.id },
      { ingredientId: "ing-dau-an", quantity: 20, unitId: uMl.id },
      { ingredientId: "ing-gia-vi", quantity: 10, unitId: uGam.id },
    ]},
    { productSlug: "bo-luc-lac", items: [
      { ingredientId: "ing-thit-bo", quantity: 300, unitId: uGam.id },
      { ingredientId: "ing-dau-an", quantity: 25, unitId: uMl.id },
      { ingredientId: "ing-gia-vi", quantity: 15, unitId: uGam.id },
    ]},
    { productSlug: "cha-gio", items: [
      { ingredientId: "ing-thit-heo", quantity: 150, unitId: uGam.id },
      { ingredientId: "ing-tom", quantity: 50, unitId: uGam.id },
      { ingredientId: "ing-dau-an", quantity: 30, unitId: uMl.id },
      { ingredientId: "ing-gia-vi", quantity: 10, unitId: uGam.id },
    ]},
    { productSlug: "goi-cuon", items: [
      { ingredientId: "ing-tom", quantity: 60, unitId: uGam.id },
      { ingredientId: "ing-thit-heo", quantity: 80, unitId: uGam.id },
      { ingredientId: "ing-rau-thom", quantity: 20, unitId: uGam.id },
    ]},
    { productSlug: "sup-cua", items: [
      { ingredientId: "ing-tom", quantity: 50, unitId: uGam.id },
      { ingredientId: "ing-trung", quantity: 1, unitId: uCai.id },
      { ingredientId: "ing-gia-vi", quantity: 10, unitId: uGam.id },
    ]},
    { productSlug: "nuoc-cam-ep", items: [
      { ingredientId: "ing-cam", quantity: 300, unitId: uGam.id },
      { ingredientId: "ing-duong", quantity: 10, unitId: uGam.id },
    ]},
    { productSlug: "ca-phe-den", items: [
      { ingredientId: "ing-ca-phe", quantity: 25, unitId: uGam.id },
    ]},
    { productSlug: "ca-phe-sua", items: [
      { ingredientId: "ing-ca-phe", quantity: 25, unitId: uGam.id },
      { ingredientId: "ing-sua-dac", quantity: 0.05, unitId: uLon.id },
    ]},
    { productSlug: "bac-xiu", items: [
      { ingredientId: "ing-ca-phe", quantity: 15, unitId: uGam.id },
      { ingredientId: "ing-sua-dac", quantity: 0.08, unitId: uLon.id },
    ]},
  ];

  for (const r of recipeData) {
    const product = await db.product.findUniqueOrThrow({ where: { slug: r.productSlug } });
    for (const item of r.items) {
      await db.ingredientRecipe.upsert({
        where: { id: `rec-${r.productSlug}-${item.ingredientId}` },
        update: { quantity: item.quantity },
        create: {
          id: `rec-${r.productSlug}-${item.ingredientId}`,
          productId: product.id, ingredientId: item.ingredientId, quantity: item.quantity, unitId: item.unitId,
        },
      });
    }
    // Calculate cost
    await db.product.update({ where: { id: product.id }, data: { costPrice: await calcProductCost(product.id) } });
  }
  console.log(`✅ Recipes (${recipeData.length} products)`);

  // ========== AREAS & TABLES ==========
  const areaT1 = await db.area.upsert({ where: { id: "area-tang1" }, update: { type: "RESTAURANT" }, create: { id: "area-tang1", name: "Tầng 1", type: "RESTAURANT", sortOrder: 1 } });
  const areaT2 = await db.area.upsert({ where: { id: "area-tang2" }, update: { type: "RESTAURANT" }, create: { id: "area-tang2", name: "Tầng 2", type: "RESTAURANT", sortOrder: 2 } });
  const areaSan = await db.area.upsert({ where: { id: "area-san-thuong" }, update: { type: "RESTAURANT" }, create: { id: "area-san-thuong", name: "Sân Thượng", type: "RESTAURANT", sortOrder: 3 } });
  const areaVIP = await db.area.upsert({ where: { id: "area-vip" }, update: { type: "RESTAURANT" }, create: { id: "area-vip", name: "Phòng VIP", type: "RESTAURANT", sortOrder: 4 } });
  const areaTakeaway = await db.area.upsert({ where: { id: "area-takeaway" }, update: {}, create: { id: "area-takeaway", name: "Mang Đi", type: "TAKEAWAY", sortOrder: 5 } });

  // Tầng 1: bàn B01-B10
  for (let i = 1; i <= 10; i++) {
    const name = `B${String(i).padStart(2, "0")}`;
    const cap = [2, 4, 4, 6, 2, 4, 8, 4, 2, 6][i - 1];
    await db.table.upsert({ where: { id: `t-${name}` }, update: {}, create: { id: `t-${name}`, name, areaId: areaT1.id, capacity: cap } });
  }
  // Tầng 2: bàn B11-B18
  for (let i = 11; i <= 18; i++) {
    const name = `B${String(i).padStart(2, "0")}`;
    const cap = [4, 6, 4, 8, 4, 2, 4, 6][i - 11];
    await db.table.upsert({ where: { id: `t-${name}` }, update: {}, create: { id: `t-${name}`, name, areaId: areaT2.id, capacity: cap } });
  }
  // Sân Thượng: S01-S06
  for (let i = 1; i <= 6; i++) {
    const name = `S${String(i).padStart(2, "0")}`;
    await db.table.upsert({ where: { id: `t-${name}` }, update: {}, create: { id: `t-${name}`, name, areaId: areaSan.id, capacity: 4 } });
  }
  // VIP: V01-V04
  for (let i = 1; i <= 4; i++) {
    const name = `V${String(i).padStart(2, "0")}`;
    await db.table.upsert({ where: { id: `t-${name}` }, update: {}, create: { id: `t-${name}`, name, areaId: areaVIP.id, capacity: [8, 10, 6, 12][i - 1] } });
  }
  // Takeaway
  await db.table.upsert({ where: { id: "t-takeaway" }, update: {}, create: { id: "t-takeaway", name: "Takeaway", areaId: areaTakeaway.id, capacity: 0 } });
  console.log("✅ Areas (5) & Tables (29)");

  // ========== PAYMENT METHODS ==========
  await db.paymentMethod.upsert({ where: { code: "CASH" }, update: {}, create: { name: "Tiền mặt", code: "CASH", sortOrder: 1 } });
  await db.paymentMethod.upsert({ where: { code: "BANK_TRANSFER" }, update: {}, create: { name: "Chuyển khoản", code: "BANK_TRANSFER", sortOrder: 2 } });
  await db.paymentMethod.upsert({ where: { code: "MOMO" }, update: {}, create: { name: "Momo", code: "MOMO", sortOrder: 3 } });
  console.log("✅ Payment Methods");

  // ========== CASH FLOW CATEGORIES ==========
  await db.cashFlowCategory.upsert({ where: { id: "inc-sales" }, update: {}, create: { id: "inc-sales", name: "Doanh thu bán hàng", type: "INCOME", sortOrder: 1 } });
  await db.cashFlowCategory.upsert({ where: { id: "inc-other" }, update: {}, create: { id: "inc-other", name: "Thu khác", type: "INCOME", sortOrder: 2 } });
  await db.cashFlowCategory.upsert({ where: { id: "exp-stock" }, update: {}, create: { id: "exp-stock", name: "Nhập nguyên liệu", type: "EXPENSE", sortOrder: 1 } });
  await db.cashFlowCategory.upsert({ where: { id: "exp-salary" }, update: {}, create: { id: "exp-salary", name: "Lương nhân viên", type: "EXPENSE", sortOrder: 2 } });
  await db.cashFlowCategory.upsert({ where: { id: "exp-rent" }, update: {}, create: { id: "exp-rent", name: "Mặt bằng", type: "EXPENSE", sortOrder: 3 } });
  await db.cashFlowCategory.upsert({ where: { id: "exp-other" }, update: {}, create: { id: "exp-other", name: "Chi khác", type: "EXPENSE", sortOrder: 4 } });
  console.log("✅ Cash Flow Categories");

  // ========== SYSTEM MODULES ==========
  await db.systemModule.upsert({ where: { name: "kds" }, update: {}, create: { name: "kds", enabled: false } });
  await db.systemModule.upsert({ where: { name: "inventory" }, update: {}, create: { name: "inventory", enabled: true } });
  await db.systemModule.upsert({ where: { name: "karaoke" }, update: {}, create: { name: "karaoke", enabled: false } });
  console.log("✅ System Modules");

  // ========== SERVICE CHARGES ==========
  // Phí dịch vụ mặc định (luôn áp dụng)
  await db.serviceCharge.upsert({
    where: { id: "sc-service-fee" },
    update: {},
    create: {
      id: "sc-service-fee",
      name: "Phí phục vụ",
      type: "SERVICE_FEE",
      value: 5,
      scope: "ALL",
      applyCondition: "ALL_DAYS",
      isActive: true,
    },
  });
  // Phụ thu ngày Tết
  await db.serviceCharge.upsert({
    where: { id: "sc-holiday" },
    update: {},
    create: {
      id: "sc-holiday",
      name: "Phụ thu ngày Tết",
      type: "FIXED",
      value: 5000,
      scope: "ALL",
      applyCondition: "HOLIDAY",
      isActive: true,
    },
  });
  console.log("✅ Service Charges (Phí phục vụ 5% + Phụ thu Tết 5k)");

  // ========== HOLIDAYS ==========
  const holidays = [
    { name: "Tết Dương Lịch", date: "2026-01-01" },
    { name: "Tết Nguyên Đán (mùng 1)", date: "2026-01-29" },
    { name: "Tết Nguyên Đán (mùng 2)", date: "2026-01-30" },
    { name: "Tết Nguyên Đán (mùng 3)", date: "2026-01-31" },
    { name: "Tết Nguyên Đán (mùng 4)", date: "2026-02-01" },
    { name: "Tết Nguyên Đán (mùng 5)", date: "2026-02-02" },
    { name: "Giỗ Tổ Hùng Vương", date: "2026-04-06" },
    { name: "Giải phóng miền Nam (30/4)", date: "2026-04-30" },
    { name: "Quốc tế Lao động (1/5)", date: "2026-05-01" },
    { name: "Quốc khánh (2/9)", date: "2026-09-02" },
    { name: "Quốc khánh (nghỉ bù)", date: "2026-09-03" },
  ];
  for (const h of holidays) {
    await db.holiday.upsert({ where: { date: new Date(h.date) }, update: {}, create: { ...h, date: new Date(h.date) } });
  }
  console.log("✅ Holidays (11 ngày lễ)");

  // ========== SUMMARY ==========
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Seed hoàn tất!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("   👤 admin / admin123");
  console.log(`   🍽️  ${products.length} món ăn`);
  console.log(`   📦  ${ingredients.length} nguyên liệu`);
  console.log(`   📋  ${recipeData.length} định lượng món`);
  console.log(`   🏠  5 khu vực, 29 bàn`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

async function calcProductCost(productId: string): Promise<number> {
  const recipes = await db.ingredientRecipe.findMany({ where: { productId }, include: { ingredient: true } });
  return recipes.reduce((sum, r) => sum + r.ingredient.costPerBaseUnit * r.quantity, 0);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
