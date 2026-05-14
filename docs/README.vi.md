# 🍜 POS-F&B — Hướng Dẫn Sử Dụng

_User Guide | Hướng dẫn sử dụng | 使用指南 | 사용 가이드 | ユーザーガイド_

Mục lục:
1. [Bắt đầu](#1-bắt-đầu)
2. [Bán hàng (Order)](#2-bán-hàng-order)
3. [Quản lý Kho (Inventory)](#3-quản-lý-kho-inventory)
4. [Thu Chi (Cash)](#4-thu-chi-cash)
5. [Báo cáo (Reports)](#5-báo-cáo-reports)
6. [Cấu hình (Settings)](#6-cấu-hình-settings)
7. [In ấn (Printing)](#7-in-ấn-printing)
8. [Đa ngôn ngữ](#8-đa-ngôn-ngữ)
9. [FAQ](#9-faq)

---

## 1. Bắt đầu

### Đăng nhập
Mở trình duyệt → truy cập URL app → nhập tài khoản & mật khẩu → chọn ngôn ngữ nếu muốn.

Tài khoản mặc định: `admin` / `admin123`

### Giao diện chính
- **Sidebar trái**: các module (Tổng quan, Bán hàng, Kho, Thu Chi, Báo cáo, Cấu hình)
- **Header phải**: Language Switcher (đổi ngôn ngữ), nút Logout
- **Dashboard**: thống kê doanh thu, đơn hàng, bàn đang dùng, món bán chạy, timeline hoạt động

---

## 2. Bán hàng (Order)

### 2.1 Mở bàn
1. Vào **Bán hàng**
2. Chọn bàn trống → nhập số khách → bấm **Mở bàn**
3. Bàn đang dùng có màu vàng, bàn trống màu xám

### 2.2 Gọi món
1. Chọn bàn đang dùng → hiển thị panel Order bên phải
2. Tìm món theo danh mục → bấm vào món để thêm
3. Chọn topping nếu có (size, độ ngọt...)
4. Tăng/giảm số lượng, xóa món nếu cần

### 2.3 Gửi bếp
- Bấm **Gửi bếp** → in phiếu order bếp (chỉ có STT, bàn, món × số lượng, KHÔNG có giá)
- Order sẽ tự gửi đến máy in bếp đã cấu hình

### 2.4 Tạm tính
- Bấm **Tạm tính** → in phiếu tạm tính cho khách xem
- Phiếu có đầy đủ: tiền hàng, VAT, giảm giá, phụ thu, tổng tiền

### 2.5 Thanh toán
1. Bấm **Thanh toán**
2. Chọn phương thức (Tiền mặt, Chuyển khoản, Momo...)
3. Nhập số tiền → bấm Xác nhận
4. In bill thanh toán cho khách

### 2.6 Gộp / Tách bàn
- **Gộp bàn**: chọn 2+ bàn đang dùng → bấm Gộp → chọn bàn đích
- **Tách bàn**: chọn bàn có nhiều món → bấm Tách → chọn món cần tách

### 2.7 In Bluetooth (điện thoại/máy tính bảng)
1. Bấm nút Bluetooth trên order panel
2. Trình duyệt hỏi chọn thiết bị → chọn máy in nhiệt
3. Sau khi kết nối, bấm Gửi bếp / In bill

---

## 3. Quản lý Kho (Inventory)

### 3.1 Xem tồn kho
Tab **Tồn kho**: danh sách nguyên liệu, số lượng hiện tại, giá trị tồn

### 3.2 Nhập kho
1. Tab **Nhập kho** → bấm **Nhập kho**
2. Chọn nhà cung cấp → chọn nguyên liệu → nhập số lượng, đơn giá
3. Lưu → tự động cập nhật tồn kho

### 3.3 Xuất kho
1. Tab **Xuất kho** → chọn nguyên liệu → nhập số lượng, lý do
2. Lưu → tự động trừ tồn kho

### 3.4 Cảnh báo tồn thấp
Nguyên liệu dưới mức tối thiểu hiển thị viền vàng. Cấu hình mức tối thiểu trong Settings → Nguyên liệu.

---

## 4. Thu Chi (Cash)

### 4.1 Mở quỹ đầu ca
1. Bấm **Mở quỹ** → nhập số tiền tồn đầu
2. Hệ thống ghi nhận opening balance

### 4.2 Ghi thu / chi
- Bấm nút **+** → chọn Thu hoặc Chi → nhập số tiền, danh mục, mô tả
- Danh sách hiển thị tất cả giao dịch trong ca

### 4.3 Đóng quỹ cuối ca
1. Bấm **Đóng quỹ** → nhập số tiền thực tế
2. Hệ thống so sánh với expected balance → hiển thị chênh lệch

---

## 5. Báo cáo (Reports)

### 5.1 Doanh thu
- Lọc theo: Hôm nay / Tuần này / Tháng này / Tùy chọn
- Hiển thị: tổng doanh thu, tiền hàng, thuế, chi phí, lợi nhuận
- Chart: theo phương thức thanh toán, theo ngày, theo danh mục chi phí

### 5.2 Hóa đơn
- Danh sách tất cả hóa đơn đã thanh toán
- Chi tiết từng hóa đơn: món, số lượng, giá, thuế, chiết khấu

### 5.3 Nguyên liệu
- Nhập kho theo NCC, xuất kho theo lý do
- Chi tiết từng phiếu nhập/xuất

### 5.4 Kho
- Tổng quan kho: số nguyên liệu, giá trị tồn, sản phẩm, NCC
- Cảnh báo nguyên liệu dưới định mức

### 5.5 Xuất Excel
Mỗi tab báo cáo có nút **Xuất Excel** → tải file .xlsx

---

## 6. Cấu hình (Settings)

### 6.1 Cấu hình chung
- Tên nhà hàng, địa chỉ, SĐT, email, mã số thuế
- Chế độ thuế: Đã bao gồm / Chưa bao gồm

### 6.2 Người dùng & Vai trò
- Thêm/sửa/xóa tài khoản nhân viên
- Phân quyền theo JSON

### 6.3 Món ăn
- Thêm món: tên, giá, loại món, VAT, TTĐB, topping group
- Gán nguyên liệu (recipe) để tự động trừ kho

### 6.4 Khu vực & Bàn
- Tạo khu vực: Nhà hàng, Karaoke, Takeaway
- Thêm bàn trong từng khu, cấu hình sức chứa

### 6.5 Khuyến mãi
- Giảm % hoặc số tiền cố định
- Phạm vi: tất cả món hoặc theo loại món
- Điều kiện: ngày, giờ, giá trị đơn tối thiểu, Happy Hour

### 6.6 Phụ thu
- Phí phục vụ, phụ thu ngày lễ, phí takeaway
- Điều kiện áp dụng linh hoạt

### 6.7 Máy in & Mẫu in
- Thêm máy in nhiệt: tên, IP, port, khổ giấy, khu vực in
- Tạo mẫu in: chọn hiển thị/ẩn từng trường cho cả Order (bếp) và Bill (thanh toán)
- Xem preview trực tiếp

### 6.8 Module hệ thống
- Bật/tắt từng module: Orders, Inventory, Reports, Karaoke, KDS
- Module tắt tự ẩn khỏi menu

---

## 7. In ấn (Printing)

### 7.1 Chế độ in
- **Server**: máy in kết nối cùng mạng LAN với server → nhập IP & Port
- **Device**: in từ điện thoại/máy tính bảng qua WiFi/Bluetooth → không cần IP

### 7.2 Cấu hình máy in
1. Settings → Máy in → Thêm máy in
2. Nhập tên, chọn loại (Bếp/Bar/Bill)
3. Chọn chế độ in, nhập IP/Port (nếu Server mode)
4. Chọn khu vực in áp dụng
5. Khổ giấy phổ biến: 58mm hoặc 80mm

### 7.3 Mẫu in
- **Order Ticket (bếp)**: STT, bàn, giờ, món × số lượng, topping, ghi chú
- **Bill (hóa đơn)**: Logo, địa chỉ, SĐT, MST, ngày giờ, số hóa đơn, danh sách món + giá, VAT, giảm giá, phụ thu, tổng tiền, lời cảm ơn

### 7.4 In từ điện thoại (Bluetooth)
- Chrome/Edge trên Android hỗ trợ Web Bluetooth
- iOS: cần app PWA hoặc dùng máy in WiFi

---

## 8. Đa ngôn ngữ

- Chọn ngôn ngữ từ dropdown ở header (hoặc trang login)
- Hỗ trợ: 🇻🇳 Tiếng Việt | 🇬🇧 English | 🇨🇳 中文 | 🇰🇷 한국어 | 🇯🇵 日本語
- Ngôn ngữ được lưu trong localStorage, giữ nguyên sau khi refresh

---

## 9. FAQ

**Q: Quên mật khẩu admin?**  
A: Vào database SQLite → bảng User → đổi password hash (hoặc seed lại database)

**Q: Máy in không in được?**  
A: Kiểm tra: (1) Máy in đã bật, (2) Cùng mạng với server (Server mode), (3) Đúng IP & Port, (4) Khổ giấy khớp

**Q: Đổi tiền tệ từ VND sang USD?**  
A: Sửa `Intl.NumberFormat("vi-VN")` trong code hoặc thêm config currency trong Settings

**Q: Thêm ngôn ngữ mới?**  
A: Copy `src/i18n/vi.ts` → dịch → đăng ký trong `src/i18n/dictionaries.ts` → thêm vào `index.ts`

**Q: Backup dữ liệu?**  
A: Copy file `prisma/dev.db` (SQLite). Để an toàn hơn, migrate sang PostgreSQL.

---

_Cần hỗ trợ thêm? Mở Issue trên GitHub hoặc liên hệ tác giả._
