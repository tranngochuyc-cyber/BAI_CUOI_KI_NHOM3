/**
 * ui/home.js — Trang chủ (phần AI 1 — Trần Ngọc Huy).
 * Hiển thị mặt hàng mới đăng và widget thống kê; tự cập nhật khi dữ liệu thay đổi.
 */
(function (root) {
  "use strict";

  var CEE = root.CEE;
  var LATEST_LIMIT = 8;

  var $ = function (id) { return document.getElementById(id); };
  var latestGrid = $("latest-products");
  var wasteValue = $("stat-waste");
  var wasteNote = $("stat-waste-note");
  var txValue = $("stat-transactions");
  var availableValue = $("stat-available");
  var breakdown = $("waste-breakdown");
  var categoryLinks = $("category-links");

  function renderLatest() {
    var latest = CEE.store.getAllProducts().slice(0, LATEST_LIMIT);
    CEE.ui.renderProductGrid(latestGrid, latest, { emptyMessage: "Chưa có mặt hàng nào. Hãy là người đăng tin đầu tiên!" });
  }

  function renderStats() {
    var s = CEE.store.getStats();
    availableValue.textContent = CEE.ui.formatNumber(s.availableCount);
    txValue.textContent = CEE.ui.formatNumber(s.transactionCount);

    if (s.wasteTotal === null) {
      wasteValue.textContent = "Chưa có dữ liệu";
      wasteNote.textContent = "Có giao dịch chưa đủ dữ liệu để tính.";
      return;
    }
    wasteValue.textContent = CEE.ui.formatNumber(s.wasteTotal) + " " + s.unit;
    wasteNote.textContent = s.transactionCount === 0
      ? "Chưa có giao dịch thành công. Bấm “Xác nhận giao dịch” trên một món đồ để bắt đầu."
      : "Từ " + s.transactionCount + " giao dịch thành công. " + CEE.data.wasteEstimate.label + ".";
  }

  // Biểu đồ thanh bằng CSS: độ dài thanh = tỉ lệ so với danh mục lớn nhất.
  function renderBreakdown() {
    var rows = CEE.store.getWasteByCategory();
    breakdown.replaceChildren();
    if (!rows.length) {
      var empty = document.createElement("p");
      empty.className = "breakdown__empty";
      empty.textContent = "Biểu đồ sẽ xuất hiện sau giao dịch thành công đầu tiên.";
      breakdown.append(empty);
      return;
    }
    var max = rows[0].value;
    rows.map(function (row) {
      var item = document.createElement("li");
      item.className = "breakdown__row";
      item.innerHTML =
        '<span class="breakdown__label"></span>' +
        '<span class="breakdown__track"><span class="breakdown__bar"></span></span>' +
        '<span class="breakdown__value"></span>';
      item.querySelector(".breakdown__label").textContent = row.category;
      item.querySelector(".breakdown__bar").style.width = Math.max(6, (row.value / max) * 100) + "%";
      item.querySelector(".breakdown__value").textContent = CEE.ui.formatNumber(row.value) + " kg";
      return item;
    }).forEach(function (item) { breakdown.append(item); });
  }

  // Lối tắt sang trang Danh mục: thẻ có ảnh (lấy từ một món trong danh mục, ưu tiên ảnh demo)
  // và số món đang có.
  function renderCategoryLinks() {
    var products = CEE.store.getAllProducts();
    categoryLinks.replaceChildren();
    CEE.data.categories
      .map(function (c) {
        var inCat = products.filter(function (p) { return p.category === c.name; });
        var withImage = inCat.filter(function (p) { return p.imageUrl && p.isDemo; })[0] ||
          inCat.filter(function (p) { return p.imageUrl; })[0];
        return { name: c.name, count: inCat.length, image: withImage ? withImage.imageUrl : null };
      })
      .filter(function (c) { return c.count > 0; })
      .forEach(function (c) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.className = "chip category-tile";
        a.href = "./category.html?category=" + encodeURIComponent(c.name);
        if (c.image) {
          var img = document.createElement("img");
          img.className = "category-tile__image";
          img.src = c.image;
          img.alt = "";
          img.loading = "lazy";
          a.append(img);
        }
        var label = document.createElement("span");
        label.className = "category-tile__label";
        label.textContent = c.name;
        var count = document.createElement("span");
        count.className = "category-tile__count";
        count.textContent = c.count + " món";
        a.append(label, count);
        a.setAttribute("aria-label", c.name + ", " + c.count + " món");
        li.append(a);
        categoryLinks.append(li);
      });
  }

  function refresh() {
    renderStats();
    renderBreakdown();
    renderCategoryLinks();
    renderLatest();
  }

  // Nút đặt lại dữ liệu để tập dượt demo (chỉ xóa dữ liệu trên trình duyệt này, giữ tin demo).
  $("reset-demo").addEventListener("click", function () {
    var ok = root.confirm("Xóa các tin bạn đã đăng và các giao dịch đã xác nhận trên trình duyệt này? Tin demo vẫn được giữ.");
    if (ok) {
      CEE.store.reset();
      CEE.ui.toast("Đã đặt lại dữ liệu demo.");
    }
  });

  // Cập nhật số liệu ngay khi có giao dịch/tin mới (kể cả từ tab khác), không cần tải lại trang.
  root.addEventListener(CEE.store.EVENT, function () {
    renderStats();
    renderBreakdown();
  });
  root.addEventListener("cee:listing-created", function () { renderLatest(); renderCategoryLinks(); });
  root.addEventListener("storage", function () { renderLatest(); renderCategoryLinks(); });

  refresh();
})(window);
