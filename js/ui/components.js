/**
 * ui/components.js — Thành phần giao diện dùng chung (phần AI 1 — Trần Ngọc Huy).
 *  - renderProductGrid(): Product Grid dùng cho cả Trang chủ, Danh mục và Đăng tin.
 *  - Badges tình trạng (Like new / Good / Fair) và loại hình (Tặng / Bán / Đổi).
 *  - toast(): thông báo ngắn ở góc màn hình.
 * Chỉ hiển thị: không tìm kiếm, không lọc, không tính toán rác thải.
 */
(function (root) {
  "use strict";

  var CEE = (root.CEE = root.CEE || {});
  var data = CEE.data;
  var numberFormat = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });
  var dateFormat = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  var CONDITION_CLASS = { "Like new": "badge--like-new", Good: "badge--good", Fair: "badge--fair" };
  var EXCHANGE_CLASS = { Give: "badge--give", Sell: "badge--sell", Exchange: "badge--exchange" };

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function formatNumber(value) {
    return numberFormat.format(value);
  }

  /* ---------- Badges ---------- */

  function conditionBadge(condition) {
    var badge = el("span", "badge " + (CONDITION_CLASS[condition] || ""), condition);
    badge.title = "Tình trạng: " + data.conditionLabel(condition);
    return badge;
  }

  function exchangeBadge(type) {
    var badge = el("span", "badge " + (EXCHANGE_CLASS[type] || ""), data.exchangeLabel(type));
    badge.title = "Loại hình trao đổi: " + data.exchangeLabel(type) + " (" + type + ")";
    return badge;
  }

  /* ---------- Thẻ sản phẩm ---------- */

  function createMedia(product) {
    var media = el("div", "product-card__media");
    if (product.imageUrl) {
      var img = el("img", "product-card__image");
      img.src = product.imageUrl;
      img.alt = "Ảnh " + product.title;
      img.loading = "lazy";
      media.append(img);
    } else {
      var fallback = el("div", "product-card__fallback");
      fallback.setAttribute("aria-hidden", "true");
      fallback.innerHTML =
        '<svg viewBox="0 0 64 64" focusable="false"><path d="M18 45.5h28a7.5 7.5 0 0 0 .8-15 14.8 14.8 0 0 0-28.6-2.2A9 9 0 0 0 18 45.5Z"/><path d="m25 34 5 5 10-12"/></svg>';
      media.append(fallback);
    }

    var top = el("div", "product-card__badges");
    top.append(conditionBadge(product.condition));
    if (product.isDemo) {
      var demo = el("span", "badge badge--demo", "Tin demo");
      demo.title = "Dữ liệu minh họa để trình bày, không phải tin đăng thật";
      top.append(demo);
    }
    media.append(top);
    return media;
  }

  function markDone(action, product) {
    var est = CEE.store.estimateFor(product);
    var done = el(
      "p",
      "product-card__done",
      "✓ Đã giao dịch · giảm ~" + formatNumber(est.value) + " " + est.unit + " rác (ước tính)"
    );
    action.replaceChildren(done);
  }

  function createAction(product) {
    var action = el("div", "product-card__action");
    if (CEE.store.isCompleted(product.id)) {
      markDone(action, product);
      return action;
    }
    var button = el("button", "btn btn--outline btn--block", "✓ Xác nhận giao dịch");
    button.type = "button";
    button.setAttribute("aria-label", "Xác nhận giao dịch thành công: " + product.title);
    button.addEventListener("click", function () {
      var result = CEE.store.confirmTransaction(product);
      if (result.status === "RECORDED" || result.status === "DUPLICATE") {
        markDone(action, product);
        var est = CEE.store.estimateFor(product);
        toast("Đã ghi nhận giao dịch “" + product.title + "”. Giảm ~" + formatNumber(est.value) + " " + est.unit + " rác thải.");
      } else {
        toast("Không ghi nhận được giao dịch. Vui lòng thử lại.");
      }
    });
    action.append(button);
    return action;
  }

  function createProductCard(product) {
    var card = el("article", "product-card");
    card.setAttribute("role", "listitem");
    card.dataset.productId = product.id;

    var body = el("div", "product-card__body");
    var tags = el("div", "product-card__tags");
    tags.append(exchangeBadge(product.exchangeType), el("span", "product-card__category", product.category));
    body.append(tags, el("h3", "product-card__title", product.title));
    if (product.description) body.append(el("p", "product-card__description", product.description));

    var meta = el("ul", "product-card__meta");
    if (product.distance) {
      meta.append(el("li", null, "📍 Cách " + formatNumber(product.distance.value) + " " + product.distance.unit));
    }
    var time = el("time", null, "Đăng " + dateFormat.format(new Date(product.createdAt)));
    time.dateTime = product.createdAt;
    var timeItem = el("li");
    timeItem.append(time);
    meta.append(timeItem);
    body.append(meta, createAction(product));

    card.append(createMedia(product), body);
    return card;
  }

  /**
   * Vẽ danh sách sản phẩm vào container (thay toàn bộ nội dung mỗi lần gọi).
   * products: mảng đã được trang gọi tìm kiếm/lọc/sắp xếp sẵn.
   */
  function renderProductGrid(container, products, options) {
    var opts = options || {};
    container.replaceChildren();
    if (!products.length) {
      var empty = el("p", "grid-state", opts.emptyMessage || "Chưa có sản phẩm phù hợp để hiển thị.");
      empty.setAttribute("role", "status");
      container.append(empty);
      return 0;
    }
    container.append.apply(container, products.map(createProductCard));
    return products.length;
  }

  /* ---------- Thông báo ngắn ---------- */

  var toastTimer = null;
  function toast(message) {
    var box = document.getElementById("toast");
    if (!box) {
      box = el("div", "toast");
      box.id = "toast";
      box.setAttribute("role", "status");
      box.setAttribute("aria-live", "polite");
      document.body.append(box);
    }
    box.textContent = message;
    box.classList.add("toast--show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { box.classList.remove("toast--show"); }, 3200);
  }

  CEE.ui = {
    formatNumber: formatNumber,
    conditionBadge: conditionBadge,
    exchangeBadge: exchangeBadge,
    createProductCard: createProductCard,
    renderProductGrid: renderProductGrid,
    toast: toast,
  };
})(window);
