# Circular Economy Exchange — Sàn trao đổi Đồ cũ & Tái chế

> README này được viết lại theo đúng nội dung trong ảnh yêu cầu môn học. Phạm vi triển khai được chia thành 3 phần độc lập để 3 thành viên sử dụng 3 AI khác nhau làm song song. Đây là tài liệu phân công và đặc tả, không phải xác nhận dự án đã hoàn thành hoặc đã kiểm thử.

## 1. Chủ đề và mục tiêu

**Tên phân hệ:** Sàn trao đổi Đồ cũ & Tái chế (*Circular Economy Exchange*).

Xây dựng một website hỗ trợ trao đổi các sản phẩm đã qua sử dụng, góp phần thúc đẩy kinh tế tuần hoàn bằng cách kéo dài vòng đời sản phẩm và giảm lượng rác thải.

### Tầm nhìn dài hạn

- Tích hợp Blockchain để truy xuất nguồn gốc sản phẩm.
- Sử dụng AI để định giá đồ cũ.
- Kết nối với các đơn vị vận chuyển xanh, ví dụ xe điện.

**Lưu ý:** Đây là tầm nhìn dài hạn được nêu trong đề bài, không mặc nhiên là các chức năng phải xây dựng trong phạm vi bài tập hiện tại.

## 2. Yêu cầu phải có trong đồ án

### 2.1. Công nghệ và giao diện

- **HTML5 và CSS3:** Thiết kế lưới sản phẩm (*Product Grid*) chuyên nghiệp.
- **Badges:** Dùng nhãn để thể hiện tình trạng đồ cũ. Ba nhãn được nêu trong đề:
  - `Like new`
  - `Good`
  - `Fair`

### 2.2. JavaScript

- Xử lý logic tìm kiếm sản phẩm.
- Xử lý bộ lọc sản phẩm theo **danh mục hoặc khoảng cách**.
- Viết hàm tính toán **“Lượng rác thải đã giảm thiểu”** khi người dùng thực hiện một giao dịch thành công.

### 2.3. Ba trang tối thiểu

| Trang | Nội dung bắt buộc |
|---|---|
| **Trang chủ** | Hiển thị các mặt hàng mới đăng và thống kê tổng lượng rác thải cộng đồng đã giảm thiểu. |
| **Trang Danh mục sản phẩm** | Có giao diện tìm kiếm và lọc đồ cũ theo nhiều tiêu chí. Các tiêu chí được nêu cụ thể trong yêu cầu JavaScript là danh mục hoặc khoảng cách. |
| **Trang Đăng tin** | Có form cho người dùng nhập mô tả, tải ảnh theo hình thức giả lập và chọn loại hình trao đổi: `Give`, `Sell` hoặc `Exchange`. |

## 3. Phân chia công việc cho 3 AI

Mỗi thành viên giao đúng phần việc của mình cho một AI riêng. Không để nhiều AI cùng tự xây dựng một chức năng hoặc tự ý sửa phần của thành viên khác.

### AI 1 — Trang chủ, Product Grid và Badges

**Mục tiêu:** Xây dựng phần giao diện hiển thị sản phẩm và trang chủ.

**Phạm vi công việc:**

1. Xây dựng giao diện Trang chủ.
2. Hiển thị các mặt hàng mới đăng.
3. Xây dựng Product Grid chuyên nghiệp bằng HTML5 và CSS3.
4. Thiết kế cách hiển thị thông tin sản phẩm trong lưới.
5. Hiển thị đúng ba nhãn tình trạng:
   - `Like new`
   - `Good`
   - `Fair`
6. Tạo khu vực hiển thị thống kê tổng lượng rác thải cộng đồng đã giảm thiểu. Giá trị phải lấy từ phần tính toán được tích hợp, không tự tạo số liệu.

**Không phụ trách:**

- Logic tìm kiếm và lọc của trang Danh mục sản phẩm.
- Form đăng tin.
- Logic tính lượng rác thải giảm thiểu.

**Kết quả bàn giao:** Trang chủ, Product Grid, Badges và phần hiển thị thống kê cộng đồng.

### AI 2 — Trang Danh mục sản phẩm và tìm kiếm/lọc

**Mục tiêu:** Xây dựng trang giúp người dùng tìm kiếm và lọc các sản phẩm cũ.

**Phạm vi công việc:**

1. Xây dựng giao diện Trang Danh mục sản phẩm.
2. Hiển thị các sản phẩm bằng Product Grid dùng chung do AI 1 xây dựng.
3. Dùng JavaScript xử lý tìm kiếm sản phẩm.
4. Xử lý bộ lọc theo danh mục.
5. Xử lý bộ lọc theo khoảng cách.
6. Đảm bảo có thể kết hợp các điều kiện lọc được yêu cầu và cập nhật danh sách kết quả.

**Không phụ trách:**

- Tạo một Product Grid khác trùng chức năng với AI 1.
- Xây dựng Trang chủ.
- Xây dựng form đăng tin.
- Tính lượng rác thải giảm thiểu.

**Kết quả bàn giao:** Trang Danh mục sản phẩm và logic JavaScript tìm kiếm/lọc theo đúng phạm vi yêu cầu.

### AI 3 — Trang Đăng tin và tính lượng rác thải giảm thiểu

**Mục tiêu:** Xây dựng form đăng sản phẩm và phần logic tính lượng rác thải giảm thiểu.

**Phạm vi công việc:**

1. Xây dựng giao diện Trang Đăng tin.
2. Tạo form cho người dùng nhập mô tả sản phẩm.
3. Tạo chức năng chọn ảnh theo hình thức giả lập.
4. Cho phép chọn đúng ba loại hình trao đổi:
   - `Give`
   - `Sell`
   - `Exchange`
5. Viết hàm tính toán “Lượng rác thải đã giảm thiểu”.
6. Chỉ ghi nhận lượng rác thải giảm thiểu khi có giao dịch được xác nhận thành công.
7. Cung cấp kết quả tính toán để AI 1 hiển thị tổng lượng rác thải cộng đồng đã giảm thiểu trên Trang chủ.

**Không phụ trách:**

- Xây dựng lại Trang chủ hoặc Product Grid.
- Xây dựng logic tìm kiếm/lọc của Trang Danh mục.
- Tự tạo trang thanh toán hoặc quy trình giao dịch mới ngoài yêu cầu.

**Kết quả bàn giao:** Trang Đăng tin, form đúng yêu cầu và module tính lượng rác thải giảm thiểu có thể tích hợp với Trang chủ.

## 4. Quy tắc phối hợp để 3 AI không làm sai hoặc trùng việc

### 4.1. Phân quyền theo chức năng

| Hạng mục | AI chịu trách nhiệm chính | AI còn lại được phép làm gì? |
|---|---|---|
| Trang chủ | AI 1 | Chỉ tích hợp dữ liệu thống kê do AI 3 cung cấp và chức năng liên quan đã thống nhất. |
| Product Grid | AI 1 | AI 2 sử dụng lại, không tạo bản sao. |
| Badges tình trạng sản phẩm | AI 1 | AI 2 hiển thị lại theo dữ liệu sản phẩm, không tự đổi nhãn. |
| Tìm kiếm và lọc theo danh mục/khoảng cách | AI 2 | Không viết lại Product Grid hoặc sửa form đăng tin. |
| Trang Đăng tin | AI 3 | Không sửa cấu trúc Trang chủ hoặc Trang Danh mục. |
| Tính lượng rác thải giảm thiểu | AI 3 | AI 1 chỉ nhận kết quả để hiển thị thống kê. |

### 4.2. Quy tắc dữ liệu và tích hợp

- Ba AI phải thống nhất cách biểu diễn một sản phẩm trước khi tích hợp.
- Dữ liệu sản phẩm cần đủ thông tin để hiển thị Product Grid, nhãn tình trạng và phục vụ tìm kiếm/lọc theo danh mục hoặc khoảng cách.
- Ba nhãn tình trạng phải giữ nguyên: `Like new`, `Good`, `Fair`.
- Ba loại hình trao đổi phải giữ nguyên: `Give`, `Sell`, `Exchange`.
- AI 2 phải dùng chung dữ liệu và Product Grid của AI 1, không tạo dữ liệu hoặc giao diện trùng lặp nếu không có lý do kỹ thuật được nhóm thống nhất.
- AI 3 phải cung cấp kết quả tính lượng rác thải theo một cách rõ ràng để AI 1 có thể hiển thị tổng trên Trang chủ.
- Trước khi sửa file hoặc giao diện thuộc phần của thành viên khác, AI phải báo và thống nhất với người phụ trách.
- Khi thiếu thông tin để triển khai chính xác, AI phải ghi rõ `NEED CONFIRMATION` hoặc `BLOCKED`; không tự suy diễn thành yêu cầu mới.

## 5. Những điểm đề bài chưa xác định — không được tự bịa

Ảnh yêu cầu không cung cấp đủ chi tiết cho một số quy tắc triển khai. Nhóm cần xác nhận các điểm sau trước khi chốt hành vi thực tế:

1. **Công thức lượng rác thải giảm thiểu:** Chưa có công thức, đơn vị đo, dữ liệu khối lượng hoặc hệ số quy đổi. AI 3 không được tự đặt hệ số hay tự tuyên bố một giao dịch tương ứng với một số kg rác thải. Cần xin quy tắc từ giảng viên hoặc thống nhất một giả định demo có ghi nhãn rõ ràng.
2. **Điều kiện xác định giao dịch thành công:** Ảnh yêu cầu chỉ tính khi giao dịch thành công nhưng không mô tả quy trình hoặc tín hiệu xác nhận thành công. Không được tự thêm hệ thống thanh toán hay quy trình giao dịch phức tạp; cần xác định điểm kích hoạt trước khi tích hợp.
3. **Khoảng cách:** Chưa nêu đơn vị, vị trí tham chiếu hoặc cách xác định khoảng cách. Không được tuyên bố có định vị GPS hoặc khoảng cách thực tế nếu chưa xây dựng và xác minh chức năng đó.
4. **Danh mục sản phẩm:** Ảnh không liệt kê các giá trị danh mục cụ thể. Nhóm cần thống nhất dữ liệu mẫu, không trình bày danh sách tự chọn như thể đó là danh mục bắt buộc của đề.
5. **Tình trạng sản phẩm:** Ảnh chỉ nêu ba nhãn `Like new`, `Good`, `Fair`, chưa đưa ra tiêu chuẩn chi tiết để phân loại từng nhãn.
6. **Ảnh đăng sản phẩm:** Yêu cầu ghi rõ tải ảnh giả lập. Không được tuyên bố ảnh đã được tải lên máy chủ hoặc lưu trữ trực tuyến.
7. **Dữ liệu và lưu trữ:** Ảnh không quy định backend, cơ sở dữ liệu, tài khoản người dùng hoặc cách lưu tin đăng. Không tự thêm các hệ thống này vào phạm vi bắt buộc.

## 6. Prompt giao việc cho từng AI

Mỗi thành viên chỉ gửi prompt tương ứng với phần được phân công. AI phải đọc toàn bộ README trước khi thực hiện.

### Prompt AI 1 — Home + Product Grid + Badges

```text
Bạn phụ trách AI 1 của dự án Circular Economy Exchange.

Đọc README.md và chỉ triển khai các hạng mục được giao cho AI 1:
1. Trang chủ hiển thị các mặt hàng mới đăng.
2. Product Grid chuyên nghiệp bằng HTML5 và CSS3.
3. Badges tình trạng sản phẩm với đúng ba nhãn: Like new, Good, Fair.
4. Khu vực hiển thị tổng lượng rác thải cộng đồng đã giảm thiểu.

Không làm phần tìm kiếm/lọc của Trang Danh mục.
Không làm form Đăng tin.
Không tự viết công thức tính lượng rác thải.

Phải dùng dữ liệu sản phẩm và quy ước tích hợp thống nhất với AI 2 và AI 3.
Giá trị thống kê trên Trang chủ phải lấy từ module tính toán được tích hợp.
Nếu module chưa có dữ liệu hợp lệ, hiển thị trạng thái chưa có dữ liệu; tuyệt đối không tạo số liệu giả.

Không tự thêm chức năng ngoài README.
Không sửa phần việc thuộc AI 2 hoặc AI 3.
Nếu thiếu thông tin, ghi rõ NEED CONFIRMATION thay vì tự suy diễn.

Bàn giao:
- Các file thuộc Trang chủ, Product Grid và Badges.
- Danh sách file đã thay đổi.
- Cách tích hợp với AI 2 và AI 3.
- Kết quả kiểm tra thực tế; phân biệt PASS, FAIL, BLOCKED và NOT RUN.
```

### Prompt AI 2 — Category + Search + Filter

```text
Bạn phụ trách AI 2 của dự án Circular Economy Exchange.

Đọc README.md và chỉ triển khai các hạng mục được giao cho AI 2:
1. Trang Danh mục sản phẩm.
2. Hiển thị danh sách sản phẩm bằng Product Grid dùng chung của AI 1.
3. JavaScript tìm kiếm sản phẩm.
4. Bộ lọc theo danh mục.
5. Bộ lọc theo khoảng cách.

Không tạo Product Grid thứ hai.
Không tự sửa hoặc thay thế giao diện chung của AI 1.
Không làm Trang chủ.
Không làm form Đăng tin.
Không làm chức năng tính lượng rác thải giảm thiểu.

Phải sử dụng chung cấu trúc dữ liệu sản phẩm với AI 1.
Không tự thêm bộ lọc giá, đánh giá, độ phổ biến hoặc các tiêu chí không được yêu cầu.
Đơn vị và cách xác định khoảng cách chưa được đề bài quy định; không tự tuyên bố có định vị thực tế. Nếu thiếu quy tắc, ghi NEED CONFIRMATION.

Không tự thêm chức năng ngoài README.
Không sửa phần việc thuộc AI 1 hoặc AI 3.

Bàn giao:
- Trang Danh mục sản phẩm.
- Logic JavaScript tìm kiếm và lọc.
- Danh sách file đã thay đổi.
- Cách sử dụng Product Grid và dữ liệu chung.
- Kết quả kiểm tra thực tế; phân biệt PASS, FAIL, BLOCKED và NOT RUN.
```

### Prompt AI 3 — Listing + Waste Reduction

```text
Bạn phụ trách AI 3 của dự án Circular Economy Exchange.

Đọc README.md và chỉ triển khai các hạng mục được giao cho AI 3:
1. Trang Đăng tin.
2. Form nhập mô tả sản phẩm.
3. Chức năng chọn ảnh giả lập.
4. Lựa chọn loại hình trao đổi với đúng ba giá trị:
   Give, Sell, Exchange.
5. Module tính “Lượng rác thải đã giảm thiểu” khi có giao dịch được xác nhận thành công.
6. Cung cấp tổng kết quả tính toán để AI 1 hiển thị trên Trang chủ.

Không làm Trang chủ.
Không làm Product Grid.
Không làm logic tìm kiếm/lọc.
Không tự tạo trang thanh toán hoặc hệ thống giao dịch ngoài phạm vi.

CỰC KỲ QUAN TRỌNG:
Đề bài không cung cấp công thức, đơn vị, khối lượng hoặc hệ số quy đổi lượng rác thải.
Không được tự bịa công thức hoặc số liệu.
Hãy tách riêng hàm tính toán, ghi rõ dữ liệu đầu vào cần có và đánh dấu phần công thức là NEED CONFIRMATION cho đến khi nhóm/giảng viên xác nhận.
Chỉ ghi nhận khi giao dịch có tín hiệu xác nhận thành công; không tính khi chỉ mới đăng tin.
Ảnh chỉ yêu cầu tải ảnh giả lập, không được tuyên bố đã upload lên máy chủ.

Không tự thêm chức năng ngoài README.
Không sửa phần việc thuộc AI 1 hoặc AI 2.

Bàn giao:
- Trang Đăng tin và form.
- Module tính lượng rác thải giảm thiểu.
- Quy tắc kích hoạt tính toán và dữ liệu đầu vào.
- Giao diện tích hợp kết quả với AI 1.
- Các điểm còn NEED CONFIRMATION.
- Kết quả kiểm tra thực tế; phân biệt PASS, FAIL, BLOCKED và NOT RUN.
```

## 7. Checklist nghiệm thu theo đúng yêu cầu

### AI 1
- [ ] Có Trang chủ.
- [ ] Hiển thị các mặt hàng mới đăng.
- [ ] Có Product Grid được thiết kế bằng HTML5 và CSS3.
- [ ] Có badges `Like new`, `Good`, `Fair`.
- [ ] Có khu vực hiển thị tổng lượng rác thải cộng đồng đã giảm thiểu.
- [ ] Không hiển thị số liệu rác thải tự tạo.

### AI 2
- [ ] Có Trang Danh mục sản phẩm.
- [ ] Có chức năng tìm kiếm.
- [ ] Có bộ lọc theo danh mục.
- [ ] Có bộ lọc theo khoảng cách.
- [ ] Dùng chung dữ liệu và Product Grid, không tạo bản sao không cần thiết.

### AI 3
- [ ] Có Trang Đăng tin.
- [ ] Form cho phép nhập mô tả.
- [ ] Có chức năng chọn ảnh giả lập.
- [ ] Có lựa chọn `Give`, `Sell`, `Exchange`.
- [ ] Có hàm tính lượng rác thải giảm thiểu.
- [ ] Chỉ ghi nhận giao dịch thành công.
- [ ] Công thức và đơn vị được xác nhận, không dùng số liệu tự bịa.
- [ ] Có thể cung cấp tổng kết quả cho Trang chủ.

### Toàn nhóm
- [ ] Có đủ ba trang tối thiểu theo đề.
- [ ] Ba phần dùng chung quy ước dữ liệu và tích hợp.
- [ ] Không có hai AI cùng viết một chức năng.
- [ ] Không tự đưa tầm nhìn dài hạn thành chức năng bắt buộc.
- [ ] Mọi nội dung chưa được đề bài xác định đều được đánh dấu để xác nhận.
- [ ] Chỉ đánh dấu PASS cho nội dung đã thực sự kiểm tra.

---

**Nguyên tắc cuối cùng:** Bám sát yêu cầu trong ảnh. Ưu tiên làm đúng ba trang, Product Grid/Badges, tìm kiếm/lọc và tính lượng rác thải giảm thiểu. Không tự mở rộng dự án sang các chức năng không được giao.

---

# Cập nhật tiến độ triển khai (27/11/2026)

> Phần trên là nội dung gốc của README, giữ nguyên. Phần dưới ghi lại những gì đã làm trong repository này. Chỉ ghi PASS cho nội dung đã chạy kiểm tra thật.

Trang demo: https://tranngochuyc-cyber.github.io/BAI_CUOI_KI_NHOM3/#new-items

## 8. Phân công và các hạng mục đã làm

| Phần | Thành viên | Hạng mục |
|---|---|---|
| AI 1 | Trần Ngọc Huy (nhóm trưởng) | Trang chủ, Product Grid, Badges, khu vực thống kê rác thải, khung header/footer dùng chung |
| AI 2 | Nguyễn Minh Nhật | Trang Danh mục sản phẩm, tìm kiếm, lọc theo danh mục, lọc theo khoảng cách |
| AI 3 | Lê Văn Khoa | Trang Đăng tin, form, ảnh giả lập, Give/Sell/Exchange, module tính lượng rác thải giảm thiểu |

### 8.1. Cấu trúc thư mục

```text
index.html            Trang chủ (AI 1)
category.html         Trang Danh mục sản phẩm (AI 2)
post.html             Trang Đăng tin (AI 3)
assets/css/           tokens.css, layout.css, product-grid.css, home.css (AI 1)
                      category.css (AI 2) · post.css (AI 3)
assets/js/            product-grid.js, home.js, cee-integration.js (AI 1)
                      category-filter.js, category-page.js (AI 2)
                      post-listing.js, waste-reduction.js (AI 3)
                      cee-config.js, cee-data.js (lớp nối dùng chung)
tests/                filter.test.js, unit.test.js, e2e_check.py
INTEGRATION.md        Hợp đồng dữ liệu giữa 3 phần
TEST-REPORT.md        Kết quả kiểm tra
```

`ai2-danh-muc.zip` và `AI 3.rar` là bản nộp gốc của AI 2 và AI 3, được giữ nguyên trong repository.

### 8.2. AI 1 — Trang chủ, Product Grid, Badges

- Trang chủ hiển thị 6 mặt hàng mới đăng gần nhất (mới nhất lên đầu) và liên kết sang Trang Danh mục để xem đầy đủ.
- Product Grid dùng chung bằng HTML5/CSS3, responsive 3 → 2 → 1 cột. Ba badge đúng nhãn `Like new`, `Good`, `Fair`.
- Khu vực thống kê tổng lượng rác thải lấy giá trị từ module của AI 3. Chưa có kết quả hợp lệ thì hiện “Chưa có dữ liệu”, không có số liệu tự tạo.
- Tách header, điều hướng 3 trang và footer ra `layout.css` để cả 3 trang dùng chung; cập nhật điều hướng thành liên kết giữa 3 trang.

### 8.3. AI 2 — Danh mục, tìm kiếm, lọc

- Trang Danh mục có ô tìm kiếm (theo tên và mô tả, không phân biệt hoa/thường và dấu), lọc theo danh mục, lọc theo khoảng cách tối đa. Ba điều kiện kết hợp theo AND và cập nhật ngay khi nhập.
- Kết quả hiển thị bằng Product Grid dùng chung của AI 1 (`renderProductGrid`), không có Product Grid thứ hai.
- Danh sách danh mục trong bộ lọc lấy từ dữ liệu thực tế của các tin đã đăng.
- Điều chỉnh khi tích hợp: `category-page.js` chuyển sang ES module để dùng `product-grid.js` và `cee-integration.js` của AI 1; bộ lọc khoảng cách đọc `distance.value` theo hợp đồng dữ liệu chung (vẫn nhận số thuần).

### 8.4. AI 3 — Đăng tin và lượng rác thải giảm thiểu

- Form Đăng tin: tên, mô tả, tình trạng (`Like new`/`Good`/`Fair`), danh mục, khoảng cách (không bắt buộc), loại hình `Give`/`Sell`/`Exchange`, ảnh giả lập (chỉ xem trước trên máy, không upload, chỉ lưu thông tin file).
- Tin đăng lưu cục bộ bằng `localStorage` (không có backend theo đúng README mục 5.7).
- Module `waste-reduction.js`: hàm tính tách riêng, chỉ ghi nhận khi `transactionConfirmed === true`, chống ghi trùng theo `transactionId`, đăng tin không kích hoạt tính toán. Công thức và đơn vị **chưa được xác nhận nên module không trả ra con số nào**.
- Điều chỉnh khi tích hợp: lấy danh mục mẫu từ `cee-config.js`; thêm ô khoảng cách (nhập tay, giả lập) để bộ lọc của AI 2 có dữ liệu; dùng header chung và đổi màu nhấn theo `tokens.css`.

### 8.5. Lớp nối dùng chung

- `cee-config.js`: danh mục mẫu, đơn vị khoảng cách mẫu, nhãn vị trí tham chiếu. Đây là **dữ liệu mẫu chờ nhóm xác nhận**, không phải yêu cầu của đề. Sửa tại một file này khi nhóm chốt.
- `cee-data.js`: cung cấp `window.CEEProductRepository` (tin đăng của AI 3 → `Product` theo hợp đồng của AI 1) và `window.CEEWasteCalculator` (kết quả AI 3 → `{ value, unit }` hoặc `null`), cùng cầu nối sự kiện để các trang tự cập nhật. Chi tiết trong `INTEGRATION.md`.

## 9. Kết quả kiểm tra thực tế

Môi trường: Node 22, Google Chrome thật qua Playwright, máy chủ tĩnh cục bộ.

**PASS**
- 30/30 test Node (`node --test tests/*.test.js`): logic lọc, validate form, quy tắc ghi nhận giao dịch, trạng thái công thức chưa xác nhận.
- 33/33 kiểm tra trình duyệt (`tests/e2e_check.py`): trang chủ trống → đăng 3 tin → hiển thị trên Trang chủ và Danh mục theo thứ tự mới nhất; badge đúng nhãn; tìm kiếm không dấu; lọc danh mục, khoảng cách và kết hợp; trạng thái không có kết quả; ảnh giả lập không phát sinh request mạng; đăng tin không ghi vào sổ rác thải; giao dịch chưa xác nhận bị từ chối; không cuộn ngang ở 375px trên cả 3 trang; không lỗi console.

**NOT RUN**
- Firefox, Safari, thiết bị thật, trình đọc màn hình, đo độ tương phản bằng công cụ chuyên dụng.
- Chạy thử trên GitHub Pages sau khi đẩy code.

**BLOCKED**
- Hiển thị một con số rác thải thật: chờ công thức, đơn vị, dữ liệu đầu vào (mục 5.1).
- Luồng xác nhận “giao dịch thành công” trong giao diện: chờ quy định của đề (mục 5.2); hiện chỉ có hàm `recordConfirmedTransaction()` để nơi xác nhận gọi vào.

## 10. Còn NEED CONFIRMATION

1. Công thức, đơn vị, dữ liệu đầu vào lượng rác thải và tín hiệu giao dịch thành công (mục 5.1, 5.2). Điền khối `WASTE_RULE` đầu file `assets/js/waste-reduction.js` sau khi xác nhận.
2. Danh mục chính thức (mục 5.4): đang dùng danh sách mẫu trong `cee-config.js`.
3. Đơn vị và vị trí tham chiếu của khoảng cách (mục 5.3): đang dùng `km` làm mẫu, người đăng tự nhập, không định vị GPS. Sản phẩm không có khoảng cách bị ẩn khi bật lọc khoảng cách.
4. Tiêu chuẩn phân loại từng nhãn tình trạng (mục 5.5) và việc người đăng tự chọn tình trạng trong form.
5. Tin demo (mục 11): nhóm xác nhận giữ lại khi trình bày, hoặc đặt `showDemoData: false` trong `cee-config.js` để ẩn.
6. Giả định ước tính rác thải theo danh mục (mục 11) cần giảng viên đồng ý hoặc thay bằng quy tắc chính thức.

## 11. Cập nhật chuẩn bị thuyết trình (27/11/2026)

Chỉ sửa phần AI 1 (Trang chủ, Product Grid) và lớp nối dùng chung. Không sửa file của AI 2 (`category.html`, `category-*.js`, `category.css`) và AI 3 (`post.html`, `post-listing.js`, `waste-reduction.js`, `post.css`).

### 11.1. Đã làm

- **Tin demo có nhãn:** 6 tin minh họa trong `cee-config.js`, mỗi thẻ có nhãn “Tin demo”. Tin tự đăng luôn đứng trước vì mới hơn. Ẩn toàn bộ bằng `showDemoData: false`.
- **Luồng giao dịch thành công:** mỗi thẻ sản phẩm có nút “Xác nhận giao dịch thành công”. Nút gọi `CEETransactions.confirm()` (trong `cee-data.js`), từ đó gọi `recordConfirmedTransaction()` của module AI 3 với `transactionConfirmed: true`. Mỗi tin chỉ được ghi một lần.
- **Ước tính rác thải:** quy tắc ước tính (kg theo danh mục) đặt trong `cee-config.js` và truyền vào module AI 3 qua `createWasteModule({ rule })`; **`waste-reduction.js` không bị sửa**. Trang chủ ghi rõ “(ước tính)”, số giao dịch và dòng “Giả định minh họa của nhóm, chưa được giảng viên xác nhận”. Chưa có giao dịch thì hiện `0 kg`.
- **Trang chủ:** thêm mục “Cách hoạt động” 3 bước; nút “Đặt lại dữ liệu demo” ở cuối trang (xóa tin tự đăng và giao dịch trên trình duyệt này, giữ tin demo).
- **Product Grid:** loại hình hiển thị kèm tiếng Việt (`Give · Tặng`, `Sell · Bán`, `Exchange · Đổi`), badge có chú thích tiếng Việt khi rê chuột, thẻ hiện khoảng cách. Giá trị dữ liệu giữ nguyên theo README.
- **Chạy không cần mạng:** `chay-demo.bat` + `demo-server.py` chạy máy chủ cục bộ tại `http://localhost:8000`. Mở trực tiếp bằng file thì trang hiện cảnh báo hướng dẫn.

### 11.2. Cách chạy demo

1. Windows: bấm đúp `chay-demo.bat` (cần Python). Trình duyệt tự mở `http://localhost:8000/index.html`. Không có Python: mở thư mục bằng VS Code, dùng extension Live Server.
2. Có mạng: dùng link GitHub Pages ở đầu phần cập nhật.
3. Trước khi trình bày: bấm “Đặt lại dữ liệu demo” ở cuối Trang chủ để về trạng thái ban đầu (0 kg, 6 tin demo).

Kịch bản gợi ý: Trang chủ (0 kg, Cách hoạt động) → Đăng tin một món → quay lại Trang chủ thấy tin mới đứng đầu → Danh mục: tìm không dấu, lọc danh mục, lọc khoảng cách → bấm “Xác nhận giao dịch thành công” → Trang chủ thấy số kg tăng.

### 11.3. Kết quả kiểm tra

- PASS 30/30 test Node, PASS 40/40 kiểm tra trình duyệt (`tests/e2e_check.py`, Chrome thật qua `demo-server.py`), xem ảnh chụp desktop/mobile/file://.
- NOT RUN: chạy `chay-demo.bat` trên Windows thật, GitHub Pages sau khi đẩy code.

