// Chạy: node --test tests/
// LƯU Ý: TEST_RULE bên dưới CHỈ để kiểm tra cơ chế (đếm/cộng/kích hoạt).
// Nó trả lại đúng giá trị `testValue` do test cung cấp, KHÔNG có hệ số quy đổi,
// KHÔNG phải công thức của dự án và không được dùng ngoài file test này.
const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

const waste = require(path.join('..', 'js', 'logic', 'waste.js'));
const listings = require(path.join('..', 'js', 'logic', 'listing.js'));

const memStore = () => { let l = []; return { mode: 'memory', read: () => l.slice(), write: (x) => { l = x.slice(); return true; } }; };
const TEST_RULE = { confirmed: true, unit: 'TEST_UNIT', requiredInputs: ['testValue'], compute: (i) => i.testValue };
const tx = (id, extra) => Object.assign({ transactionId: id, listingId: 'lst_1', exchangeType: 'Give', transactionConfirmed: true, inputs: { testValue: 2 } }, extra || {});

test('module mặc định: công thức chưa xác nhận -> NEED_CONFIRMATION, không có số', () => {
  const r = waste.calculateWasteReduced({ anything: 1 });
  assert.strictEqual(r.status, 'NEED_CONFIRMATION');
  assert.strictEqual(r.value, null);
  assert.strictEqual(r.unit, null);
});

test('mặc định chưa có giao dịch -> NO_DATA, total null', () => {
  const m = waste.createWasteModule({ storage: memStore() });
  const t = m.getCommunityTotal();
  assert.strictEqual(t.status, 'NO_DATA');
  assert.strictEqual(t.total, null);
});

test('không ghi khi chưa có tín hiệu xác nhận (đăng tin/chưa xác nhận)', () => {
  const m = waste.createWasteModule({ storage: memStore(), rule: TEST_RULE });
  for (const bad of [tx('a', { transactionConfirmed: false }), tx('b', { transactionConfirmed: 'true' }), tx('c', { transactionConfirmed: undefined }), tx('d', { transactionConfirmed: 1 })]) {
    assert.strictEqual(m.recordConfirmedTransaction(bad).status, 'REJECTED_NOT_CONFIRMED');
  }
  assert.strictEqual(m.getLedger().length, 0);
  assert.strictEqual(m.getCommunityTotal().status, 'NO_DATA');
});

test('giao dịch xác nhận + công thức chưa chốt -> ghi sổ nhưng total null (NEED_CONFIRMATION)', () => {
  const m = waste.createWasteModule({ storage: memStore() });
  assert.strictEqual(m.recordConfirmedTransaction(tx('a')).status, 'RECORDED');
  const t = m.getCommunityTotal();
  assert.strictEqual(t.status, 'NEED_CONFIRMATION');
  assert.strictEqual(t.total, null);
  assert.strictEqual(t.confirmedTransactionCount, 1);
});

test('chỉ chấp nhận đúng Give/Sell/Exchange', () => {
  const m = waste.createWasteModule({ storage: memStore(), rule: TEST_RULE });
  for (const t of ['Give', 'Sell', 'Exchange']) assert.strictEqual(m.recordConfirmedTransaction(tx('id_' + t, { exchangeType: t })).status, 'RECORDED');
  for (const t of ['give', 'Donate', '', undefined]) assert.strictEqual(m.recordConfirmedTransaction(tx('x' + t, { exchangeType: t })).status, 'REJECTED_INVALID');
});

test('không ghi trùng transactionId', () => {
  const m = waste.createWasteModule({ storage: memStore(), rule: TEST_RULE });
  assert.strictEqual(m.recordConfirmedTransaction(tx('dup')).status, 'RECORDED');
  assert.strictEqual(m.recordConfirmedTransaction(tx('dup')).status, 'DUPLICATE');
  assert.strictEqual(m.getLedger().length, 1);
});

test('thiếu transactionId/listingId bị từ chối', () => {
  const m = waste.createWasteModule({ storage: memStore(), rule: TEST_RULE });
  assert.strictEqual(m.recordConfirmedTransaction(tx('', {})).status, 'REJECTED_INVALID');
  assert.strictEqual(m.recordConfirmedTransaction(tx('z', { listingId: '' })).status, 'REJECTED_INVALID');
  assert.strictEqual(m.recordConfirmedTransaction(null).status, 'REJECTED_INVALID');
});

test('cơ chế cộng tổng (dùng TEST_RULE, không phải công thức thật)', () => {
  const m = waste.createWasteModule({ storage: memStore(), rule: TEST_RULE });
  m.recordConfirmedTransaction(tx('a', { inputs: { testValue: 2 } }));
  m.recordConfirmedTransaction(tx('b', { inputs: { testValue: 3 } }));
  const t = m.getCommunityTotal();
  assert.strictEqual(t.status, 'OK');
  assert.strictEqual(t.total, 5);
  assert.strictEqual(t.unit, 'TEST_UNIT');
  assert.strictEqual(t.computedCount, 2);
});

test('thiếu dữ liệu đầu vào -> INCOMPLETE, total null (không tính thiếu)', () => {
  const m = waste.createWasteModule({ storage: memStore(), rule: TEST_RULE });
  m.recordConfirmedTransaction(tx('a'));
  m.recordConfirmedTransaction(tx('b', { inputs: {} }));
  const t = m.getCommunityTotal();
  assert.strictEqual(t.status, 'INCOMPLETE');
  assert.strictEqual(t.total, null);
  assert.strictEqual(t.incompleteCount, 1);
});

test('công thức trả NaN/không phải số -> INVALID_RESULT', () => {
  const bad = Object.assign({}, TEST_RULE, { compute: () => NaN });
  const r = waste.createWasteModule({ storage: memStore(), rule: bad }).calculateWasteReduced({ testValue: 1 });
  assert.strictEqual(r.status, 'INVALID_RESULT');
  assert.strictEqual(r.value, null);
});

test('rule thiếu unit hoặc requiredInputs -> vẫn NEED_CONFIRMATION', () => {
  for (const rule of [{ confirmed: true, compute: (i) => 1, unit: null, requiredInputs: [] }, { confirmed: true, compute: (i) => 1, unit: 'u' }, { confirmed: false, compute: (i) => 1, unit: 'u', requiredInputs: [] }]) {
    assert.strictEqual(waste.calculateWasteReducedPure({}, rule).status, 'NEED_CONFIRMATION');
  }
});

test('validate form: hợp lệ', () => {
  const e = listings.validate({ title: 'Ghế gỗ', description: 'Còn tốt, chân chắc chắn', condition: 'Good', exchangeType: 'Give', image: null }, []);
  assert.deepStrictEqual(e, {});
});

test('validate form: thiếu trường, giá trị ngoài danh sách bị từ chối', () => {
  const e = listings.validate({ title: ' ', description: '', condition: 'Excellent', exchangeType: 'Donate' }, []);
  assert.ok(e.title && e.description && e.condition && e.exchange);
});

test('validate form: file không phải ảnh bị từ chối', () => {
  const e = listings.validate({ title: 'a', description: 'b', condition: 'Fair', exchangeType: 'Sell', image: { name: 'x.pdf', type: 'application/pdf', size: 1 } }, []);
  assert.ok(e.image);
});

test('buildListing: ảnh chỉ là metadata giả lập, uploaded=false', () => {
  const l = listings.buildListing({ title: 'a', description: 'b', condition: 'Like new', exchangeType: 'Exchange', image: { name: 'p.png', type: 'image/png', size: 10 } }, []);
  assert.strictEqual(l.image.mock, true);
  assert.strictEqual(l.image.uploaded, false);
  assert.strictEqual(l.category, undefined);
});

test('validate form: khoảng cách không bắt buộc, nếu nhập phải là số >= 0', () => {
  const base = { title: 'Ghế gỗ', description: 'Mô tả đủ mười ký tự', condition: 'Good', exchangeType: 'Give', image: null };
  assert.deepStrictEqual(listings.validate(Object.assign({}, base, { distance: '' }), []), {});
  assert.deepStrictEqual(listings.validate(Object.assign({}, base, { distance: '0' }), []), {});
  assert.ok(listings.validate(Object.assign({}, base, { distance: '-1' }), []).distance);
  assert.ok(listings.validate(Object.assign({}, base, { distance: 'abc' }), []).distance);
  assert.ok(listings.validate(Object.assign({}, base, { distance: '101' }), []).distance);
});

test('buildListing: lưu khoảng cách là số khi có nhập, bỏ qua khi để trống', () => {
  const base = { title: 'a', description: 'b', condition: 'Good', exchangeType: 'Give', image: null };
  assert.strictEqual(listings.buildListing(Object.assign({}, base, { distance: '2.5' }), []).distance, 2.5);
  assert.strictEqual(listings.buildListing(Object.assign({}, base, { distance: '' }), []).distance, undefined);
});

test('validate form: định dạng tên/mô tả quá ngắn, ảnh quá lớn, danh mục bắt buộc', () => {
  const ok = { title: 'Ghế gỗ', description: 'Mô tả đủ mười ký tự', condition: 'Good', exchangeType: 'Sell', image: null, category: 'Nội thất' };
  assert.ok(listings.validate(Object.assign({}, ok, { title: 'ab' }), []).title);
  assert.ok(listings.validate(Object.assign({}, ok, { description: 'ngắn' }), []).description);
  assert.ok(listings.validate(Object.assign({}, ok, { image: { name: 'a.png', type: 'image/png', size: 6 * 1024 * 1024 } }), []).image);
  assert.ok(listings.validate(Object.assign({}, ok, { category: '' }), ['Nội thất']).category);
  assert.deepStrictEqual(listings.validate(ok, ['Nội thất']), {});
});

test('buildListing: lưu ảnh thu nhỏ (chỉ trên trình duyệt) nhưng vẫn uploaded=false', () => {
  const l = listings.buildListing({ title: 'Ghế gỗ', description: 'Mô tả đủ mười ký tự', condition: 'Good', exchangeType: 'Give', image: { name: 'p.jpg', type: 'image/jpeg', size: 10, thumbnail: 'data:image/jpeg;base64,AA' } }, []);
  assert.strictEqual(l.image.uploaded, false);
  assert.strictEqual(l.image.thumbnail, 'data:image/jpeg;base64,AA');
});
