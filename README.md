# Web Tính Tiền Lời Hàng Tháng

Ứng dụng web quản lý doanh thu, giá vốn và tính tiền lời hàng tháng trực quan, nhanh chóng và chính xác.

## ✨ Các tính năng nổi bật

1. **Quản lý không gian riêng biệt từng người dùng (Multi-User Profile)**:
   - Dễ dàng tạo thêm người dùng, đổi tên hoặc chuyển đổi nhanh.
   - Dữ liệu mỗi người được lưu hoàn toàn độc lập, không lẫn lộn với người khác.
   - Thống kê, bộ lọc tháng và file xuất chỉ hiển thị riêng cho người đó.

2. **Hỗ trợ Số lượng sản phẩm & Tự động nhân tương ứng**:
   - Nhập số lượng từng mặt hàng (ví dụ: `2 s75 trắng`).
   - Tự động tính:
     - `Tổng vốn = Số lượng x Đơn giá nhập`
     - `Tổng bán = Số lượng x Đơn giá bán`
     - `Tổng lời = Tổng bán - Tổng vốn`

3. **Xuất file Excel (.xls) & CSV chuẩn đẹp, dễ tính**:
   - Chia rõ ràng 4 cột số liệu chính: **Đơn giá nhập**, **Tổng tiền nhập**, **Đơn giá bán**, **Tổng tiền bán**, **Tổng tiền lời**.
   - Có cột **Tên sản phẩm** và **Số lượng** chi tiết.
   - **Hàng TỔNG CỘNG ở cuối bảng**: tổng hợp rõ ràng `Tổng số lượng SP`, `Tổng tiền nhập`, `Tổng tiền bán`, `Tổng tiền lời` và tỷ suất lợi nhuận.
   - Định dạng ngày chuẩn không bị lỗi `########` trong Excel.

4. **Đọc tự động từ file Notepad (.txt) hoặc dán ghi chú**:
   - Tự động bóc tách cú pháp tự nhiên thường dùng:
     `2 s75 trắng: 543.600đ (bán 800k lời 256.400đ) =`
     `1 f75 490k ( bán 750k lời 260k)`
     `1 s75 đen contour: 479k + 36k keycape (lời 285k )`
   - Tự động nhận diện số lượng, giá vốn (kể cả phép cộng `+`), giá bán, tiền lời.

5. **Không cần cài đặt, không cần chạy ngầm**:
   - Hoàn toàn là web tĩnh (HTML/CSS/JS thuần).
   - Có thể bật GitHub Pages để dùng trên điện thoại, máy tính bảng hoặc bất kỳ máy tính nào.

## 🚀 Cách bật GitHub Pages để dùng online mọi lúc mọi nơi

1. Vào repository trên GitHub: `https://github.com/le1787604-sketch/web-tinh-tien-`
2. Bấm vào tab **Settings** (Cài đặt) -> Chọn mục **Pages** ở menu bên trái.
3. Ở phần **Build and deployment** -> **Branch**:
   - Chọn nhánh **main**
   - Thư mục: **/ (root)**
   - Bấm **Save**.
4. Chờ khoảng 1 - 2 phút, GitHub sẽ cung cấp đường link website online:
   👉 `https://le1787604-sketch.github.io/web-tinh-tien-/`