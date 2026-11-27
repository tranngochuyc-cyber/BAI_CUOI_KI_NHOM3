const test = require('node:test');
const assert = require('node:assert');
const f = require('../assets/js/category-filter.js');

// DỮ LIỆU GIẢ chỉ dùng để test.
const data = [
  { id: 1, title: 'Bàn gỗ', description: 'Còn chắc', category: 'A', distance: 2 },
  { id: 2, title: 'Đèn học', description: 'Đèn để bàn', category: 'B', distance: 5 },
  { id: 3, title: 'Ghế', description: '', category: 'A', distance: 10 },
  { id: 4, title: 'Kệ sách', category: 'B' }
];
const ids = c => f.filterProducts(data, c).map(p => p.id);

test('không điều kiện: trả đủ', () => assert.deepStrictEqual(ids({}), [1, 2, 3, 4]));
test('tìm trong tên và mô tả', () => assert.deepStrictEqual(ids({ keyword: 'bàn' }), [1, 2]));
test('không phân biệt dấu, hoa thường, đ', () => {
  assert.deepStrictEqual(ids({ keyword: '  BAN  GO ' }), [1]);
  assert.deepStrictEqual(ids({ keyword: 'den' }), [2]);
});
test('chuỗi dạng NFD vẫn khớp', () => assert.deepStrictEqual(ids({ keyword: 'ghế'.normalize('NFD') }), [3]));
test('lọc danh mục', () => assert.deepStrictEqual(ids({ category: 'A' }), [1, 3]));
test('khoảng cách: bao gồm biên, loại sản phẩm thiếu', () => assert.deepStrictEqual(ids({ maxDistance: '5' }), [1, 2]));
test('khoảng cách 0', () => assert.deepStrictEqual(ids({ maxDistance: 0 }), []));
test('khoảng cách rỗng/sai/âm: không lọc', () => {
  for (const v of ['', '  ', 'abc', -1, null]) assert.strictEqual(ids({ maxDistance: v }).length, 4);
});
test('kết hợp 3 điều kiện', () => assert.deepStrictEqual(ids({ keyword: 'ban', category: 'A', maxDistance: 5 }), [1]));
test('không có kết quả', () => assert.deepStrictEqual(ids({ keyword: 'xyz' }), []));
test('danh mục không trùng', () => assert.deepStrictEqual(f.getCategories(data), ['A', 'B']));
test('không sửa dữ liệu gốc', () => {
  const before = JSON.stringify(data);
  ids({ keyword: 'ban', maxDistance: 3 });
  assert.strictEqual(JSON.stringify(data), before);
});

// Khoảng cách theo hợp đồng chung { value, unit, reference } (dữ liệu giả chỉ để test).
test('khoảng cách dạng đối tượng {value, unit, reference}', () => {
  const objData = [
    { id: 1, title: 'a', category: 'A', distance: { value: 3, unit: 'km', reference: 'x' } },
    { id: 2, title: 'b', category: 'A', distance: { value: 8, unit: 'km', reference: 'x' } },
    { id: 3, title: 'c', category: 'A', distance: null }
  ];
  const r = f.filterProducts(objData, { maxDistance: '5' }).map(p => p.id);
  assert.deepStrictEqual(r, [1]);
});
