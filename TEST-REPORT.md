# Báo cáo kiểm tra (cập nhật 27/11/2026)

## Môi trường

- Node.js 22; Google Chrome thật điều khiển bằng Playwright (Python); máy chủ tĩnh `python3 -m http.server`.
- Kiểm tra toàn bộ site đã ghép (3 trang), không còn kiểm tra riêng từng phần.

## Cách chạy lại

```bash
node --test tests/*.test.js            # test logic (Node)
python3 -m http.server 8765            # terminal 1, đặt ở thư mục gốc repo
python3 tests/e2e_check.py             # terminal 2; đặt CEE_CHROME nếu cần chỉ Chrome cụ thể
```

## Kết quả đã chạy

| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| Test Node: lọc/tìm kiếm (AI 2), validate form và quy tắc ghi nhận giao dịch (AI 3) | PASS | 30/30 |
| Trang chủ trống: thống kê “Chưa có dữ liệu”, không có card giả | PASS | e2e |
| Đăng tin: form rỗng báo đủ lỗi và không lưu; 3 loại Give/Sell/Exchange; 3 tình trạng | PASS | e2e |
| Ảnh giả lập: chỉ lưu metadata (`mock: true`, `uploaded: false`), không có request mạng | PASS | e2e |
| Đăng tin không ghi vào sổ rác thải | PASS | e2e |
| Trang chủ hiển thị tin mới nhất lên đầu, badge đúng nhãn | PASS | e2e |
| Danh mục: tìm kiếm không dấu, lọc danh mục, lọc khoảng cách, kết hợp, trạng thái rỗng, Enter không tải lại | PASS | e2e |
| Giao dịch chưa xác nhận bị từ chối; giao dịch xác nhận được ghi sổ nhưng công thức chưa chốt nên Trang chủ không hiện số | PASS | e2e |
| Dữ liệu `localStorage` có bản ghi hỏng không làm vỡ Trang chủ | PASS | chạy thủ công 1 lần, không nằm trong `e2e_check.py` |
| Không cuộn ngang ở 375px (3 trang); không lỗi console; không request ra ngoài | PASS | e2e |
| Xem ảnh chụp desktop và mobile của 3 trang | PASS | xem bằng mắt |
| Firefox, Safari, thiết bị thật, trình đọc màn hình | NOT RUN | |
| Đo độ tương phản màu bằng công cụ chuyên dụng | NOT RUN | |
| Chạy trên GitHub Pages sau khi đẩy code | NOT RUN | |
| Hiển thị một con số rác thải thật | BLOCKED | Chưa có công thức, đơn vị (README mục 5.1) |
| Luồng xác nhận “giao dịch thành công” trên giao diện | BLOCKED | Đề không mô tả (README mục 5.2) |

## Giới hạn

- Dữ liệu trong e2e do bài test tự đăng qua form, xóa sau mỗi lần chạy vì dùng profile trình duyệt mới. Không có dữ liệu mẫu nào được đóng gói trong site.
- Công thức rác thải không được kiểm tra vì chưa xác nhận; chỉ kiểm tra cơ chế ghi nhận/cộng tổng bằng quy tắc test trong `tests/unit.test.js` (không phải công thức dự án).
