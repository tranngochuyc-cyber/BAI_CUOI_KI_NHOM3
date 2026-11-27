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
    var more = el("button", "product-card__more", "Xem chi tiết");
    more.type = "button";
    more.setAttribute("aria-label", "Xem chi tiết: " + product.title);
    more.addEventListener("click", function () { openDetail(product, card); });
    body.append(more);

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
    // Bấm vào vùng trống của thẻ cũng mở chi tiết (nút và liên kết giữ chức năng riêng).
    card.addEventListener("click", function (event) {
      if (event.target.closest("button, a")) return;
      openDetail(product, card);
    });
    return card;
  }

  /* ---------- Hộp chi tiết món đồ ---------- */

  var detailDialog = null;

  function ensureDetailDialog() {
    if (detailDialog) return detailDialog;
    detailDialog = el("dialog", "detail");
    detailDialog.setAttribute("aria-labelledby", "detail-title");
    // Bấm ra ngoài hộp (vùng backdrop) thì đóng.
    detailDialog.addEventListener("click", function (event) {
      if (event.target === detailDialog) detailDialog.close();
    });
    document.body.append(detailDialog);
    return detailDialog;
  }

  function openDetail(product, card) {
    if (typeof HTMLDialogElement === "undefined") return;
    var dialog = ensureDetailDialog();
    dialog.replaceChildren();

    var media = createMedia(product);
    media.classList.add("detail__media");

    var body = el("div", "detail__body");
    var tags = el("div", "product-card__tags");
    tags.append(exchangeBadge(product.exchangeType), el("span", "product-card__category", product.category));
    var title = el("h2", "detail__title", product.title);
    title.id = "detail-title";
    body.append(tags, title);
    body.append(el("p", "detail__description", product.description || "Chưa có mô tả."));

    var facts = el("dl", "detail__facts");
    function fact(label, value) {
      var wrap = el("div");
      wrap.append(el("dt", null, label), el("dd", null, value));
      facts.append(wrap);
    }
    fact("Tình trạng", data.conditionLabel(product.condition) + " (" + product.condition + ")");
    fact("Loại hình", data.exchangeLabel(product.exchangeType));
    fact("Khoảng cách", product.distance ? formatNumber(product.distance.value) + " " + product.distance.unit : "Chưa có dữ liệu");
    fact("Ngày đăng", dateFormat.format(new Date(product.createdAt)));
    var est = CEE.store.estimateFor(product);
    fact("Rác thải giảm (ước tính)", "~" + formatNumber(est.value) + " " + est.unit);
    body.append(facts);
    if (product.isDemo) body.append(el("p", "detail__note", "Tin demo: dữ liệu minh họa để trình bày, ảnh chỉ mang tính minh họa."));

    var action = createAction(product);
    var confirmButton = action.querySelector("button");
    if (confirmButton) {
      // Sau khi xác nhận trong hộp này, đồng bộ lại nút trên thẻ ở trang.
      confirmButton.addEventListener("click", function () {
        setTimeout(function () {
          var cardAction = card && card.querySelector(".product-card__action");
          if (cardAction) cardAction.replaceWith(createAction(product));
        }, 0);
      });
    }
    var close = el("button", "btn btn--ghost detail__close", "Đóng");
    close.type = "button";
    close.addEventListener("click", function () { dialog.close(); });
    var footer = el("div", "detail__footer");
    footer.append(action, close);
    body.append(footer);

    dialog.append(media, body);
    dialog.showModal();
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
