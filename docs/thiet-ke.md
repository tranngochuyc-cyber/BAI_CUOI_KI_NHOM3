# Tài liệu thiết kế — Circular Economy Exchange

## 1. Sơ đồ trang (sitemap)

```text
                    ┌──────────────────────┐
                    │   index.html          │  Trang chủ (Dashboard)
                    │   - Widget rác thải    │
                    │   - Thống kê nhanh     │
                    │   - Danh mục nổi bật ──┼──► category.html?category=...
                    │   - Mặt hàng mới đăng  │
                    └───┬──────────────┬────┘
                        │              │
        ┌───────────────▼───┐      ┌───▼────────────────┐
        │ category.html      │      │ post.html           │
        │ Danh mục sản phẩm  │      │ Đăng tin            │
        │ - Tìm kiếm         │      │ - Form + validation │
        │ - Lọc 4 tiêu chí   │      │ - Ảnh xem trước     │
        │ - Sắp xếp          │      │ - Tin bạn đã đăng   │
        └────────────────────┘      └─────────────────────┘
```

## 2. Wireframe (bố cục chính)

```text
Trang chủ (desktop)                          Trang Danh mục
┌───────────────────────────────────────┐   ┌───────────────────────────────────┐
│ Logo        Trang chủ  Danh mục  Đăng tin│  │ Header                            │
├───────────────────────────┬───────────┤   ├───────────────────────────────────┤
│ Món đồ cũ. Một vòng đời mới│ ┌───────┐ │   │ [ Từ khóa .......................]│
│ [Đăng tin ngay] [Tìm đồ cũ]│ │ 13 kg │ │   │ [Danh mục][Tình trạng][Loại hình] │
│                            │ └───────┘ │   │ [Khoảng cách][Sắp xếp][Xóa lọc]   │
├──────────┬──────────┬──────────────────┤   ├───────────────────────────────────┤
│ Món chờ  │ Giao dịch│ Biểu đồ theo     │   │ Tìm thấy 4 / 11 sản phẩm          │
│ trao đổi │ thành công│ danh mục ▇▇▇▅▂   │   │ ┌────┐┌────┐┌────┐┌────┐          │
├──────────┴──────────┴──────────────────┤   │ │card││card││card││card│          │
│ Cách hoạt động: 1 → 2 → 3               │   │ └────┘└────┘└────┘└────┘          │
│ Danh mục nổi bật: (chip) (chip) (chip)  │   └───────────────────────────────────┘
│ Mặt hàng mới đăng: lưới 4 cột           │
└────────────────────────────────────────┘   Thẻ sản phẩm (article)
                                              ┌───────────────────────┐
Responsive: 4 → 3 → 2 → 1 cột                 │ [Like new]   [Tin demo]│ ← ảnh/ảnh thay thế
(CSS Grid auto-fill minmax(260px, 1fr))       │ [Tặng] NỘI THẤT        │
                                              │ Tên sản phẩm           │
                                              │ Mô tả (2 dòng)         │
                                              │ 📍 Cách 2 km  Đăng ... │
                                              │ [✓ Xác nhận giao dịch] │
                                              └───────────────────────┘
```

## 3. Cấu trúc dữ liệu

**Tin demo / tin đăng** (lưu trong `js/data.js` và `localStorage['cee.listings.v1']`):

```json
{
  "id": "lst_m3x1_ab12cd",
  "title": "Bàn gỗ sồi",
  "description": "Bàn làm việc còn chắc chắn",
  "condition": "Good",
  "category": "Nội thất",
  "exchangeType": "Sell",
  "distance": 2,
  "image": { "mock": true, "uploaded": false, "fileName": "ban.jpg", "fileType": "image/jpeg", "fileSize": 182000, "thumbnail": "data:image/jpeg;base64,..." },
  "createdAt": "2026-11-27T08:00:00.000Z"
}
```

- `condition` ∈ `Like new | Good | Fair` (badge tình trạng).
- `exchangeType` ∈ `Give | Sell | Exchange`, hiển thị **Tặng / Bán / Đổi**.
- `distance` không bắt buộc, do người đăng nhập tay (giả lập, không định vị).
- Ảnh chỉ được thu nhỏ và lưu trên trình duyệt, **không** tải lên máy chủ.

**Sổ giao dịch thành công** (`localStorage['cee.wasteLedger.v1']`):

```json
{ "transactionId": "tx_lst_m3x1_ab12cd", "listingId": "lst_m3x1_ab12cd", "exchangeType": "Sell",
  "inputs": { "category": "Nội thất" }, "recordedAt": "2026-11-27T08:05:00.000Z" }
```

## 4. Công thức "Lượng rác thải đã giảm thiểu"

```text
rác giảm của 1 giao dịch = khối lượng ước tính của danh mục món đồ (kg)
tổng cộng đồng          = Σ rác giảm của mọi giao dịch đã xác nhận thành công
```

| Danh mục | kg ước tính |
|---|---|
| Đồ điện tử | 1,5 |
| Đồ gia dụng | 3 |
| Nội thất | 12 |
| Quần áo & phụ kiện | 0,6 |
| Sách & văn phòng phẩm | 1 |
| Khác | 1 |

Đây là **giả định minh họa của nhóm** vì đề bài không cho công thức. Muốn đổi hệ số, chỉ cần sửa `categories` trong `js/data.js`.

Quy tắc ghi nhận (`js/logic/waste.js`):

1. Chỉ ghi khi `transactionConfirmed === true` (không nhận `"true"`, `1`, thiếu). **Đăng tin không cộng rác thải.**
2. Mỗi món chỉ có một giao dịch (`transactionId = "tx_" + id`), nên bấm lại không cộng trùng.
3. Chỉ chấp nhận `Give / Sell / Exchange`.

## 5. Kiến trúc JavaScript và luồng sự kiện

```text
data.js ──► logic/filter.js   logic/listing.js   logic/waste.js
                 │                   │                  │
                 └──────► logic/store.js ◄──────────────┘
                          (gộp dữ liệu, thống kê, sự kiện "cee:data-changed")
                                   │
                          ui/components.js (Product Grid, badges, toast)
                                   │
                ┌──────────────────┼──────────────────┐
             ui/home.js       ui/category.js       ui/post.js
```

- Script thường (`<script defer>`), dùng chung namespace `window.CEE`, nên chạy được cả khi mở file trực tiếp (`file://`).
- Đăng tin → `listing.add()` phát `cee:listing-created` → trang đang mở vẽ lại danh sách.
- Xác nhận giao dịch → `waste.recordConfirmedTransaction()` phát `cee:waste-total-changed` → `store` phát `cee:data-changed` → Trang chủ cập nhật số kg và biểu đồ.
- Tab khác nhận sự kiện `storage` của trình duyệt nên cũng tự cập nhật, không cần tải lại.
