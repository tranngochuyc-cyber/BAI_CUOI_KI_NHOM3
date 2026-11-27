# Báo cáo kiểm tra AI 1

## Môi trường

- Gói kiểm tra: `ai1-delivery/`
- Runtime: Node.js 22.16.0; Python 3.13; `tinycss2` để parse CSS.
- Chromium/Playwright có sẵn nhưng trình duyệt bị môi trường chặn cả `http://127.0.0.1` lẫn `file://` với `ERR_BLOCKED_BY_ADMINISTRATOR`. Vì vậy không ghi nhận PASS cho kiểm tra giao diện thực tế trên browser.
- Không có repository ứng dụng tổng thể hoặc mã nguồn AI 2/AI 3 trong phiên này.

## Kết quả đã chạy

| Hạng mục | Trạng thái | Bằng chứng / ghi chú |
|---|---|---|
| Cấu trúc thẻ HTML | PASS | Parse HTML; không có thẻ lệch cặp hoặc chưa đóng theo parser kiểm tra |
| Cú pháp các module JavaScript | PASS | `node --check` với toàn bộ file `.js` |
| Ba nhãn condition chính xác | PASS | Test enum bằng Node: `Like new`, `Good`, `Fair`; không có nhãn thứ tư |
| Ba loại hình trao đổi chính xác | PASS | Test enum bằng Node: `Give`, `Sell`, `Exchange` |
| Kiểm tra cấu trúc Product | PASS | Test bản ghi hợp lệ, condition không hợp lệ, timestamp không hợp lệ và null |
| Product provider thiếu / hợp lệ | PASS | Adapter trả trạng thái unavailable khi thiếu provider; đọc danh sách khi provider hợp lệ |
| Waste calculator thiếu / hợp lệ / không hợp lệ | PASS | Adapter trả `null` khi thiếu hoặc giá trị âm; đọc đúng `{ value, unit }` hợp lệ |
| CSS syntax | PASS | `tinycss2` parse thành công `tokens.css`, `home.css`, `product-grid.css` |
| Mở Trang chủ và kiểm tra DOM thực tế | NOT RUN | Chromium bị chặn bởi môi trường (`ERR_BLOCKED_BY_ADMINISTRATOR`) |
| Hiển thị thứ tự mới nhất trong browser | NOT RUN | Cần browser DOM; chưa thể kiểm tra trong môi trường này |
| Responsive layout trực quan | NOT RUN | Cần browser render; chưa thể kiểm tra trong môi trường này |
| AI 2 dùng lại component/CSS | BLOCKED | Chưa có file AI 2 để tích hợp chéo |
| AI 3 cung cấp waste calculator thực | BLOCKED | Chưa có module AI 3 hoặc schema chính thức được xác nhận |
| Nguồn dữ liệu sản phẩm dùng chung | BLOCKED | Chưa có provider hoặc chủ sở hữu repository được nhóm xác nhận |
| Ghép vào ứng dụng gốc | BLOCKED | Chỉ nhận được `README.md`, không có mã nguồn dự án |

## Giới hạn kiểm tra

- Không có dữ liệu sản phẩm mẫu được đóng gói hoặc hiển thị mặc định.
- Các test contract dùng fixture chỉ trong tiến trình kiểm thử; không ghi fixture vào app.
- Không kiểm tra công thức, đơn vị hoặc điều kiện giao dịch thành công vì đây là phần AI 3 và README đánh dấu chưa xác định.
- Không kiểm tra chức năng tìm kiếm/lọc hoặc form đăng tin vì ngoài phạm vi AI 1.
