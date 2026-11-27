# Báo cáo kiểm thử (cập nhật 27/11/2026)

## Môi trường

- Node.js 22 (unit test).
- Google Chrome thật điều khiển bằng Playwright (Python), chạy **2 cách mở website**: qua máy chủ tĩnh (`http://`) và mở trực tiếp file HTML (`file://`).
- 3 kích thước màn hình: 375 px (điện thoại), 768 px (máy tính bảng), 1280 px (máy tính).

## Cách chạy lại

```bash
node --test tests/*.test.js                 # 38 test logic
python -m http.server 8765                  # terminal 1, ở thư mục gốc repo
python tests/e2e_check.py                   # terminal 2: 88 kiểm tra (44 qua http + 44 qua file://)
```

## Kết quả

| Nhóm kiểm tra | Nội dung | Kết quả |
|---|---|---|
| Logic lọc (Nhật) | Tìm không dấu, lọc danh mục / tình trạng / loại hình / khoảng cách, kết hợp AND, sắp xếp mới nhất / gần nhất, không sửa mảng gốc | PASS |
| Logic đăng tin (Khoa) | Bắt buộc 5 trường; tên ≥ 3 ký tự, mô tả ≥ 10 ký tự; khoảng cách 0–100; file phải là ảnh ≤ 5 MB; ảnh `uploaded = false` | PASS |
| Logic rác thải (Khoa) | Chỉ ghi khi `transactionConfirmed === true`; chống trùng; chỉ nhận Give/Sell/Exchange; thiếu dữ liệu → không hiện số | PASS |
| Trang chủ | 8 tin mới có nhãn "Tin demo"; widget 0 kg; badge Like new/Good/Fair + Tặng/Bán/Đổi; thẻ semantic; lối tắt danh mục | PASS |
| Đăng tin | Form rỗng báo 5 lỗi, ô đỏ, focus ô đầu; lỗi định dạng hiện ngay khi gõ và biến mất khi sửa đúng; từ chối file không phải ảnh; ảnh xem trước; tin vừa đăng hiện ngay; đăng tin không cộng rác thải | PASS |
| Danh mục | 11 sản phẩm; tìm real-time; từng bộ lọc và kết hợp; thông báo khi không có kết quả; nút Xóa bộ lọc; sắp xếp; mở sẵn lọc qua URL | PASS |
| Giao dịch | Thẻ chuyển "Đã giao dịch" kèm kg ước tính; Trang chủ ở **tab khác tự cập nhật** 12 kg; xác nhận thêm → 13 kg và biểu đồ 2 danh mục; tải lại không cộng trùng | PASS |
| Đặt lại demo | Về 0 kg, còn 8 tin demo | PASS |
| Responsive | 3 trang × 3 kích thước không cuộn ngang | PASS |
| Console | 0 lỗi, 0 request ra ngoài (cả `http://` và `file://`) | PASS |

**Tổng:** 38/38 unit test PASS · 88/88 kiểm tra trình duyệt PASS.

## Lỗi đã phát hiện và sửa trong quá trình kiểm thử

1. **Mở file trực tiếp không có dữ liệu:** ES module bị trình duyệt chặn với `file://`. Đã chuyển sang script thường + namespace `window.CEE`.
2. **Mất cú bấm ở trang Danh mục:** ô tìm kiếm mất focus phát sự kiện `change`, lưới bị vẽ lại đúng lúc bấm nút. Đã sửa để chỉ vẽ lại khi điều kiện lọc thay đổi (`js/ui/category.js`, hàm `update`).

## Chưa kiểm tra (NOT RUN)

- Firefox, Safari, thiết bị thật, trình đọc màn hình.
- GitHub Pages sau khi merge vào `main`.
