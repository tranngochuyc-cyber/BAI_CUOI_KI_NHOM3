/*!
 * post-listing.js — AI 3 / Circular Economy Exchange
 * Logic của Trang Đăng tin: validate form, chọn ảnh giả lập, lưu tin cục bộ.
 *
 * Phạm vi: chỉ trang Đăng tin. Không đụng tới Trang chủ, Product Grid, tìm kiếm/lọc.
 * Đăng tin KHÔNG kích hoạt tính lượng rác thải.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(root);
  } else {
    root.CEEListings = factory(root);
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', root.CEEListings.init);
      } else {
        root.CEEListings.init();
      }
    }
  }
})(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';

  // Giá trị cố định theo README.
  var EXCHANGE_TYPES = ['Give', 'Sell', 'Exchange'];
  var CONDITIONS = ['Like new', 'Good', 'Fair'];

  // NEED CONFIRMATION: README không liệt kê danh mục. Danh sách mẫu nằm ở
  // assets/js/cee-config.js (dữ liệu mẫu chờ nhóm xác nhận). Rỗng thì ô Danh mục bị ẩn.
  var CATEGORY_OPTIONS = (root.CEEConfig && Array.isArray(root.CEEConfig.categories))
    ? root.CEEConfig.categories.slice()
    : [];

  // NEED CONFIRMATION: README không quy định backend/CSDL. Đây chỉ là lưu cục bộ
  // trên trình duyệt cho bản demo; khóa lưu cần thống nhất với AI 1 và AI 2.
  var STORAGE_KEY = 'cee.listings.v1';

  var LIMITS = { title: 120, description: 1000 };

  /* ---------- Lưu tin (cục bộ) ---------- */

  function readAll() {
    try {
      var raw = root.localStorage && root.localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  }

  function writeAll(list) {
    try {
      root.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch (e) { return false; }
  }

  function newId() {
    return 'lst_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  /* ---------- Validate (hàm thuần, test được) ---------- */

  function validate(values, categoryOptions) {
    var errors = {};
    var title = (values.title || '').trim();
    var description = (values.description || '').trim();
    var cats = categoryOptions || CATEGORY_OPTIONS;

    if (!title) errors.title = 'Vui lòng nhập tên sản phẩm.';
    else if (title.length > LIMITS.title) errors.title = 'Tên sản phẩm tối đa ' + LIMITS.title + ' ký tự.';

    if (!description) errors.description = 'Vui lòng nhập mô tả sản phẩm.';
    else if (description.length > LIMITS.description) errors.description = 'Mô tả tối đa ' + LIMITS.description + ' ký tự.';

    if (CONDITIONS.indexOf(values.condition) === -1) errors.condition = 'Vui lòng chọn tình trạng.';

    if (cats.length && cats.indexOf(values.category) === -1) errors.category = 'Vui lòng chọn danh mục.';

    // Khoảng cách: không bắt buộc, nếu nhập phải là số >= 0 (nhập tay, không định vị).
    var rawDistance = values.distance == null ? '' : String(values.distance).trim();
    if (rawDistance !== '' && !(isFinite(Number(rawDistance)) && Number(rawDistance) >= 0)) {
      errors.distance = 'Khoảng cách phải là số không âm.';
    }

    if (EXCHANGE_TYPES.indexOf(values.exchangeType) === -1) errors.exchange = 'Vui lòng chọn Give, Sell hoặc Exchange.';

    if (values.image && !/^image\//.test(values.image.type || '')) errors.image = 'Vui lòng chọn một file ảnh.';

    return errors;
  }

  function buildListing(values, categoryOptions) {
    var cats = categoryOptions || CATEGORY_OPTIONS;
    var listing = {
      id: newId(),
      title: values.title.trim(),
      description: values.description.trim(),
      condition: values.condition,
      exchangeType: values.exchangeType,
      // Ảnh giả lập: chỉ lưu thông tin file, KHÔNG lưu nội dung ảnh, KHÔNG upload.
      image: values.image
        ? { mock: true, uploaded: false, fileName: values.image.name, fileType: values.image.type, fileSize: values.image.size }
        : null,
      createdAt: new Date().toISOString()
    };
    if (cats.length) listing.category = values.category;
    var rawDistance = values.distance == null ? '' : String(values.distance).trim();
    if (rawDistance !== '') listing.distance = Number(rawDistance);
    return listing;
  }

  function addListing(listing) {
    var list = readAll();
    list.push(listing);
    if (!writeAll(list)) return false;
    try {
      if (typeof root.dispatchEvent === 'function' && typeof root.CustomEvent === 'function') {
        root.dispatchEvent(new root.CustomEvent('cee:listing-created', { detail: listing }));
      }
    } catch (e) { /* sự kiện chỉ là tiện ích */ }
    return true;
  }

  /* ---------- Giao diện ---------- */

  function init() {
    var doc = root.document;
    var form = doc.getElementById('listing-form');
    if (!form) return;

    var els = {
      title: doc.getElementById('title'),
      description: doc.getElementById('description'),
      count: doc.getElementById('description-count'),
      condition: doc.getElementById('condition'),
      categoryField: doc.getElementById('category-field'),
      category: doc.getElementById('category'),
      distance: doc.getElementById('distance'),
      distanceLabel: doc.getElementById('distance-label'),
      image: doc.getElementById('image'),
      preview: doc.getElementById('image-preview'),
      previewImg: doc.getElementById('image-preview-img'),
      imageName: doc.getElementById('image-name'),
      clear: doc.getElementById('image-clear'),
      result: doc.getElementById('result'),
      resultText: doc.getElementById('result-text')
    };
    var previewUrl = null;

    if (CATEGORY_OPTIONS.length) {
      CATEGORY_OPTIONS.forEach(function (c) {
        var o = doc.createElement('option');
        o.value = c; o.textContent = c;
        els.category.appendChild(o);
      });
      els.categoryField.hidden = false;
    }

    var unit = root.CEEConfig && root.CEEConfig.distanceUnit;
    if (unit && els.distanceLabel) els.distanceLabel.textContent = 'Khoảng cách (' + unit + ', giả lập)';

    function setError(key, msg) {
      var p = doc.getElementById(key + '-error');
      if (p) p.textContent = msg || '';
    }

    function clearErrors() {
      ['title', 'description', 'condition', 'category', 'distance', 'exchange', 'image'].forEach(function (k) { setError(k, ''); });
    }

    function releasePreview() {
      if (previewUrl) { root.URL.revokeObjectURL(previewUrl); previewUrl = null; }
      els.previewImg.removeAttribute('src');
      els.preview.hidden = true;
      els.imageName.textContent = '';
    }

    function currentValues() {
      var checked = form.querySelector('input[name="exchangeType"]:checked');
      var file = els.image.files && els.image.files[0];
      return {
        title: els.title.value,
        description: els.description.value,
        condition: els.condition.value,
        category: els.category.value,
        distance: els.distance.value,
        exchangeType: checked ? checked.value : '',
        image: file ? { name: file.name, type: file.type, size: file.size } : null
      };
    }

    els.description.addEventListener('input', function () {
      els.count.textContent = String(els.description.value.length);
    });

    els.image.addEventListener('change', function () {
      releasePreview();
      setError('image', '');
      var file = els.image.files && els.image.files[0];
      if (!file) return;
      if (!/^image\//.test(file.type)) {
        setError('image', 'Vui lòng chọn một file ảnh.');
        els.image.value = '';
        return;
      }
      // Xem trước cục bộ bằng object URL — không có yêu cầu mạng nào.
      previewUrl = root.URL.createObjectURL(file);
      els.previewImg.src = previewUrl;
      els.imageName.textContent = file.name;
      els.preview.hidden = false;
    });

    els.clear.addEventListener('click', function () {
      els.image.value = '';
      releasePreview();
    });

    form.addEventListener('reset', function () {
      releasePreview();
      clearErrors();
      els.count.textContent = '0';
      els.result.hidden = true;
    });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      clearErrors();
      els.result.hidden = true;

      var values = currentValues();
      var errors = validate(values);
      var keys = Object.keys(errors);
      if (keys.length) {
        keys.forEach(function (k) { setError(k, errors[k]); });
        var firstId = { exchange: 'exchange-error' }[keys[0]] || keys[0];
        var target = doc.getElementById(firstId);
        if (keys[0] === 'exchange') target = form.querySelector('input[name="exchangeType"]');
        if (target && target.focus) target.focus();
        return;
      }

      var listing = buildListing(values);
      if (!addListing(listing)) {
        els.resultText.textContent = 'Không lưu được tin đăng vào bộ nhớ trình duyệt. Tin chưa được ghi lại.';
        els.result.hidden = false;
        els.result.focus();
        return;
      }
      els.resultText.textContent = '“' + listing.title + '” (' + listing.exchangeType + ') đã được lưu cục bộ trong trình duyệt này. ' +
        'Đây là bản demo: tin và ảnh chưa được gửi lên máy chủ.';
      form.reset();
      els.result.hidden = false;
      els.result.focus();
    });
  }

  return {
    EXCHANGE_TYPES: EXCHANGE_TYPES,
    CONDITIONS: CONDITIONS,
    STORAGE_KEY: STORAGE_KEY,
    validate: validate,
    buildListing: buildListing,
    getAll: readAll,
    add: addListing,
    init: init
  };
});
