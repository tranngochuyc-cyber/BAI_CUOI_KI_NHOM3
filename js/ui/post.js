/**
 * ui/post.js — Trang Đăng tin (phần AI 3 — Lê Văn Khoa).
 * Form validation trực quan, ảnh giả lập có xem trước, hiển thị ngay tin vừa đăng.
 * Logic kiểm tra và lưu nằm ở js/logic/listing.js.
 */
(function (root) {
  "use strict";

  var CEE = root.CEE;
  var $ = function (id) { return document.getElementById(id); };

  var form = $("listing-form");
  var els = {
    title: $("title"),
    description: $("description"),
    count: $("description-count"),
    category: $("category"),
    condition: $("condition"),
    distance: $("distance"),
    image: $("image"),
    preview: $("image-preview"),
    previewImg: $("image-preview-img"),
    imageName: $("image-name"),
    clear: $("image-clear"),
    result: $("result"),
    resultText: $("result-text"),
    resultCard: $("result-card"),
    myGrid: $("my-listings"),
  };
  var ERROR_KEYS = ["title", "description", "category", "condition", "exchange", "distance", "image"];
  var FIELD_FOR_ERROR = { exchange: "exchange-give" };
  var imageInfo = null; // { name, type, size, thumbnail }
  var submitted = false; // chỉ báo lỗi khi gõ sau lần bấm "Đăng tin" đầu tiên

  /* ---------- Đổ lựa chọn từ data.js ---------- */

  CEE.data.categories.map(function (c) { return new Option(c.name, c.name); })
    .forEach(function (o) { els.category.add(o); });
  CEE.data.conditions.map(function (c) { return new Option(c.value + " – " + c.label + " (" + c.hint + ")", c.value); })
    .forEach(function (o) { els.condition.add(o); });
  $("distance-unit").textContent = CEE.data.distanceUnit;
  els.distance.max = String(CEE.data.maxDistance);

  /* ---------- Hiển thị lỗi ---------- */

  function setError(key, message) {
    var box = $(key + "-error");
    if (box) box.textContent = message || "";
    var field = key === "exchange" ? $("exchange-group") : $(key);
    if (field) {
      if (message) field.setAttribute("aria-invalid", "true");
      else field.removeAttribute("aria-invalid");
    }
  }

  function currentValues() {
    var checked = form.querySelector('input[name="exchangeType"]:checked');
    return {
      title: els.title.value,
      description: els.description.value,
      category: els.category.value,
      condition: els.condition.value,
      exchangeType: checked ? checked.value : "",
      distance: els.distance.value,
      image: imageInfo,
    };
  }

  function showErrors(errors) {
    ERROR_KEYS.forEach(function (k) { setError(k, errors[k]); });
  }

  /* ---------- Ảnh giả lập: xem trước + ảnh thu nhỏ lưu trên trình duyệt ---------- */

  function clearImage() {
    imageInfo = null;
    els.image.value = "";
    els.previewImg.removeAttribute("src");
    els.preview.hidden = true;
    els.imageName.textContent = "";
  }

  // Thu nhỏ ảnh bằng canvas (tối đa 480px) để lưu được trong localStorage. Không gửi lên máy chủ.
  function makeThumbnail(dataUrl, done) {
    var img = new Image();
    img.onload = function () {
      var scale = Math.min(1, 480 / Math.max(img.width, img.height));
      var canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      done(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = function () { done(null); };
    img.src = dataUrl;
  }

  els.image.addEventListener("change", function () {
    var file = els.image.files && els.image.files[0];
    if (!file) { clearImage(); return; }
    var info = { name: file.name, type: file.type, size: file.size };
    var errors = CEE.listing.validate({ image: info });
    if (errors.image) {
      clearImage();
      setError("image", errors.image);
      return;
    }
    setError("image", "");
    var reader = new FileReader();
    reader.onload = function () {
      makeThumbnail(reader.result, function (thumb) {
        imageInfo = { name: info.name, type: info.type, size: info.size, thumbnail: thumb };
        els.previewImg.src = thumb || reader.result;
        els.imageName.textContent = file.name + " · " + Math.round(file.size / 1024) + " KB";
        els.preview.hidden = false;
      });
    };
    reader.readAsDataURL(file);
  });

  els.clear.addEventListener("click", clearImage);

  /* ---------- Tương tác form ---------- */

  els.description.addEventListener("input", function () {
    els.count.textContent = String(els.description.value.length);
  });

  // Kiểm tra lại ngay khi người dùng sửa (sau lần gửi đầu) để lỗi biến mất trực quan.
  form.addEventListener("input", function () {
    if (submitted) showErrors(CEE.listing.validate(currentValues()));
  });
  form.addEventListener("change", function (e) {
    if (submitted && e.target !== els.image) showErrors(CEE.listing.validate(currentValues()));
  });

  form.addEventListener("reset", function () {
    submitted = false;
    clearImage();
    showErrors({});
    els.count.textContent = "0";
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    submitted = true;
    var values = currentValues();
    var errors = CEE.listing.validate(values);
    showErrors(errors);

    var firstKey = ERROR_KEYS.filter(function (k) { return errors[k]; })[0];
    if (firstKey) {
      var target = $(FIELD_FOR_ERROR[firstKey] || firstKey);
      if (target) target.focus();
      CEE.ui.toast("Vui lòng kiểm tra lại các trường được đánh dấu đỏ.");
      return;
    }

    var saved = CEE.listing.add(CEE.listing.buildListing(values));
    if (!saved.ok) {
      CEE.ui.toast("Không lưu được tin (bộ nhớ trình duyệt bị tắt hoặc đã đầy).");
      return;
    }

    var product = CEE.store.getAllProducts().filter(function (p) { return p.id === saved.listing.id; })[0];
    els.resultText.textContent = "Tin “" + saved.listing.title + "” đã được đăng và xuất hiện ngay trên Trang chủ và Danh mục." +
      (saved.withoutImage ? " (Bộ nhớ trình duyệt đầy nên tin được lưu không kèm ảnh.)" : "");
    CEE.ui.renderProductGrid(els.resultCard, product ? [product] : []);
    form.reset();
    els.result.hidden = false;
    els.result.focus();
    renderMyListings();
  });

  /* ---------- Tin bạn đã đăng ---------- */

  function renderMyListings() {
    var mine = CEE.store.getAllProducts().filter(function (p) { return !p.isDemo; });
    $("my-count").textContent = mine.length ? "(" + mine.length + ")" : "";
    CEE.ui.renderProductGrid(els.myGrid, mine, { emptyMessage: "Bạn chưa đăng tin nào trên trình duyệt này." });
  }

  root.addEventListener("storage", renderMyListings);
  root.addEventListener(CEE.store.EVENT, function () {
    // Cập nhật trạng thái "Đã giao dịch" khi xác nhận ở tab khác.
    renderMyListings();
  });
  renderMyListings();
})(window);
