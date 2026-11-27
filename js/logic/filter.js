/**
 * logic/filter.js — Tìm kiếm, lọc và sắp xếp sản phẩm (phần AI 2 — Nguyễn Minh Nhật).
 * Hàm thuần: không đụng DOM, không sửa mảng đầu vào. Dùng filter/map/sort.
 * Chạy được cả trên trình duyệt (window.CEE.filter) lẫn Node (require) để kiểm thử.
 */
(function (root) {
  "use strict";

  // Không phân biệt hoa/thường và dấu tiếng Việt: "ban go" khớp "Bàn gỗ".
  function normalize(text) {
    return String(text == null ? "" : text)
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/gi, "d")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  // '' / null / số âm / không phải số => không giới hạn.
  function parseMaxDistance(value) {
    if (value == null || String(value).trim() === "") return null;
    var n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : null;
  }

  // Khoảng cách theo dữ liệu chung { value, unit } (cũng nhận số thuần). Thiếu/sai => null.
  function distanceValue(p) {
    var d = p && p.distance;
    if (d && typeof d === "object") d = d.value;
    return typeof d === "number" && Number.isFinite(d) && d >= 0 ? d : null;
  }

  /**
   * Lọc theo các tiêu chí, kết hợp theo AND.
   * criteria = { keyword, category, condition, exchangeType, maxDistance }
   */
  function filterProducts(products, criteria) {
    var c = criteria || {};
    var keyword = normalize(c.keyword);
    var max = parseMaxDistance(c.maxDistance);

    return products.filter(function (p) {
      if (keyword &&
          normalize(p.title).indexOf(keyword) === -1 &&
          normalize(p.description).indexOf(keyword) === -1) return false;
      if (c.category && p.category !== c.category) return false;
      if (c.condition && p.condition !== c.condition) return false;
      if (c.exchangeType && p.exchangeType !== c.exchangeType) return false;
      if (max !== null) {
        var dist = distanceValue(p);
        // Đang lọc khoảng cách thì sản phẩm không có khoảng cách bị loại.
        if (dist === null || dist > max) return false;
      }
      return true;
    });
  }

  // Sắp xếp: "newest" (mới nhất) | "nearest" (gần nhất, món không có khoảng cách xếp cuối).
  function sortProducts(products, mode) {
    var list = products.slice();
    if (mode === "nearest") {
      return list.sort(function (a, b) {
        var da = distanceValue(a), db = distanceValue(b);
        if (da === null) return db === null ? 0 : 1;
        if (db === null) return -1;
        return da - db;
      });
    }
    return list.sort(function (a, b) { return Date.parse(b.createdAt) - Date.parse(a.createdAt); });
  }

  // Danh mục có trong dữ liệu (không trùng, sắp theo tiếng Việt).
  function getCategories(products) {
    var names = products.map(function (p) { return p.category; }).filter(Boolean);
    return Array.from(new Set(names)).sort(function (a, b) { return a.localeCompare(b, "vi"); });
  }

  var api = {
    normalize: normalize,
    parseMaxDistance: parseMaxDistance,
    distanceValue: distanceValue,
    filterProducts: filterProducts,
    sortProducts: sortProducts,
    getCategories: getCategories,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.CEE = root.CEE || {};
    root.CEE.filter = api;
  }
})(typeof self !== "undefined" ? self : this);
