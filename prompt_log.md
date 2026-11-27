# PHỤ LỤC 2 — NHẬT KÝ ĐỒNG HÀNH CÙNG AI (PROMPT LOG)

**Học phần:** Thiết kế Web – Trường Đại học Lạc Hồng (LHU)

**Tên nhóm:** Nhóm 3 &nbsp;&nbsp;&nbsp; **Lớp:** 25CT113 *(cần kiểm tra lại)*

**Tên dự án:** Circular Economy Exchange — Sàn trao đổi Đồ cũ & Tái chế (Đề tài 2.5.2)

---

## 1. Thông tin công cụ AI sử dụng

| Hạng mục | Công cụ | Người dùng |
|---|---|---|
| Công cụ chính | Claude (Anthropic) trên claude.ai, có kết nối GitHub và chạy thử bằng trình duyệt Chrome | Trần Ngọc Huy (tích hợp, kiểm thử, tài liệu) |
| Công cụ chính | *Chưa có dữ liệu — Nhật bổ sung tên AI đã dùng* | Nguyễn Minh Nhật (AI 2) |
| Công cụ chính | *Chưa có dữ liệu — Khoa bổ sung tên AI đã dùng* | Lê Văn Khoa (AI 3) |
| Công cụ hỗ trợ code | VS Code, Chrome DevTools (Inspect / Console) | Cả nhóm |
| Công cụ tạo hình ảnh / nội dung | Không dùng (logo và biểu tượng vẽ bằng SVG thủ công) | — |

> Cách làm: nhóm viết một README phân công chung, chia dự án thành **3 phần độc lập**. Mỗi thành viên giao đúng phần của mình cho **một AI riêng** để làm song song, sau đó nhóm trưởng dùng AI để ghép và kiểm thử.

## 2. Nhật ký quá trình thực hiện (các Prompt quan trọng)

| Giai đoạn | Mục tiêu | Nội dung Prompt | Kết quả & Tùy chỉnh của nhóm |
|---|---|---|---|
| **Khởi tạo** | Viết README phân công 3 phần, tránh 2 AI làm trùng một chức năng | *(Tóm tắt — nhóm bổ sung nguyên văn)* Yêu cầu AI viết README theo đúng ảnh đề bài, chia 3 phần độc lập cho 3 AI làm song song, ghi rõ những điểm đề bài chưa xác định để không tự bịa. | AI tạo bảng phân quyền và 3 prompt giao việc. Nhóm giữ nguyên 3 nhãn tình trạng và 3 loại hình đúng đề, thêm mục "Những điểm đề bài chưa xác định" để AI không tự đặt công thức. |
| **Giao diện** (Huy – AI 1) | Trang chủ, Product Grid, Badges | *"Bạn phụ trách AI 1… chỉ triển khai: Trang chủ hiển thị các mặt hàng mới đăng, Product Grid chuyên nghiệp bằng HTML5 và CSS3, Badges với đúng ba nhãn Like new, Good, Fair, khu vực hiển thị tổng lượng rác thải. Nếu module chưa có dữ liệu hợp lệ, hiển thị trạng thái chưa có dữ liệu; tuyệt đối không tạo số liệu giả."* | AI dựng lưới card và badge màu. Lúc đầu AI chưa có code của 2 bạn nên chỉ để trạng thái "Chưa có dữ liệu"; nhóm giữ nguyên để không có số giả. |
| **Tính năng** (Nhật – AI 2) | Tìm kiếm và lọc | *"Bạn phụ trách AI 2… JavaScript tìm kiếm sản phẩm, bộ lọc theo danh mục, bộ lọc theo khoảng cách. Không tạo Product Grid thứ hai… Không tự thêm bộ lọc giá… Nếu thiếu quy tắc, ghi NEED CONFIRMATION."* | AI viết hàm lọc thuần bằng `filter`, tìm không phân biệt dấu tiếng Việt (`normalize('NFD')`), kèm 12 unit test. Ban đầu dùng dữ liệu giả để test vì chưa có Product Grid của AI 1. |
| **Tính năng** (Khoa – AI 3) | Form đăng tin và hàm tính rác thải | *"Bạn phụ trách AI 3… Đề bài không cung cấp công thức, đơn vị, khối lượng hoặc hệ số quy đổi lượng rác thải. Không được tự bịa công thức hoặc số liệu. Hãy tách riêng hàm tính toán… Chỉ ghi nhận khi giao dịch có tín hiệu xác nhận thành công; không tính khi chỉ mới đăng tin."* | AI viết module có sổ giao dịch, chống ghi trùng theo `transactionId`, chỉ nhận `transactionConfirmed === true`, kèm 15 unit test. Công thức để trống chờ nhóm chốt. |
| **Tích hợp** | Ghép 3 phần thành 1 website | *"Truy cập repo… đọc các file đã tải lên. Fix lại website đúng theo yêu cầu trong file readme: phần AI 1 là tôi (nhóm trưởng) làm, phần AI 2 là Nguyễn Minh Nhật, phần AI 3 là Lê Văn Khoa. Sau khi sửa xong cập nhật README."* | AI giải nén bản nộp `.zip`/`.rar` của 2 bạn, viết lớp nối dữ liệu chung, nối trang Danh mục vào Product Grid thật. Nhóm kiểm tra lại không có ai bị sửa sai phạm vi. |
| **Hoàn thiện demo** | Website không trống khi thuyết trình, luồng giao dịch rõ ràng | *"Bổ sung dữ liệu demo có nhãn rõ ràng… Hoàn thiện luồng demo: Đăng tin → Trang chủ cập nhật → Tìm kiếm/lọc → Hiển thị lượng rác thải giảm ước tính… Không tạo dữ liệu giả gây hiểu nhầm."* | AI thêm tin demo có nhãn "Tin demo" và nút "Xác nhận giao dịch". Nhóm chốt công thức **ước tính theo khối lượng trung bình từng danh mục** và yêu cầu ghi rõ chữ "ước tính" trên giao diện. |
| **Nâng cấp** | Đạt mức Giỏi theo rubric Phụ lục 4 | *"Rà soát và nâng cấp toàn bộ dự án đạt chuẩn mức GIỎI theo đề tài 2.5.2 và các Phụ lục 1–4… Chia module rõ ràng (data.js, logic, ui), dùng map/filter, Console sạch 0 lỗi (kể cả khi mở trực tiếp file HTML)… Chạy kiểm thử lại toàn bộ luồng."* | Tổ chức lại thư mục theo Phụ lục 3; thêm lọc tình trạng/loại hình, sắp xếp, ảnh xem trước, widget thống kê và biểu đồ thanh CSS; viết lại README và nhật ký này. |
| **Sửa lỗi** | Website trắng dữ liệu khi bấm đúp mở file HTML | *(Phát hiện khi chạy kiểm thử theo yêu cầu ở dòng "Nâng cấp": "…Console sạch 0 lỗi (kể cả khi chạy offline mở trực tiếp file HTML)")* | Khi mở `index.html` bằng `file://`, Trang chủ và Danh mục không có dữ liệu. AI giải thích trình duyệt chặn **ES module** (`type="module"`) trong trường hợp này. Nhóm chọn chuyển sang script thường + namespace `window.CEE` thay vì bắt người xem cài máy chủ. Sau khi sửa, Console 0 lỗi. |
| **Sửa lỗi** | Bấm "Xác nhận giao dịch" ở trang Danh mục không có tác dụng | *(Phát hiện bởi bài kiểm thử tự động `tests/e2e_check.py`: gõ tìm kiếm rồi bấm nút trên thẻ thì giao dịch không được ghi.)* | AI phát hiện khi ô tìm kiếm mất focus, sự kiện `change` làm lưới bị vẽ lại đúng lúc đang bấm, nên nút cũ biến mất. Sửa bằng cách chỉ vẽ lại khi điều kiện lọc thật sự thay đổi. Đã có test tự động cho lỗi này. |

## 3. Những bài học kinh nghiệm khi dùng AI

- **Câu lệnh (Prompt) hiệu quả nhất mà nhóm đúc kết được:** prompt phải nêu rõ **phạm vi được làm và KHÔNG được làm**, cùng cách xử lý khi thiếu thông tin. Ví dụ: *"Chỉ triển khai… Không tạo Product Grid thứ hai… Nếu thiếu quy tắc, ghi NEED CONFIRMATION thay vì tự suy diễn."* Nhờ vậy 3 AI làm song song mà không ghi đè code của nhau, và không tự bịa số liệu.
- **Khó khăn khi làm việc với AI:**
  - Mỗi AI tự đặt tên trường dữ liệu khác nhau (`distance` là số hay đối tượng), nên khi ghép phải thống nhất lại một cấu trúc chung.
  - AI dễ tự "sáng tác" công thức và số liệu nếu đề không cho sẵn, nên nhóm phải cấm rõ trong prompt.
  - AI hay viết code "đúng chuẩn" nhưng không chạy khi mở file trực tiếp (ES module), nên phải nói rõ môi trường demo.
  - Code AI viết đôi khi dài và nhiều lớp, nên nhóm yêu cầu viết lại đơn giản, chia file theo người phụ trách.
- **Cách nhóm kiểm tra độ chính xác của code AI:**
  - Mở **Chrome DevTools (Console)** trên cả 3 trang, chạy cả khi mở file trực tiếp lẫn qua máy chủ: 0 lỗi.
  - Viết **unit test** cho các hàm thuần (lọc, sắp xếp, validation, tính rác thải): `node --test tests/*.test.js`, 38 test.
  - Chạy **kiểm thử tự động bằng Chrome thật** cho toàn bộ luồng và 3 kích thước màn hình: `tests/e2e_check.py`, 88 kiểm tra.
  - Hỏi AI giải thích từng đoạn code quan trọng (hàm `filterProducts`, `recordConfirmedTransaction`, `getStats`) trước khi đưa vào bài.

## 4. Cam kết của nhóm

> Mỗi thành viên tự đánh dấu sau khi đã thực sự đọc và chỉnh sửa code.

- [ ] Nhóm đã đọc và hiểu rõ ít nhất 80% mã nguồn do AI tạo ra.
- [ ] Nhóm đã tự tay chỉnh sửa lại giao diện (màu sắc, hình ảnh, nội dung) để phù hợp với thực tế.

| Thành viên | Phần đã đọc hiểu | Xác nhận |
|---|---|---|
| Trần Ngọc Huy | `data.js`, `logic/store.js`, `ui/components.js`, `ui/home.js`, CSS | [ ] |
| Nguyễn Minh Nhật | `logic/filter.js`, `ui/category.js` | [ ] |
| Lê Văn Khoa | `logic/listing.js`, `logic/waste.js`, `ui/post.js` | [ ] |

## 5. Lưu ý

- Ảnh chụp màn hình các đoạn hội thoại với AI và minh chứng sửa lỗi: đặt vào `docs/minh-chung/` *(nhóm bổ sung)*.
- Video demo 3–5 phút theo Phụ lục 1 mục 1.5: *(nhóm bổ sung link)*.
