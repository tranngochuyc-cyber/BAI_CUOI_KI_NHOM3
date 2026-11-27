/**
 * Lớp nối dữ liệu dùng chung (chỉ ĐỌC, không có công thức hay dữ liệu tự tạo).
 * Nạp sau waste-reduction.js và post-listing.js (AI 3), trước các module của AI 1/AI 2.
 *
 *  - window.CEEProductRepository.getAll(): tin đăng của AI 3 -> Product theo hợp đồng của AI 1.
 *  - window.CEEWasteCalculator.getCommunityTotal(): kết quả của AI 3 -> { value, unit } | null.
 *  - Cầu nối sự kiện để Trang chủ/Danh mục tự cập nhật.
 */
(function (root) {
  "use strict";

  var LISTINGS_KEY = "cee.listings.v1"; // do post-listing.js (AI 3) quản lý
  var LEDGER_KEY = "cee.wasteLedger.v1"; // do waste-reduction.js (AI 3) quản lý

  function toProduct(listing) {
    var config = root.CEEConfig || {};
    var hasDistance =
      listing && typeof listing.distance === "number" && isFinite(listing.distance) && listing.distance >= 0;

    return {
      id: listing.id,
      title: listing.title,
      description: listing.description || "",
      // Ảnh chỉ là giả lập (không lưu nội dung ảnh) nên luôn dùng ảnh minh họa mặc định.
      imageUrl: null,
      condition: listing.condition,
      category: listing.category,
      exchangeType: listing.exchangeType,
      createdAt: listing.createdAt,
      distance: hasDistance
        ? {
            value: listing.distance,
            unit: config.distanceUnit || "",
            reference: config.distanceReference || "",
          }
        : null,
    };
  }

  root.CEEProductRepository = {
    getAll: function () {
      if (!root.CEEListings || typeof root.CEEListings.getAll !== "function") return [];
      // Bỏ qua bản ghi hỏng (không phải đối tượng) trong localStorage để không làm hỏng cả danh sách.
      return root.CEEListings.getAll()
        .filter(function (item) { return item && typeof item === "object"; })
        .map(toProduct);
    },
  };

  root.CEEWasteCalculator = {
    getCommunityTotal: function () {
      if (!root.CEEWasteReduction || typeof root.CEEWasteReduction.getCommunityTotal !== "function") {
        return null;
      }
      var result = root.CEEWasteReduction.getCommunityTotal();
      // Chỉ nhận tổng khi module AI 3 báo OK; mọi trạng thái khác = chưa có dữ liệu.
      if (
        result &&
        result.status === "OK" &&
        typeof result.total === "number" &&
        isFinite(result.total) &&
        result.total >= 0 &&
        typeof result.unit === "string" &&
        result.unit.length > 0
      ) {
        return { value: result.total, unit: result.unit };
      }
      return null;
    },
  };

  function fire(name) {
    root.dispatchEvent(new Event(name));
  }

  root.addEventListener("cee:listing-created", function () { fire("cee:products-updated"); });
  root.addEventListener("cee:waste-total-changed", function () { fire("cee:waste-updated"); });
  // Cập nhật khi dữ liệu thay đổi ở tab khác.
  root.addEventListener("storage", function (event) {
    if (event.key === LISTINGS_KEY) fire("cee:products-updated");
    if (event.key === LEDGER_KEY) fire("cee:waste-updated");
  });
})(window);
