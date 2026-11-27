# ♻️ Circular Economy Exchange — Sàn trao đổi Đồ cũ & Tái chế

> Đồ án cuối kỳ học phần **Thiết kế Web (111101)** — Trường Đại học Lạc Hồng.
> Đề tài **2.5.2** — nhóm chủ đề *Phát triển bền vững*.

**🔗 Live Demo:** https://tranngochuyc-cyber.github.io/BAI_CUOI_KI_NHOM3/

---

## 1. Thành viên nhóm (Nhóm 3)

| Thành viên | GitHub | Vai trò | Phụ trách |
|---|---|---|---|
| **Trần Ngọc Huy** | [@tranngochuyc-cyber](https://github.com/tranngochuyc-cyber) | **Scrum Master** · Nhóm trưởng | Trang chủ, Product Grid, Badges, widget thống kê, lớp dữ liệu chung (`data.js`, `store.js`), tích hợp và kiểm thử |
| **Nguyễn Minh Nhật** | [@nhatlatao01-del](https://github.com/nhatlatao01-del) | Dev Team | Trang Danh mục: tìm kiếm, lọc đa tiêu chí, sắp xếp (`filter.js`, `ui/category.js`) |
| **Lê Văn Khoa** | [@KhoaLe25CT113](https://github.com/KhoaLe25CT113) | Dev Team | Trang Đăng tin, form validation, ảnh giả lập, hàm tính lượng rác thải (`listing.js`, `waste.js`, `ui/post.js`) |

## 2. Vấn đề và giải pháp

**Vấn đề:** Nhiều món đồ còn dùng được (sách, quần áo, đồ gia dụng, nội thất) bị vứt bỏ khi chủ không còn nhu cầu, trong khi người khác lại đang cần. Điều này làm tăng lượng rác thải.

**Giải pháp:** Một website giúp mọi người **đăng, tìm và trao đổi đồ cũ** theo 3 hình thức **Tặng / Bán / Đổi**. Mỗi giao dịch thành công là một món đồ được kéo dài vòng đời. Website tự tính **lượng rác thải cộng đồng đã giảm thiểu** và hiển thị ngay trên Trang chủ.

### Đáp ứng yêu cầu đề tài 2.5.2

| Yêu cầu của đề | Cách nhóm thực hiện |
|---|---|
| HTML5 & CSS3: Product Grid chuyên nghiệp | Thẻ semantic (`header`, `nav`, `main`, `section`, `article`, `aside`, `footer`); lưới **CSS Grid** `auto-fill`, tự chuyển 4 → 3 → 2 → 1 cột; biến màu dùng chung trong `:root` |
| Badges tình trạng *Like new / Good / Fair* | Badge màu riêng cho từng tình trạng, kèm badge loại hình **Tặng / Bán / Đổi** |
| JS: tìm kiếm và lọc theo danh mục hoặc khoảng cách | Tìm không dấu theo thời gian thực; lọc danh mục, **tình trạng, loại hình, khoảng cách**, sắp xếp mới nhất/gần nhất (dùng `filter`, `map`, `sort`, `reduce`) |
| JS: hàm tính "Lượng rác thải đã giảm thiểu" khi giao dịch thành công | `waste.js`: chỉ ghi nhận khi `transactionConfirmed === true`, chống ghi trùng; lượng rác = khối lượng ước tính theo danh mục |
| Trang chủ: mặt hàng mới + thống kê rác thải | Widget tổng kg, số giao dịch, số món chờ trao đổi, biểu đồ thanh theo danh mục; **tự cập nhật** khi có giao dịch (kể cả ở tab khác) |
| Trang Danh mục: lọc và tìm kiếm nhiều tiêu chí | 5 tiêu chí + sắp xếp + nút xóa bộ lọc + lối tắt từ Trang chủ (`category.html?category=...`) |
| Trang Đăng tin: mô tả, ảnh giả lập, Tặng/Bán/Đổi | Form có validation trực quan (ô đỏ, thông báo lỗi, focus ô sai), xem trước ảnh, tin mới hiện ngay trên mọi trang |

> **Giả định của nhóm:** đề không cho công thức rác thải, nên nhóm ước tính theo **khối lượng trung bình của từng danh mục** (ví dụ Nội thất 12 kg, Quần áo 0,6 kg). Đề cũng không quy định đơn vị khoảng cách, danh mục hay backend. Các giá trị này nằm trong `js/data.js`. **8 tin demo** luôn có nhãn "Tin demo". Dữ liệu người dùng lưu bằng `localStorage`, không có máy chủ.

## 3. Hướng dẫn chạy

- **Live Demo:** mở https://tranngochuyc-cyber.github.io/BAI_CUOI_KI_NHOM3/
- **Chạy trên máy, không cần mạng:** tải repo về rồi **bấm đúp `index.html`**. Website không dùng ES module, `fetch` hay CDN nên chạy được trực tiếp bằng `file://` và không có lỗi console.
- **Đặt lại dữ liệu demo:** bấm nút "Đặt lại dữ liệu demo" ở cuối Trang chủ.

**Kịch bản demo (3–4 phút):** Trang chủ (0 kg) → *Đăng tin* một món có ảnh, thử bỏ trống để thấy báo lỗi → tin hiện ngay ở "Tin bạn đã đăng" → *Danh mục*: gõ không dấu "ghe", lọc tình trạng/loại hình/khoảng cách → bấm **✓ Xác nhận giao dịch** → quay lại Trang chủ thấy số kg và biểu đồ tăng.

## 4. Cấu trúc thư mục (theo Phụ lục 3)

```text
BAI_CUOI_KI_NHOM3/
├── assets/images/logo.svg      # logo, favicon
├── css/
│   ├── styles.css              # biến :root, nút, form, badges, Product Grid
│   ├── layout.css              # header, điều hướng, footer
│   └── pages.css               # phần riêng Trang chủ / Danh mục / Đăng tin
├── js/
│   ├── data.js                 # dữ liệu dùng chung (danh mục, tin demo, hệ số rác thải)
│   ├── logic/                  # xử lý dữ liệu, không đụng giao diện
│   │   ├── filter.js           # tìm kiếm, lọc, sắp xếp          (Nhật)
│   │   ├── listing.js          # validation + lưu tin đăng       (Khoa)
│   │   ├── waste.js            # tính lượng rác thải giảm thiểu  (Khoa)
│   │   └── store.js            # gộp dữ liệu, thống kê, sự kiện  (Huy)
│   └── ui/                     # giao diện từng trang
│       ├── components.js       # Product Grid, badges, thông báo (Huy)
│       ├── home.js             # Trang chủ                       (Huy)
│       ├── category.js         # Trang Danh mục                  (Nhật)
│       └── post.js             # Trang Đăng tin                  (Khoa)
├── docs/                       # tài liệu thiết kế, phân công, báo cáo kiểm thử, bản nộp gốc
├── tests/                      # kiểm thử tự động (Node + Chrome)
├── index.html                  # Trang chủ
├── category.html               # Trang Danh mục sản phẩm
├── post.html                   # Trang Đăng tin
├── README.md
└── prompt_log.md               # Nhật ký đồng hành cùng AI (Phụ lục 2)
```

Thiết kế chi tiết (sơ đồ trang, cấu trúc dữ liệu, luồng sự kiện): [`docs/thiet-ke.md`](docs/thiet-ke.md).

## 5. Prompt nổi bật

Danh sách đầy đủ trong [`prompt_log.md`](prompt_log.md).

1. **Chia việc cho 3 AI, không chồng chéo:**
   *"Bạn phụ trách AI 2 của dự án Circular Economy Exchange. Đọc README.md và chỉ triển khai: Trang Danh mục sản phẩm, hiển thị bằng Product Grid dùng chung của AI 1, tìm kiếm, lọc theo danh mục, lọc theo khoảng cách. Không tạo Product Grid thứ hai… Nếu thiếu quy tắc, ghi NEED CONFIRMATION."*
2. **Không để AI bịa số liệu:**
   *"Đề bài không cung cấp công thức, đơn vị, khối lượng hoặc hệ số quy đổi lượng rác thải. Không được tự bịa công thức hoặc số liệu. Hãy tách riêng hàm tính toán, ghi rõ dữ liệu đầu vào cần có… Chỉ ghi nhận khi giao dịch có tín hiệu xác nhận thành công; không tính khi chỉ mới đăng tin."*
3. **Ghép 3 phần làm thành website hoàn chỉnh:**
   *"Truy cập repo… đọc các file đã tải lên. Fix lại website đúng theo yêu cầu trong file readme: phần AI 1 là tôi (nhóm trưởng) làm, phần AI 2 là Nguyễn Minh Nhật, phần AI 3 là Lê Văn Khoa."*
4. **Chuẩn bị demo nhưng không gây hiểu nhầm:**
   *"Bổ sung dữ liệu demo có nhãn rõ ràng để website không bị trống khi trình bày… Không thêm tính năng dư thừa, không tạo dữ liệu giả gây hiểu nhầm và không làm phức tạp code."*
5. **Đối chiếu với rubric để nâng chất lượng:**
   *"Rà soát và nâng cấp toàn bộ dự án đạt chuẩn mức GIỎI theo đề tài 2.5.2 và các Phụ lục 1–4… đảm bảo Console sạch 0 lỗi (kể cả khi chạy offline mở trực tiếp file HTML)… chạy kiểm thử lại toàn bộ luồng chức năng."*

## 6. Kiểm thử

| Bộ kiểm thử | Lệnh | Kết quả |
|---|---|---|
| Logic (Node): lọc, sắp xếp, validation, tính rác thải | `node --test tests/*.test.js` | 38/38 PASS |
| Trình duyệt (Chrome thật, cả `http://` và `file://`): đăng tin, validation, lọc, giao dịch, cập nhật real-time giữa 2 tab, đặt lại, responsive 375/768/1280 px, console | `python -m http.server 8765` rồi `python tests/e2e_check.py` | 88/88 PASS |

Chi tiết: [`docs/bao-cao-kiem-thu.md`](docs/bao-cao-kiem-thu.md).

## 7. Tầm nhìn dài hạn (ngoài phạm vi học phần)

Truy xuất nguồn gốc sản phẩm bằng Blockchain, định giá đồ cũ bằng AI, kết nối đơn vị vận chuyển xanh (xe điện). Các ý tưởng này **chưa được xây dựng** trong đồ án.
