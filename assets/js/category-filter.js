/* Logic tìm kiếm/lọc thuần (không đụng DOM). */
(function (root) {
  'use strict';

  // Không phân biệt hoa/thường và dấu tiếng Việt: "ban go" khớp "Bàn gỗ".
  function normalize(text) {
    return String(text == null ? '' : text)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/gi, 'd')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  // '' / null / số âm / không phải số => không giới hạn.
  function parseMaxDistance(value) {
    if (value == null || String(value).trim() === '') return null;
    var n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : null;
  }

  // Khoảng cách theo hợp đồng chung: { value, unit, reference } (cũng nhận số thuần). Thiếu/sai => null.
  function distanceValue(p) {
    var d = p && p.distance;
    if (d && typeof d === 'object') d = d.value;
    return typeof d === 'number' && Number.isFinite(d) && d >= 0 ? d : null;
  }

  // Các điều kiện kết hợp theo AND. Không sửa mảng đầu vào.
  function filterProducts(products, criteria) {
    var c = criteria || {};
    var keyword = normalize(c.keyword);
    var max = parseMaxDistance(c.maxDistance);

    return products.filter(function (p) {
      if (keyword &&
          normalize(p.title).indexOf(keyword) === -1 &&
          normalize(p.description).indexOf(keyword) === -1) return false;
      if (c.category && p.category !== c.category) return false;
      // Đang lọc khoảng cách thì sản phẩm thiếu khoảng cách bị loại.
      if (max !== null) {
        var dist = distanceValue(p);
        if (dist === null || dist > max) return false;
      }
      return true;
    });
  }

  // Danh mục lấy từ dữ liệu chung, không tự đặt danh sách.
  function getCategories(products) {
    var names = products.map(function (p) { return p.category; }).filter(Boolean);
    return Array.from(new Set(names)).sort(function (a, b) { return a.localeCompare(b, 'vi'); });
  }

  var api = { normalize: normalize, parseMaxDistance: parseMaxDistance,
              filterProducts: filterProducts, getCategories: getCategories };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else {
    root.CEE = root.CEE || {};
    root.CEE.filter = api;
  }
})(this);
