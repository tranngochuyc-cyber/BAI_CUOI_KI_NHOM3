/*!
 * waste-reduction.js — AI 3 / Circular Economy Exchange
 *
 * Module tính “Lượng rác thải đã giảm thiểu”.
 *
 * ┌────────────────────────────────────────────────────────────────────────┐
 * │ TRẠNG THÁI: CÔNG THỨC CHƯA ĐƯỢC XÁC NHẬN — NEED CONFIRMATION           │
 * │ README không cung cấp công thức, đơn vị, khối lượng hay hệ số quy đổi. │
 * │ Module này KHÔNG chứa bất kỳ hệ số hay số liệu nào được tự đặt.        │
 * │ Cho tới khi WASTE_RULE bên dưới được điền, tổng trả về luôn là null.   │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 * Quy tắc kích hoạt:
 *  - Chỉ ghi nhận khi giao dịch mang tín hiệu xác nhận thành công
 *    (tx[CONFIRM_FIELD] === true). Đăng tin KHÔNG kích hoạt tính toán.
 *  - Module không tạo trang thanh toán / quy trình giao dịch. Nơi nào trong
 *    dự án xác nhận giao dịch thì gọi recordConfirmedTransaction(...).
 *
 * Dùng được cả trong trình duyệt (window.CEEWasteReduction) lẫn Node (require).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CEEWasteReduction = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ======================================================================
   * CẤU HÌNH CẦN XÁC NHẬN (điền sau khi giảng viên/nhóm chốt)
   * ====================================================================== */

  // Ba loại hình trao đổi cố định theo README.
  var EXCHANGE_TYPES = ['Give', 'Sell', 'Exchange'];

  // NEED CONFIRMATION: tên trường báo hiệu "giao dịch đã xác nhận thành công".
  // README không mô tả tín hiệu này; đây chỉ là tên hợp đồng dữ liệu tạm để
  // nơi xác nhận giao dịch (ngoài phạm vi AI 3) gọi vào. Đổi tên nếu nhóm chốt khác.
  var CONFIRM_FIELD = 'transactionConfirmed';

  // NEED CONFIRMATION: khóa lưu sổ giao dịch dùng chung giữa các trang.
  // README không quy định backend/CSDL. localStorage chỉ là lưu cục bộ trên
  // trình duyệt cho bản demo tĩnh, không phải máy chủ.
  var DEFAULT_STORAGE_KEY = 'cee.wasteLedger.v1';

  // NEED CONFIRMATION: công thức + đơn vị + dữ liệu đầu vào bắt buộc.
  //   confirmed      : đặt true CHỈ sau khi có xác nhận bằng văn bản/lời của giảng viên/nhóm
  //   unit           : đơn vị đo (ví dụ do nhóm chốt) — hiện chưa có
  //   requiredInputs : danh sách tên trường bắt buộc trong tx.inputs — hiện chưa có
  //   compute        : function (inputs) -> number — hiện chưa có
  var WASTE_RULE = {
    confirmed: false,
    unit: null,
    requiredInputs: null,
    compute: null
  };

  /* ======================================================================
   * Lưu trữ: localStorage nếu dùng được, ngược lại bộ nhớ tạm
   * ====================================================================== */

  function createStorage(key) {
    var memory = [];
    var mode = 'memory';
    var ls = null;
    try {
      if (typeof localStorage !== 'undefined') {
        var probe = '__cee_probe__';
        localStorage.setItem(probe, '1');
        localStorage.removeItem(probe);
        ls = localStorage;
        mode = 'localStorage';
      }
    } catch (e) {
      ls = null;
    }
    return {
      mode: mode,
      read: function () {
        if (!ls) return memory.slice();
        try {
          var raw = ls.getItem(key);
          var parsed = raw ? JSON.parse(raw) : [];
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return [];
        }
      },
      write: function (list) {
        if (!ls) { memory = list.slice(); return true; }
        try { ls.setItem(key, JSON.stringify(list)); return true; }
        catch (e) { return false; }
      }
    };
  }

  /* ======================================================================
   * Hàm tính toán thuần (tách riêng)
   * ====================================================================== */

  function isRuleReady(rule) {
    return !!(rule && rule.confirmed === true &&
      typeof rule.compute === 'function' &&
      typeof rule.unit === 'string' && rule.unit.length > 0 &&
      Array.isArray(rule.requiredInputs));
  }

  /**
   * Tính lượng rác thải giảm thiểu cho MỘT giao dịch từ dữ liệu đầu vào.
   * Hàm thuần: không đọc/ghi lưu trữ, không kiểm tra tín hiệu xác nhận.
   *
   * @param {Object} inputs  dữ liệu đầu vào (tên trường do WASTE_RULE.requiredInputs quy định)
   * @param {Object} [rule]  mặc định dùng WASTE_RULE
   * @returns {{status:string, value:(number|null), unit:(string|null), reason:(string|undefined), missing:(string[]|undefined)}}
   *   status: 'NEED_CONFIRMATION' | 'MISSING_INPUT' | 'INVALID_RESULT' | 'OK'
   */
  function calculateWasteReduced(inputs, rule) {
    rule = rule || WASTE_RULE;
    if (!isRuleReady(rule)) {
      return {
        status: 'NEED_CONFIRMATION',
        value: null,
        unit: null,
        reason: 'Công thức, đơn vị và dữ liệu đầu vào chưa được giảng viên/nhóm xác nhận.'
      };
    }
    var data = inputs && typeof inputs === 'object' ? inputs : {};
    var missing = rule.requiredInputs.filter(function (name) {
      return data[name] === undefined || data[name] === null || data[name] === '';
    });
    if (missing.length) {
      return { status: 'MISSING_INPUT', value: null, unit: rule.unit, missing: missing };
    }
    var result;
    try { result = rule.compute(data); } catch (e) { result = NaN; }
    if (typeof result !== 'number' || !isFinite(result)) {
      return { status: 'INVALID_RESULT', value: null, unit: rule.unit, reason: 'Công thức không trả về số hợp lệ.' };
    }
    return { status: 'OK', value: result, unit: rule.unit };
  }

  /* ======================================================================
   * Module có trạng thái (sổ giao dịch đã xác nhận)
   * ====================================================================== */

  function createWasteModule(options) {
    options = options || {};
    var rule = options.rule || WASTE_RULE;
    var storage = options.storage || createStorage(options.storageKey || DEFAULT_STORAGE_KEY);

    function notify() {
      try {
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' &&
            typeof CustomEvent === 'function') {
          window.dispatchEvent(new CustomEvent('cee:waste-total-changed', { detail: api.getCommunityTotal() }));
        }
      } catch (e) { /* bỏ qua: sự kiện chỉ là tiện ích */ }
    }

    var api = {
      EXCHANGE_TYPES: EXCHANGE_TYPES.slice(),
      CONFIRM_FIELD: CONFIRM_FIELD,
      storageMode: storage.mode,

      calculateWasteReduced: function (inputs) {
        return calculateWasteReduced(inputs, rule);
      },

      /**
       * Ghi nhận một giao dịch ĐÃ được xác nhận thành công.
       * tx = { transactionId, listingId, exchangeType, transactionConfirmed: true, inputs: {...} }
       * Không tính và không ghi nếu tín hiệu xác nhận không phải đúng `true`.
       */
      recordConfirmedTransaction: function (tx) {
        if (!tx || typeof tx !== 'object') {
          return { status: 'REJECTED_INVALID', reason: 'Thiếu dữ liệu giao dịch.' };
        }
        if (tx[CONFIRM_FIELD] !== true) {
          return { status: 'REJECTED_NOT_CONFIRMED', reason: 'Giao dịch chưa có tín hiệu xác nhận thành công; không ghi nhận.' };
        }
        if (typeof tx.transactionId !== 'string' || !tx.transactionId) {
          return { status: 'REJECTED_INVALID', reason: 'Thiếu transactionId (cần để không ghi trùng).' };
        }
        if (typeof tx.listingId !== 'string' || !tx.listingId) {
          return { status: 'REJECTED_INVALID', reason: 'Thiếu listingId.' };
        }
        if (EXCHANGE_TYPES.indexOf(tx.exchangeType) === -1) {
          return { status: 'REJECTED_INVALID', reason: 'exchangeType phải là Give, Sell hoặc Exchange.' };
        }
        var ledger = storage.read();
        var dup = ledger.some(function (r) { return r.transactionId === tx.transactionId; });
        if (dup) {
          return { status: 'DUPLICATE', reason: 'transactionId đã được ghi nhận trước đó.' };
        }
        ledger.push({
          transactionId: tx.transactionId,
          listingId: tx.listingId,
          exchangeType: tx.exchangeType,
          inputs: tx.inputs && typeof tx.inputs === 'object' ? tx.inputs : {},
          recordedAt: new Date().toISOString()
        });
        if (!storage.write(ledger)) {
          return { status: 'STORAGE_FAILED', reason: 'Không ghi được vào lưu trữ trình duyệt.' };
        }
        notify();
        return {
          status: 'RECORDED',
          calculation: calculateWasteReduced(tx.inputs, rule)
        };
      },

      /**
       * Kết quả tổng cho AI 1 hiển thị trên Trang chủ.
       * AI 1 CHỈ hiển thị `total` khi status === 'OK'. Với mọi status khác
       * `total` là null và AI 1 phải hiển thị trạng thái "chưa có dữ liệu".
       *
       * status:
       *   'NO_DATA'           chưa có giao dịch nào được xác nhận
       *   'NEED_CONFIRMATION' có giao dịch xác nhận nhưng công thức chưa chốt
       *   'INCOMPLETE'        công thức đã chốt nhưng có giao dịch thiếu dữ liệu đầu vào
       *   'OK'                tổng hợp lệ
       */
      getCommunityTotal: function () {
        var ledger = storage.read();
        var base = {
          total: null,
          unit: isRuleReady(rule) ? rule.unit : null,
          confirmedTransactionCount: ledger.length,
          computedCount: 0,
          incompleteCount: 0,
          storageMode: storage.mode,
          asOf: new Date().toISOString()
        };
        if (ledger.length === 0) {
          base.status = 'NO_DATA';
          return base;
        }
        if (!isRuleReady(rule)) {
          base.status = 'NEED_CONFIRMATION';
          return base;
        }
        var sum = 0;
        ledger.forEach(function (r) {
          var c = calculateWasteReduced(r.inputs, rule);
          if (c.status === 'OK') { sum += c.value; base.computedCount += 1; }
          else { base.incompleteCount += 1; }
        });
        if (base.incompleteCount > 0) {
          base.status = 'INCOMPLETE';
          return base;
        }
        base.status = 'OK';
        base.total = sum;
        return base;
      },

      getLedger: function () { return storage.read(); }
    };
    return api;
  }

  var defaultModule = createWasteModule();
  defaultModule.createWasteModule = createWasteModule;
  defaultModule.calculateWasteReducedPure = calculateWasteReduced;
  return defaultModule;
});
