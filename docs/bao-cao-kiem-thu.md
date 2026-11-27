# Báo cáo kiểm tra (cập nhật 27/11/2026)

## Môi trường

- Node.js 22; Google Chrome thật điều khiển bằng Playwright (Python); máy chủ tĩnh `python3 -m http.server`.
- Kiểm tra toàn bộ site đã ghép (3 trang), không còn kiểm tra riêng từng phần.

## Cách chạy lại

```bash
node --test tests/*.test.js            # test logic (Node)
python3 demo-server.py                 # terminal 1, ở thư mục gốc repo (cổng 8000)
python3 tests/e2e_check.py             # terminal 2; đặt CEE_CHROME nếu cần chỉ Chrome cụ thể
```

## Kết quả đã chạy

| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| Test Node: lọc/tìm kiếm (AI 2), validate form và quy tắc ghi nhận giao dịch (AI 3) | PASS | 30/30 |
| Trang chủ lần đầu: 6 tin có nhãn “Tin demo”, thống kê 0 kg kèm dòng giả định | PASS | e2e |
| Nút xác nhận giao dịch: ghi một lần, thẻ đổi trạng thái, Trang chủ tự cập nhật (12 kg → 13,5 kg), tải lại không cộng trùng | PASS | e2e |
| Đặt lại dữ liệu demo: về 0 kg, xóa tin tự đăng | PASS | e2e |
| Mở bằng file:// hiện cảnh báo hướng dẫn | PASS | xem ảnh chụp |
| `chay-demo.bat` trên Windows thật | NOT RUN | đã thử `demo-server.py` trên Linux, `.js` trả đúng `text/javascript` |
| Đăng tin: form rỗng báo đủ lỗi và không lưu; 3 loại Give/Sell/Exchange; 3 tình trạng | PASS | e2e |
| Ảnh giả lập: chỉ lưu metadata (`mock: true`, `uploaded: false`), không có request mạng | PASS | e2e |
| Đăng tin không ghi vào sổ rác thải | PASS | e2e |
| Trang chủ hiển thị tin mới nhất lên đầu, badge đúng nhãn | PASS | e2e |
| Danh mục: tìm kiếm không dấu, lọc danh mục, lọc khoảng cách, kết hợp, trạng thái rỗng, Enter không tải lại | PASS | e2e |
| Giao dịch chưa xác nhận bị từ chối | PASS | e2e |
| Dữ liệu `localStorage` có bản ghi hỏng không làm vỡ Trang chủ | PASS | chạy thủ công 1 lần, không nằm trong `e2e_check.py` |
| Không cuộn ngang ở 375px (3 trang); không lỗi console; không request ra ngoài | PASS | e2e |
| Xem ảnh chụp desktop và mobile của 3 trang | PASS | xem bằng mắt |
| Firefox, Safari, thiết bị thật, trình đọc màn hình | NOT RUN | |
| Đo độ tương phản màu bằng công cụ chuyên dụng | NOT RUN | |
| Chạy trên GitHub Pages sau khi đẩy code | NOT RUN | |
| Con số rác thải theo công thức chính thức | BLOCKED | Đang dùng giả định minh họa có ghi nhãn (README mục 11) |
| Quy trình giao dịch thật (bên mua/bán) | BLOCKED | Đề không mô tả; demo dùng nút xác nhận trên thẻ (README mục 11) |

## Giới hạn

- Ngoài 6 tin demo có nhãn trong `cee-config.js`, dữ liệu e2e do bài test tự đăng qua form và mất sau mỗi lần chạy (profile trình duyệt mới).
- Công thức rác thải không được kiểm tra vì chưa xác nhận; chỉ kiểm tra cơ chế ghi nhận/cộng tổng bằng quy tắc test trong `tests/unit.test.js` (không phải công thức dự án).
