# AI 1 — Gói Trang chủ, Product Grid và Badges

## 1. Phạm vi và tình trạng tích hợp

Cập nhật 27/11/2026: ba phần đã được ghép trong cùng một site tĩnh (xem README mục 8).

- AI 1 sở hữu: `index.html`, `assets/css/{tokens,layout,product-grid,home}.css`, `assets/js/{home,product-grid,cee-integration}.js`.
- AI 2 sở hữu: `category.html`, `assets/css/category.css`, `assets/js/{category-filter,category-page}.js`. AI 2 dùng lại `product-grid.js` và `product-grid.css`, không có Product Grid thứ hai.
- AI 3 sở hữu: `post.html`, `assets/css/post.css`, `assets/js/{post-listing,waste-reduction}.js`.
- Lớp nối dùng chung: `assets/js/cee-config.js` (cấu hình mẫu) và `assets/js/cee-data.js` (adapter `CEEProductRepository`, `CEEWasteCalculator`, cầu nối sự kiện).
- Nguồn dữ liệu sản phẩm: tin đăng của AI 3 trong `localStorage['cee.listings.v1']`, được `cee-data.js` đổi sang hợp đồng `Product` bên dưới. README không quy định backend nên đây chỉ là lưu cục bộ cho bản demo.

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
| `distance` | `{ value: number, unit: string, reference: string } \| null` | Do người đăng tự nhập (giả lập, không định vị). `unit` và `reference` lấy từ `cee-config.js`; đơn vị, vị trí tham chiếu: **NEED CONFIRMATION** |

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

`cee-data.js` đổi kết quả của `CEEWasteReduction.getCommunityTotal()` (AI 3) sang dạng trên: chỉ khi `status === "OK"` mới trả `{ value: total, unit }`, mọi trạng thái khác trả `null`.

AI 1 không tự cộng, quy đổi, ước lượng hoặc gán đơn vị. Trường hợp module thiếu, lỗi, trả `null`, giá trị âm/không hữu hạn hoặc thiếu đơn vị thì Trang chủ hiển thị **“Chưa có dữ liệu”**.

**NEED CONFIRMATION từ AI 3:** tên hàm export thực tế, đường dẫn module, công thức, đơn vị, dữ liệu đầu vào và tín hiệu xác nhận giao dịch thành công. Không có nội dung nào trong gói AI 1 thay thế quyết định đó.

## 4. Sự kiện cập nhật dữ liệu

Sau khi nguồn dữ liệu chung được cập nhật, nơi sở hữu dữ liệu phát một trong các sự kiện:

```js
window.dispatchEvent(new Event("cee:products-updated"));
window.dispatchEvent(new Event("cee:waste-updated"));
```

`cee-data.js` tự phát hai sự kiện này khi nhận `cee:listing-created` / `cee:waste-total-changed` của AI 3 hoặc khi `localStorage` đổi ở tab khác.

Trang chủ nghe hai sự kiện này để đọc lại nguồn dữ liệu. Provider phải được đăng ký trước lần đọc đầu tiên, hoặc phát sự kiện sau khi đăng ký.

## 5. Cách AI 2 tái sử dụng Product Grid

`category-page.js` là ES module, đọc dữ liệu qua `readProducts()` (AI 1), lọc bằng `window.CEE.filter` (`category-filter.js`) rồi vẽ bằng Product Grid dùng chung:

```js
import { renderProductGrid, isValidProduct } from "./product-grid.js";
import { readProducts } from "./cee-integration.js";

renderProductGrid(container, productsAfterAi2SearchAndFilters, { emptyMessage });
```

`renderProductGrid()` chỉ render danh sách được truyền vào, không tìm kiếm, lọc, sắp xếp, phân trang hay truy xuất dữ liệu.

## 6. Cách AI 3 kết nối module tính toán

`waste-reduction.js` giữ nguyên quyền sở hữu công thức. Trang chủ không gọi thẳng module này mà đi qua adapter `window.CEEWasteCalculator` trong `cee-data.js`. Khi nhóm chốt công thức, chỉ cần điền khối `WASTE_RULE` trong `waste-reduction.js`; adapter và Trang chủ không phải sửa.

## 7. Những điểm cần nhóm xác nhận

1. Danh sách danh mục chính thức (hiện là danh sách mẫu trong `cee-config.js`).
2. Đơn vị và vị trí tham chiếu của khoảng cách (hiện mẫu `km`, nhập tay, không GPS).
3. Công thức, đơn vị, dữ liệu đầu vào lượng rác thải và tín hiệu giao dịch thành công.
4. Có dùng `localStorage` làm nơi lưu cho bản demo hay không (README không quy định backend).
