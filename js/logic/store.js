/**
 * logic/store.js — Lớp dữ liệu chung nối 3 phần (nhóm trưởng — Trần Ngọc Huy).
 *
 *  - getAllProducts(): tin người dùng (listing.js) + tin demo (data.js) => một cấu trúc Product chung.
 *  - Giao dịch: confirmTransaction(), isCompleted() gọi vào module waste.js.
 *  - Thống kê cho Trang chủ: getStats(), getWasteByCategory().
 *  - Phát một sự kiện duy nhất "cee:data-changed" mỗi khi dữ liệu đổi (kể cả ở tab khác).
 *
 * Product = { id, title, description, condition, category, exchangeType, createdAt,
 *             imageUrl|null, distance:{value,unit}|null, isDemo }
 */
(function (root) {
  "use strict";

  var CEE = (root.CEE = root.CEE || {});
  var data = CEE.data;
  var EVENT = "cee:data-changed";

  function notify() {
    root.dispatchEvent(new CustomEvent(EVENT));
  }

  /* ---------- Sản phẩm ---------- */

  function toProduct(listing, isDemo) {
    var d = listing.distance;
    var hasDistance = typeof d === "number" && Number.isFinite(d) && d >= 0;
    var thumb = listing.image && listing.image.thumbnail;
    return {
      id: listing.id,
      title: listing.title,
      description: listing.description || "",
      condition: listing.condition,
      category: listing.category || "Khác",
      exchangeType: listing.exchangeType,
      createdAt: listing.createdAt,
      imageUrl: typeof thumb === "string" && thumb.indexOf("data:image/") === 0
        ? thumb
        : (isDemo === true && typeof listing.imageSrc === "string" && listing.imageSrc.indexOf("./assets/images/") === 0 ? listing.imageSrc : null),
      distance: hasDistance ? { value: d, unit: data.distanceUnit } : null,
      isDemo: isDemo === true,
    };
  }

  function getAllProducts() {
    var own = CEE.listing.getAll().map(function (l) { return toProduct(l, false); });
    var demo = data.showDemoData ? data.demoProducts.map(function (l) { return toProduct(l, true); }) : [];
    return CEE.filter.sortProducts(own.concat(demo), "newest");
  }

  /* ---------- Giao dịch thành công ---------- */

  function completedIds() {
    return CEE.waste.getLedger().map(function (r) { return r.listingId; });
  }

  function isCompleted(productId) {
    return completedIds().indexOf(productId) !== -1;
  }

  // Mỗi món chỉ có một giao dịch (transactionId cố định theo món) nên bấm lại không cộng trùng.
  function confirmTransaction(product) {
    return CEE.waste.recordConfirmedTransaction({
      transactionId: "tx_" + product.id,
      listingId: product.id,
      exchangeType: product.exchangeType,
      transactionConfirmed: true,
      inputs: { category: product.category },
    });
  }

  function estimateFor(product) {
    return { value: data.kgForCategory(product.category), unit: data.wasteEstimate.unit };
  }

  /* ---------- Thống kê cho Trang chủ ---------- */

  function getStats() {
    var products = getAllProducts();
    var total = CEE.waste.getCommunityTotal();
    var done = completedIds();
    return {
      productCount: products.length,
      availableCount: products.filter(function (p) { return done.indexOf(p.id) === -1; }).length,
      transactionCount: total.confirmedTransactionCount,
      // NO_DATA = chưa có giao dịch => 0; INCOMPLETE/NEED_CONFIRMATION => null (không hiển thị số).
      wasteTotal: total.status === "OK" ? total.total : total.status === "NO_DATA" ? 0 : null,
      unit: data.wasteEstimate.unit,
    };
  }

  // Gộp lượng rác giảm theo danh mục bằng reduce, sắp giảm dần.
  function getWasteByCategory() {
    var groups = CEE.waste.getLedger().reduce(function (acc, r) {
      var calc = CEE.waste.calculateWasteReduced(r.inputs);
      if (calc.status !== "OK") return acc;
      var name = r.inputs.category;
      acc[name] = (acc[name] || 0) + calc.value;
      return acc;
    }, {});
    return Object.keys(groups)
      .map(function (name) { return { category: name, value: groups[name] }; })
      .sort(function (a, b) { return b.value - a.value; });
  }

  /* ---------- Đặt lại dữ liệu demo ---------- */

  function reset() {
    try {
      root.localStorage.removeItem(data.storageKeys.listings);
      root.localStorage.removeItem(data.storageKeys.ledger);
    } catch (e) { /* localStorage bị tắt: không có gì để xóa */ }
    notify();
  }

  /* ---------- Cầu nối sự kiện ---------- */

  root.addEventListener("cee:listing-created", notify);
  root.addEventListener("cee:waste-total-changed", notify);
  // Dữ liệu đổi ở tab khác (key === null khi localStorage bị xóa hết).
  root.addEventListener("storage", function (e) {
    if (e.key === null || e.key === data.storageKeys.listings || e.key === data.storageKeys.ledger) notify();
  });

  CEE.store = {
    EVENT: EVENT,
    getAllProducts: getAllProducts,
    isCompleted: isCompleted,
    confirmTransaction: confirmTransaction,
    estimateFor: estimateFor,
    getStats: getStats,
    getWasteByCategory: getWasteByCategory,
    reset: reset,
  };
})(window);
