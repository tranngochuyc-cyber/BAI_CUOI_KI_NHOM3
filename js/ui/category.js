/**
 * ui/category.js — Trang Danh mục sản phẩm (phần AI 2 — Nguyễn Minh Nhật).
 * Nối các ô tìm kiếm/lọc với logic/filter.js và Product Grid dùng chung (ui/components.js).
 * Kết quả cập nhật ngay khi gõ hoặc đổi bộ lọc (real-time).
 */
(function (root) {
  "use strict";

  var CEE = root.CEE;
  var $ = function (id) { return document.getElementById(id); };

  var form = $("filter-form");
  var fields = {
    keyword: $("search-input"),
    category: $("category-select"),
    condition: $("condition-select"),
    exchangeType: $("exchange-select"),
    maxDistance: $("distance-input"),
    sort: $("sort-select"),
  };
  var status = $("result-status");
  var grid = $("product-grid");
  var products = [];
  var lastKey = ""; // điều kiện của lần vẽ trước

  function fillSelect(select, items) {
    var current = select.value;
    var first = select.options[0];
    select.replaceChildren(first);
    items.map(function (item) { return new Option(item.label, item.value); })
      .forEach(function (option) { select.add(option); });
    select.value = items.some(function (i) { return i.value === current; }) ? current : "";
  }

  function fillOptions() {
    fillSelect(fields.category, CEE.filter.getCategories(products).map(function (name) {
      return { value: name, label: name };
    }));
    fillSelect(fields.condition, CEE.data.conditions.map(function (c) {
      return { value: c.value, label: c.value + " – " + c.label };
    }));
    fillSelect(fields.exchangeType, CEE.data.exchangeTypes.map(function (t) {
      return { value: t.value, label: t.label };
    }));
  }

  function currentCriteria() {
    return {
      keyword: fields.keyword.value,
      category: fields.category.value,
      condition: fields.condition.value,
      exchangeType: fields.exchangeType.value,
      maxDistance: fields.maxDistance.value,
    };
  }

  // force = true khi dữ liệu đổi. Không vẽ lại nếu điều kiện không đổi: tránh mất cú bấm
  // khi ô tìm kiếm mất focus (sự kiện change) đúng lúc người dùng bấm nút trên thẻ.
  function update(force) {
    var key = JSON.stringify([currentCriteria(), fields.sort.value]);
    if (force !== true && key === lastKey) return;
    lastKey = key;
    var filtered = CEE.filter.filterProducts(products, currentCriteria());
    var result = CEE.filter.sortProducts(filtered, fields.sort.value);
    CEE.ui.renderProductGrid(grid, result, { emptyMessage: "Không có sản phẩm phù hợp. Thử bỏ bớt điều kiện lọc." });
    status.textContent = result.length
      ? "Tìm thấy " + result.length + " / " + products.length + " sản phẩm."
      : "Không có sản phẩm phù hợp.";
  }

  function load() {
    products = CEE.store.getAllProducts();
    fillOptions();
    update(true);
  }

  $("distance-label").textContent = "Khoảng cách tối đa (" + CEE.data.distanceUnit + ")";

  // Hỗ trợ mở sẵn bộ lọc qua URL, ví dụ category.html?category=Nội thất
  var params = new URLSearchParams(root.location.search);

  form.addEventListener("submit", function (e) { e.preventDefault(); });
  form.addEventListener("input", update);
  form.addEventListener("change", update);
  form.addEventListener("reset", function () { setTimeout(update, 0); });
  root.addEventListener("cee:listing-created", load);
  root.addEventListener("storage", load);

  load();
  if (params.get("category")) {
    fields.category.value = params.get("category");
    update(true);
  }
})(window);
