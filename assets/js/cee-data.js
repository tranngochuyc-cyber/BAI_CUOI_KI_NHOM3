/**
 * Lớp nối dữ liệu dùng chung. Nạp sau waste-reduction.js và post-listing.js (AI 3),
 * trước các module của AI 1/AI 2.
 *
 *  - window.CEEProductRepository.getAll(): tin đăng (AI 3) + tin demo (cee-config.js) -> Product.
 *  - window.CEEWasteCalculator.getCommunityTotal(): tổng ước tính từ module AI 3.
 *  - window.CEETransactions: nơi "xác nhận giao dịch thành công" gọi vào module AI 3.
 *  - Cầu nối sự kiện để các trang tự cập nhật; cảnh báo khi mở trang bằng file://.
 */
(function (root) {
  "use strict";

  var LISTINGS_KEY = "cee.listings.v1"; // do post-listing.js (AI 3) quản lý
  var LEDGER_KEY = "cee.wasteLedger.v1"; // do waste-reduction.js (AI 3) quản lý
  var config = root.CEEConfig || {};

  /* ---------- Sản phẩm ---------- */

  function toProduct(listing, isDemo) {
    var hasDistance =
      typeof listing.distance === "number" && isFinite(listing.distance) && listing.distance >= 0;

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
        ? { value: listing.distance, unit: config.distanceUnit || "", reference: config.distanceReference || "" }
        : null,
      isDemo: isDemo === true,
    };
  }

  function isObject(item) {
    return item !== null && typeof item === "object";
  }

  root.CEEProductRepository = {
    getAll: function () {
      var own = root.CEEListings && typeof root.CEEListings.getAll === "function"
        ? root.CEEListings.getAll().filter(isObject).map(function (l) { return toProduct(l, false); })
        : [];
      var demo = config.showDemoData && Array.isArray(config.demoProducts)
        ? config.demoProducts.map(function (l) { return toProduct(l, true); })
        : [];
      return own.concat(demo);
    },
  };

  /* ---------- Ước tính rác thải (dùng module AI 3, công thức lấy từ cee-config.js) ---------- */

  var estimate = config.wasteEstimate;

  function kgFor(category) {
    if (!estimate) return null;
    var kg = estimate.kgPerCategory[category];
    return typeof kg === "number" ? kg : estimate.defaultKg;
  }

  var wasteModule = null;
  if (estimate && root.CEEWasteReduction && typeof root.CEEWasteReduction.createWasteModule === "function") {
    wasteModule = root.CEEWasteReduction.createWasteModule({
      // "confirmed: true" ở đây chỉ có nghĩa là quy tắc đủ trường để tính;
      // nội dung quy tắc vẫn là GIẢ ĐỊNH minh họa (xem estimate.label).
      rule: {
        confirmed: true,
        unit: estimate.unit,
        requiredInputs: ["category"],
        compute: function (inputs) { return kgFor(inputs.category); },
      },
    });
  }

  root.CEEWasteCalculator = {
    getCommunityTotal: function () {
      if (!wasteModule) return null;
      var r = wasteModule.getCommunityTotal();
      if (r.status === "OK" || r.status === "NO_DATA") {
        return {
          value: r.status === "OK" ? r.total : 0,
          unit: estimate.unit,
          transactionCount: r.confirmedTransactionCount,
          label: estimate.label,
        };
      }
      return null; // INCOMPLETE / NEED_CONFIRMATION: không hiển thị số
    },
  };

  /* ---------- Xác nhận giao dịch thành công ---------- */

  function fire(name) {
    root.dispatchEvent(new Event(name));
  }

  root.CEETransactions = {
    isCompleted: function (listingId) {
      if (!wasteModule) return false;
      return wasteModule.getLedger().some(function (r) { return r.listingId === listingId; });
    },
    estimateFor: function (product) {
      var kg = product ? kgFor(product.category) : null;
      return kg === null ? null : { value: kg, unit: estimate.unit };
    },
    // Mỗi tin chỉ có một giao dịch (transactionId cố định theo tin) nên bấm lại không cộng trùng.
    confirm: function (product) {
      if (!wasteModule) return { status: "UNAVAILABLE" };
      return wasteModule.recordConfirmedTransaction({
        transactionId: "tx_" + product.id,
        listingId: product.id,
        exchangeType: product.exchangeType,
        transactionConfirmed: true,
        inputs: { category: product.category },
      });
    },
    // Xóa tin tự đăng và sổ giao dịch trên trình duyệt này (để tập dượt lại demo).
    reset: function () {
      try {
        root.localStorage.removeItem(LISTINGS_KEY);
        root.localStorage.removeItem(LEDGER_KEY);
      } catch (e) { /* localStorage bị tắt: không có gì để xóa */ }
      fire("cee:products-updated");
      fire("cee:waste-updated");
    },
  };

  /* ---------- Cầu nối sự kiện ---------- */

  root.addEventListener("cee:listing-created", function () { fire("cee:products-updated"); });
  root.addEventListener("cee:waste-total-changed", function () { fire("cee:waste-updated"); });
  // Cập nhật khi dữ liệu thay đổi ở tab khác (key === null khi localStorage bị xóa hết).
  root.addEventListener("storage", function (event) {
    if (event.key === LISTINGS_KEY || event.key === LEDGER_KEY || event.key === null) fire("cee:products-updated");
    if (event.key === LEDGER_KEY || event.key === null) fire("cee:waste-updated");
  });

  /* ---------- Cảnh báo khi mở trực tiếp bằng file:// ---------- */

  if (root.location && root.location.protocol === "file:") {
    document.addEventListener("DOMContentLoaded", function () {
      var banner = document.createElement("div");
      banner.className = "file-warning";
      banner.setAttribute("role", "alert");
      banner.textContent =
        "Trang đang được mở trực tiếp từ file nên Trang chủ và Danh mục không tải được dữ liệu. " +
        "Hãy chạy file chay-demo.bat (hoặc Live Server trong VS Code) rồi mở http://localhost:8000.";
      document.body.prepend(banner);
    });
  }
})(window);
