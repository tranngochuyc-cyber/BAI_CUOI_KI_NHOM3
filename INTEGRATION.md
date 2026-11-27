# AI 1 — Gói Trang chủ, Product Grid và Badges

## 1. Phạm vi và tình trạng tích hợp

Gói này chỉ chứa phần AI 1. Thư mục được tạo độc lập vì trong phiên làm việc chỉ có `README.md`, không có mã nguồn hiện tại của dự án để xác định cấu trúc hoặc ghép vào ứng dụng mà không có nguy cơ ghi đè phần của AI 2/AI 3.

- AI 1 sở hữu: `index.html`, `assets/css/home.css`, `assets/css/product-grid.css`, `assets/css/tokens.css`, `assets/js/home.js`, `assets/js/product-grid.js`, `assets/js/cee-integration.js`.
- AI 2 chỉ tái sử dụng `product-grid.js` và `product-grid.css`; không tạo một Product Grid khác.
- Nguồn dữ liệu sản phẩm phải là nguồn dùng chung cho cả Trang chủ và Trang Danh mục; **chủ sở hữu repository: NEED CONFIRMATION** vì README không phân công rõ phần lưu trữ/dữ liệu. AI 3 sở hữu module tính lượng rác thải. AI 1 không triển khai form hoặc công thức tính.
- Trạng thái ghép vào ứng dụng tổng thể: **BLOCKED** cho đến khi có mã nguồn dự án và AI 2/AI 3 xác nhận hợp đồng dữ liệu.

## 2. Hợp đồng dữ liệu sản phẩm đề xuất dùng chung

**NEED CONFIRMATION:** README yêu cầu ba AI thống nhất cấu trúc sản phẩm nhưng không định nghĩa tên trường hoặc định dạng. Gói AI 1 dùng hợp đồng đề xuất dưới đây để AI 2 và AI 3 có một chuẩn cụ thể để xác nhận trước khi ghép. README cũng không chỉ định AI nào sở hữu repository/lớp lưu trữ sản phẩm; nhóm cần phân công rõ, AI 1 và AI 2 chỉ đọc cùng một nguồn.

`window.CEEProductRepository` là adapter/nguồn dữ liệu chung. Nguồn dữ liệu phải được chia sẻ giữa Trang chủ và Trang Danh mục, không tạo hai bộ dữ liệu riêng. **Chủ sở hữu triển khai repository: NEED CONFIRMATION** (không mặc định giao cho AI 3 chỉ vì AI 3 làm form Đăng tin).

```js
window.CEEProductRepository = {
  async getAll() {
    // Trả về danh sách Product từ nguồn dữ liệu chung.
    // Có thể trả [] nếu repository có dữ liệu hợp lệ nhưng chưa có tin đăng.
  }
};
```

Một bản ghi `Product` theo hợp đồng đề xuất:

| Trường | Kiểu | Quy tắc |
|---|---|---|
| `id` | `string` | Bắt buộc, định danh duy nhất |
| `title` | `string` | Bắt buộc, tên sản phẩm |
| `description` | `string` | Nội dung mô tả; có thể bỏ trống |
| `imageUrl` | `string \| null` | Không bắt buộc; URL ảnh hoặc `null`. Không hàm ý ảnh đã upload lên máy chủ |
| `condition` | `"Like new" \| "Good" \| "Fair"` | Bắt buộc, đúng một trong ba giá trị |
| `category` | `string` | Bắt buộc để AI 2 lọc danh mục; danh sách giá trị danh mục: **NEED CONFIRMATION** |
| `exchangeType` | `"Give" \| "Sell" \| "Exchange"` | Bắt buộc, đúng một trong ba giá trị của README |
| `createdAt` | ISO-8601 datetime `string` | Bắt buộc để xác định thứ tự mới đăng; cần nguồn dữ liệu cung cấp timestamp thực |
| `distance` | `{ value: number, unit: string, reference: string } \| null` | Trường mở rộng tùy chọn cho AI 2; đơn vị, vị trí tham chiếu và cách xác định: **NEED CONFIRMATION** |

Ví dụ dưới đây chỉ minh họa cấu trúc trường, **không phải dữ liệu sản phẩm mẫu để hiển thị**:

```js
{
  id: "<unique-id>",
  title: "<product-title>",
  description: "<description>",
  imageUrl: null,
  condition: "Good",
  category: "<agreed-category>",
  exchangeType: "Give",
  createdAt: "<ISO-8601-timestamp>",
  distance: null
}
```

`product-grid.js` kiểm tra `id`, `title`, `condition`, `category`, `exchangeType` và `createdAt`. Bản ghi sai hợp đồng sẽ không được render. Không có danh mục mẫu hoặc sản phẩm giả được thêm vào gói AI 1.

## 3. Hợp đồng kết quả thống kê từ AI 3

AI 3 sở hữu module tính toán. AI 1 chỉ gọi adapter và hiển thị kết quả hợp lệ.

```js
window.CEEWasteCalculator = {
  async getCommunityTotal() {
    // Trả về kết quả thật từ module tính toán của AI 3.
    // Trả null nếu module chưa có kết quả hợp lệ.
  }
};
```

Kiểu kết quả:

```ts
type CommunityWasteTotal = {
  value: number; // số hữu hạn, không âm, do module AI 3 trả về
  unit: string;  // đơn vị do module AI 3 trả về; không mặc định kg
} | null;
```

AI 1 không tự cộng, quy đổi, ước lượng hoặc gán đơn vị. Trường hợp module thiếu, lỗi, trả `null`, giá trị âm/không hữu hạn hoặc thiếu đơn vị thì Trang chủ hiển thị **“Chưa có dữ liệu”**.

**NEED CONFIRMATION từ AI 3:** tên hàm export thực tế, đường dẫn module, công thức, đơn vị, dữ liệu đầu vào và tín hiệu xác nhận giao dịch thành công. Không có nội dung nào trong gói AI 1 thay thế quyết định đó.

## 4. Sự kiện cập nhật dữ liệu

Sau khi nguồn dữ liệu chung được cập nhật, nơi sở hữu dữ liệu phát một trong các sự kiện:

```js
window.dispatchEvent(new Event("cee:products-updated"));
window.dispatchEvent(new Event("cee:waste-updated"));
```

Trang chủ nghe hai sự kiện này để đọc lại nguồn dữ liệu. Provider phải được đăng ký trước lần đọc đầu tiên, hoặc phát sự kiện sau khi đăng ký.

## 5. Cách AI 2 tái sử dụng Product Grid

AI 2 không viết lại cấu trúc card, badge hay stylesheet Product Grid. Sau khi áp dụng logic tìm kiếm/lọc của AI 2 lên dữ liệu chung, AI 2 truyền danh sách kết quả vào component:

```js
import { renderProductGrid } from "../ai1-delivery/assets/js/product-grid.js";

const container = document.querySelector("#category-products");
renderProductGrid(container, productsAfterAi2SearchAndFilters);
```

Trang Danh mục nạp các stylesheet dùng chung:

```html
<link rel="stylesheet" href="../ai1-delivery/assets/css/tokens.css">
<link rel="stylesheet" href="../ai1-delivery/assets/css/product-grid.css">
```

`renderProductGrid()` chỉ render danh sách được truyền vào. Hàm **không** tìm kiếm, lọc, sắp xếp, phân trang hoặc truy xuất dữ liệu.

## 6. Cách AI 3 kết nối module tính toán

AI 3 giữ nguyên quyền sở hữu module tính toán của mình và tạo adapter theo đúng giao diện `window.CEEWasteCalculator.getCommunityTotal()`. Adapter phải trả về `{ value, unit }` theo dữ liệu module hoặc `null`; không để AI 1 tự gọi nội bộ hoặc sao chép công thức.

Tên file và hàm export thực tế của AI 3 hiện chưa có trong phiên này: **NEED CONFIRMATION**. Không giả định đường dẫn hoặc viết import trỏ đến file chưa được bàn giao.

## 7. Những điểm cần nhóm xác nhận trước khi merge

1. AI 2 và AI 3 đồng ý tên trường `title`, `condition`, `category`, `exchangeType`, `createdAt`, `imageUrl`, `id`.
2. Bên sở hữu `CEEProductRepository` và cách dữ liệu sản phẩm được chia sẻ giữa ba trang. README không xác định backend/lưu trữ.
3. Danh sách category và quy tắc chuẩn hóa category.
4. AI 2 xác nhận đơn vị, vị trí tham chiếu và nguồn của `distance`; không suy ra GPS/khoảng cách thực tế từ trường dữ liệu này.
5. AI 3 xác nhận adapter thống kê, schema kết quả và đơn vị thực tế.
6. Đường dẫn đặt thư mục AI 1 trong repository tích hợp cuối cùng.
