/*!
 * logic/listing.js — Kiểm tra (validation) và lưu tin đăng (phần AI 3 — Lê Văn Khoa).
 * Hàm thuần + lưu localStorage. Không đụng DOM (giao diện nằm ở js/ui/post.js).
 * Đăng tin KHÔNG kích hoạt tính lượng rác thải.
 * Dùng được cả trên trình duyệt (window.CEE.listing) lẫn Node (require) để kiểm thử.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(root);
  } else {
    root.CEE = root.CEE || {};
    root.CEE.listing = factory(root);
  }
})(typeof self !== "undefined" ? self : this, function (root) {
  "use strict";

  // Giá trị cố định theo đề bài.
  var EXCHANGE_TYPES = ["Give", "Sell", "Exchange"];
  var CONDITIONS = ["Like new", "Good", "Fair"];

  var data = root && root.CEE && root.CEE.data;
  var CATEGORY_OPTIONS = data ? data.categoryNames() : [];
  var STORAGE_KEY = data ? data.storageKeys.listings : "cee.listings.v1";
  var MAX_DISTANCE = data ? data.maxDistance : 100;

  var LIMITS = {
    titleMin: 3,
    titleMax: 120,
    descriptionMin: 10,
    descriptionMax: 1000,
    imageBytes: 5 * 1024 * 1024, // 5 MB
  };

  /* ---------- Lưu tin (cục bộ trên trình duyệt) ---------- */

  function readAll() {
    try {
      var raw = root.localStorage && root.localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(function (x) { return x && typeof x === "object"; }) : [];
    } catch (e) { return []; }
  }

  function writeAll(list) {
    try {
      root.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch (e) { return false; }
  }

  function newId() {
    return "lst_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  /* ---------- Validate (hàm thuần, kiểm thử được) ---------- */

  /**
   * values = { title, description, condition, category, exchangeType, distance, image:{name,type,size}|null }
   * Trả về { tenTruong: "thông báo lỗi" } — rỗng nghĩa là hợp lệ.
   */
  function validate(values, categoryOptions) {
    var errors = {};
    var title = String(values.title || "").trim();
    var description = String(values.description || "").trim();
    var cats = categoryOptions || CATEGORY_OPTIONS;

    if (!title) errors.title = "Vui lòng nhập tên sản phẩm.";
    else if (title.length < LIMITS.titleMin) errors.title = "Tên sản phẩm cần ít nhất " + LIMITS.titleMin + " ký tự.";
    else if (title.length > LIMITS.titleMax) errors.title = "Tên sản phẩm tối đa " + LIMITS.titleMax + " ký tự.";

    if (!description) errors.description = "Vui lòng nhập mô tả sản phẩm.";
    else if (description.length < LIMITS.descriptionMin) errors.description = "Mô tả cần ít nhất " + LIMITS.descriptionMin + " ký tự để người xem hiểu rõ món đồ.";
    else if (description.length > LIMITS.descriptionMax) errors.description = "Mô tả tối đa " + LIMITS.descriptionMax + " ký tự.";

    if (cats.length && cats.indexOf(values.category) === -1) errors.category = "Vui lòng chọn danh mục.";

    if (CONDITIONS.indexOf(values.condition) === -1) errors.condition = "Vui lòng chọn tình trạng.";

    if (EXCHANGE_TYPES.indexOf(values.exchangeType) === -1) errors.exchange = "Vui lòng chọn Tặng, Bán hoặc Đổi.";

    // Khoảng cách: không bắt buộc; nếu nhập phải là số từ 0 đến MAX_DISTANCE.
    var rawDistance = values.distance == null ? "" : String(values.distance).trim();
    if (rawDistance !== "") {
      var n = Number(rawDistance);
      if (!Number.isFinite(n) || n < 0 || n > MAX_DISTANCE) {
        errors.distance = "Khoảng cách phải là số từ 0 đến " + MAX_DISTANCE + ".";
      }
    }

    if (values.image) {
      if (!/^image\//.test(values.image.type || "")) errors.image = "Vui lòng chọn file ảnh (JPG, PNG, WEBP...).";
      else if (values.image.size > LIMITS.imageBytes) errors.image = "Ảnh tối đa 5 MB.";
    }

    return errors;
  }

  /**
   * Tạo bản ghi tin đăng từ dữ liệu form đã hợp lệ.
   * Ảnh giả lập: chỉ lưu thông tin file + ảnh thu nhỏ trên trình duyệt này, KHÔNG upload lên máy chủ.
   */
  function buildListing(values, categoryOptions) {
    var cats = categoryOptions || CATEGORY_OPTIONS;
    var listing = {
      id: newId(),
      title: String(values.title).trim(),
      description: String(values.description).trim(),
      condition: values.condition,
      exchangeType: values.exchangeType,
      image: values.image
        ? {
            mock: true,
            uploaded: false,
            fileName: values.image.name,
            fileType: values.image.type,
            fileSize: values.image.size,
            thumbnail: typeof values.image.thumbnail === "string" ? values.image.thumbnail : null,
          }
        : null,
      createdAt: new Date().toISOString(),
    };
    if (cats.length) listing.category = values.category;
    var rawDistance = values.distance == null ? "" : String(values.distance).trim();
    if (rawDistance !== "") listing.distance = Number(rawDistance);
    return listing;
  }

  // Lưu tin; nếu bộ nhớ đầy vì ảnh thu nhỏ thì thử lưu lại không kèm ảnh.
  function addListing(listing) {
    var list = readAll();
    list.push(listing);
    var saved = writeAll(list);
    var withoutImage = false;
    if (!saved && listing.image && listing.image.thumbnail) {
      listing.image.thumbnail = null;
      saved = writeAll(list);
      withoutImage = saved;
    }
    if (!saved) return { ok: false };
    try {
      if (typeof root.dispatchEvent === "function" && typeof root.CustomEvent === "function") {
        root.dispatchEvent(new root.CustomEvent("cee:listing-created", { detail: listing }));
      }
    } catch (e) { /* sự kiện chỉ là tiện ích */ }
    return { ok: true, listing: listing, withoutImage: withoutImage };
  }

  return {
    EXCHANGE_TYPES: EXCHANGE_TYPES,
    CONDITIONS: CONDITIONS,
    STORAGE_KEY: STORAGE_KEY,
    LIMITS: LIMITS,
    validate: validate,
    buildListing: buildListing,
    getAll: readAll,
    add: addListing,
  };
});
