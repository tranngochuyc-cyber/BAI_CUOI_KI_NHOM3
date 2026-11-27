/**
 * Cấu hình dùng chung cho cả 3 trang. Nạp TRƯỚC mọi script khác.
 *
 * Mọi giá trị dưới đây là DỮ LIỆU MẪU / GIẢ ĐỊNH để bản demo chạy được, không phải
 * yêu cầu bắt buộc của đề. Nhóm chỉ cần sửa tại file này khi chốt chính thức.
 */
window.CEEConfig = Object.freeze({
  // Danh mục mẫu (NEED CONFIRMATION). Trang Danh mục vẫn lấy danh sách lọc từ dữ liệu thực tế.
  categories: Object.freeze([
    "Đồ điện tử",
    "Đồ gia dụng",
    "Nội thất",
    "Quần áo & phụ kiện",
    "Sách & văn phòng phẩm",
    "Khác",
  ]),

  // Đơn vị khoảng cách mẫu (NEED CONFIRMATION).
  distanceUnit: "km",

  // Khoảng cách do người đăng tự nhập tay, KHÔNG có định vị GPS hay đo thực tế.
  distanceReference: "Nhập tay khi đăng tin (chưa định vị)",

  /*
   * TIN DEMO: chỉ để website không trống khi trình bày. Mỗi tin hiển thị nhãn "Tin demo".
   * Không phải tin thật của người dùng. Đặt showDemoData = false để ẩn toàn bộ.
   */
  showDemoData: true,
  demoProducts: Object.freeze([
    { id: "demo_1", title: "Nồi cơm điện 1,8 lít", description: "Nấu vẫn chín đều, nắp hơi trầy nhẹ.", condition: "Good", category: "Đồ gia dụng", exchangeType: "Sell", distance: 3.5, createdAt: "2026-11-20T08:00:00+07:00" },
    { id: "demo_2", title: "Áo khoác jean", description: "Size M, mặc vài lần, không còn vừa.", condition: "Like new", category: "Quần áo & phụ kiện", exchangeType: "Give", distance: 1.2, createdAt: "2026-11-21T09:30:00+07:00" },
    { id: "demo_3", title: "Kệ sách gỗ 3 tầng", description: "Chân kệ hơi lỏng, cần siết lại ốc.", condition: "Fair", category: "Nội thất", exchangeType: "Exchange", distance: 6, createdAt: "2026-11-22T14:00:00+07:00" },
    { id: "demo_4", title: "Tai nghe có dây", description: "Âm thanh tốt, dây còn nguyên.", condition: "Good", category: "Đồ điện tử", exchangeType: "Exchange", distance: 8.5, createdAt: "2026-11-23T10:15:00+07:00" },
    { id: "demo_5", title: "Bộ giáo trình Tin học đại cương", description: "Sách sạch, không ghi chú.", condition: "Like new", category: "Sách & văn phòng phẩm", exchangeType: "Give", distance: 0.8, createdAt: "2026-11-24T16:45:00+07:00" },
    { id: "demo_6", title: "Quạt bàn mini", description: "Chạy êm, mất nút số 3.", condition: "Fair", category: "Đồ điện tử", exchangeType: "Sell", distance: 12, createdAt: "2026-11-25T19:20:00+07:00" },
  ]),

  /*
   * GIẢ ĐỊNH ƯỚC TÍNH RÁC THẢI (NEED CONFIRMATION với giảng viên).
   * Ý tưởng: mỗi món đồ được trao đổi thành công là một món không bị vứt bỏ,
   * nên lượng rác giảm ≈ khối lượng ước tính của món đó theo danh mục.
   * Các con số là giả định minh họa của nhóm, không phải số liệu đo thực tế.
   * Công thức được truyền vào module của AI 3 qua createWasteModule({ rule }),
   * không sửa file waste-reduction.js.
   */
  wasteEstimate: Object.freeze({
    label: "Giả định minh họa của nhóm, chưa được giảng viên xác nhận",
    unit: "kg",
    kgPerCategory: Object.freeze({
      "Đồ điện tử": 1.5,
      "Đồ gia dụng": 3,
      "Nội thất": 12,
      "Quần áo & phụ kiện": 0.6,
      "Sách & văn phòng phẩm": 1,
      "Khác": 1,
    }),
    defaultKg: 1,
  }),
});
