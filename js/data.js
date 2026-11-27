/**
 * data.js — Dữ liệu dùng chung của toàn website (nạp ĐẦU TIÊN trên mọi trang).
 *
 * Dữ liệu viết dưới dạng mảng đối tượng (cấu trúc JSON) trong file .js thay vì file .json,
 * để website chạy được cả khi mở trực tiếp file HTML (file://) — trình duyệt chặn fetch() file .json
 * trong trường hợp đó.
 *
 * LƯU Ý: Danh mục, khoảng cách và hệ số rác thải dưới đây là GIẢ ĐỊNH MINH HỌA của nhóm,
 * đề bài không quy định. Tin demo luôn hiển thị nhãn "Tin demo".
 */
(function (root) {
  "use strict";

  var CEE = (root.CEE = root.CEE || {});

  CEE.data = {
    // Khóa lưu trữ trên trình duyệt (localStorage). Không có backend theo phạm vi học phần.
    storageKeys: {
      listings: "cee.listings.v1", // tin người dùng đăng (module Đăng tin)
      ledger: "cee.wasteLedger.v1", // sổ giao dịch thành công (module Rác thải)
    },

    // Ba nhãn tình trạng theo đề bài; label là nghĩa tiếng Việt để hiển thị.
    conditions: [
      { value: "Like new", label: "Như mới", hint: "Dùng rất ít, gần như mới" },
      { value: "Good", label: "Tốt", hint: "Có dấu hiệu sử dụng, hoạt động tốt" },
      { value: "Fair", label: "Khá", hint: "Có hao mòn, vẫn dùng được" },
    ],

    // Ba loại hình trao đổi theo đề bài: Tặng / Bán / Đổi.
    exchangeTypes: [
      { value: "Give", label: "Tặng" },
      { value: "Sell", label: "Bán" },
      { value: "Exchange", label: "Đổi" },
    ],

    // Danh mục + khối lượng ước tính (kg) của một món đồ trong danh mục.
    // kg dùng để ước tính "lượng rác thải đã giảm thiểu" khi giao dịch thành công.
    categories: [
      { name: "Đồ điện tử", kg: 1.5 },
      { name: "Đồ gia dụng", kg: 3 },
      { name: "Nội thất", kg: 12 },
      { name: "Quần áo & phụ kiện", kg: 0.6 },
      { name: "Sách & văn phòng phẩm", kg: 1 },
      { name: "Khác", kg: 1 },
    ],

    distanceUnit: "km",
    maxDistance: 100, // giới hạn khi nhập khoảng cách trong form

    wasteEstimate: {
      unit: "kg",
      defaultKg: 1,
      label: "Ước tính theo khối lượng trung bình của từng danh mục (giả định minh họa của nhóm)",
    },

    // Tin demo để website không trống khi trình bày. Đặt false để ẩn.
    showDemoData: true,
    demoProducts: [
      { id: "demo_1", title: "Nồi cơm điện 1,8 lít", description: "Nấu vẫn chín đều, nắp hơi trầy nhẹ. Kèm xửng hấp.", condition: "Good", category: "Đồ gia dụng", exchangeType: "Sell", distance: 3.5, createdAt: "2026-11-18T08:00:00+07:00" },
      { id: "demo_2", title: "Áo khoác jean", description: "Size M, mặc vài lần, không còn vừa nên muốn tặng lại.", condition: "Like new", category: "Quần áo & phụ kiện", exchangeType: "Give", distance: 1.2, createdAt: "2026-11-19T09:30:00+07:00" },
      { id: "demo_3", title: "Kệ sách gỗ 3 tầng", description: "Chân kệ hơi lỏng, cần siết lại ốc. Muốn đổi lấy bàn học nhỏ.", condition: "Fair", category: "Nội thất", exchangeType: "Exchange", distance: 6, createdAt: "2026-11-20T14:00:00+07:00" },
      { id: "demo_4", title: "Tai nghe có dây", description: "Âm thanh tốt, dây còn nguyên, đổi lấy chuột máy tính.", condition: "Good", category: "Đồ điện tử", exchangeType: "Exchange", distance: 8.5, createdAt: "2026-11-21T10:15:00+07:00" },
      { id: "demo_5", title: "Bộ giáo trình Tin học đại cương", description: "Sách sạch, không ghi chú, phù hợp sinh viên năm nhất.", condition: "Like new", category: "Sách & văn phòng phẩm", exchangeType: "Give", distance: 0.8, createdAt: "2026-11-22T16:45:00+07:00" },
      { id: "demo_6", title: "Quạt bàn mini", description: "Chạy êm, mất nút số 3, phù hợp phòng trọ.", condition: "Fair", category: "Đồ điện tử", exchangeType: "Sell", distance: 12, createdAt: "2026-11-23T19:20:00+07:00" },
      { id: "demo_7", title: "Ghế nhựa gấp gọn", description: "Còn chắc chắn, gấp lại tiết kiệm chỗ.", condition: "Good", category: "Nội thất", exchangeType: "Give", distance: 2.4, createdAt: "2026-11-24T07:40:00+07:00" },
      { id: "demo_8", title: "Balo laptop 15 inch", description: "Ngăn chống sốc, khóa kéo còn tốt, dùng một học kỳ.", condition: "Like new", category: "Quần áo & phụ kiện", exchangeType: "Sell", distance: 4, createdAt: "2026-11-25T20:10:00+07:00" },
    ],
  };

  /* ---------- Hàm tra cứu nhỏ dùng chung (thuần, không đụng DOM) ---------- */

  function findBy(list, key, value) {
    return list.filter(function (item) { return item[key] === value; })[0] || null;
  }

  CEE.data.conditionLabel = function (value) {
    var item = findBy(CEE.data.conditions, "value", value);
    return item ? item.label : value;
  };

  CEE.data.exchangeLabel = function (value) {
    var item = findBy(CEE.data.exchangeTypes, "value", value);
    return item ? item.label : value;
  };

  CEE.data.categoryNames = function () {
    return CEE.data.categories.map(function (c) { return c.name; });
  };

  CEE.data.kgForCategory = function (name) {
    var item = findBy(CEE.data.categories, "name", name);
    return item ? item.kg : CEE.data.wasteEstimate.defaultKg;
  };
})(typeof self !== "undefined" ? self : this);
