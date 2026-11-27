# Kiểm thử end-to-end bằng Chrome thật (Playwright cho Python).
# Chạy cả 2 cách mở website: qua máy chủ (http://) và mở trực tiếp file HTML (file://).
#
#   pip install playwright && playwright install chromium
#   python -m http.server 8765            # terminal 1, ở thư mục gốc repo
#   python tests/e2e_check.py             # terminal 2
#
# Biến môi trường: CEE_HTTP (mặc định http://127.0.0.1:8765), CEE_CHROME (đường dẫn Chrome, tùy chọn).
import os, sys, struct, zlib, tempfile, pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
HTTP = os.environ.get('CEE_HTTP', 'http://127.0.0.1:8765')
CHROME = os.environ.get('CEE_CHROME') or None
TMP = pathlib.Path(tempfile.gettempdir())
results = []

def check(name, cond, extra=''):
    results.append((name, bool(cond)))
    print(('PASS' if cond else 'FAIL'), name, extra if not cond else '')

def make_png(path, w=40, h=30):
    raw = b''.join(b'\x00' + bytes((60, 140, 100)) * w for _ in range(h))
    def ch(t, d):
        c = struct.pack('>I', len(d)) + t + d
        return c + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    path.write_bytes(b'\x89PNG\r\n\x1a\n' + ch(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)) + ch(b'IDAT', zlib.compress(raw)) + ch(b'IEND', b''))

PNG = TMP / 'cee_test.png'; make_png(PNG)
TXT = TMP / 'cee_test.txt'; TXT.write_text('khong phai anh')

def run(base, mode, browser):
    print(f'\n===== {mode}: {base} =====')
    ctx = browser.new_context(viewport={'width': 1280, 'height': 900})
    page = ctx.new_page()
    errors, external = [], []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    page.on('request', lambda r: external.append(r.url) if not (r.url.startswith(base) or r.url.startswith(('data:', 'blob:'))) else None)
    url = lambda name, q='': f'{base}/{name}.html{q}'
    T = lambda name: f'[{mode}] {name}'

    # 1. Trang chủ ban đầu
    page.goto(url('index')); page.wait_for_selector('.product-card')
    check(T('Home: 8 mặt hàng mới, đều có nhãn "Tin demo"'), page.locator('#latest-products .product-card').count() == 8 and page.locator('.badge--demo').count() == 8)
    check(T('Home: widget rác thải 0 kg, 0 giao dịch, 8 món chờ trao đổi'), page.inner_text('#stat-waste') == '0 kg' and page.inner_text('#stat-transactions') == '0' and page.inner_text('#stat-available') == '8')
    labels = set(page.eval_on_selector_all('#latest-products .badge', 'b => b.map(x => x.textContent)'))
    check(T('Home: badge tình trạng (Like new/Good/Fair) và loại hình (Tặng/Bán/Đổi)'), {'Like new', 'Good', 'Fair', 'Tặng', 'Bán', 'Đổi'} <= labels, str(labels))
    check(T('Home: semantic header/nav/main/section/article/footer'), page.evaluate("['header','nav','main','section','article','footer'].every(t => document.querySelector(t))"))
    check(T('Home: danh mục nổi bật có lối tắt'), page.locator('#category-links .chip').count() >= 4)

    # 2. Đăng tin: validation
    page.goto(url('post'))
    page.click('button[type=submit]')
    errs = [t for t in page.eval_on_selector_all('.field__error', 'e => e.map(x => x.textContent)') if t]
    check(T('Post: gửi form rỗng báo 5 lỗi bắt buộc'), len(errs) == 5, str(errs))
    check(T('Post: ô lỗi được tô đỏ (aria-invalid) và focus vào ô đầu tiên'), page.get_attribute('#title', 'aria-invalid') == 'true' and page.evaluate('document.activeElement.id') == 'title')
    check(T('Post: không lưu gì khi form lỗi'), page.evaluate("JSON.parse(localStorage.getItem('cee.listings.v1') || '[]').length") == 0)
    page.fill('#title', 'ab'); page.fill('#description', 'ngắn'); page.fill('#distance', '150')
    check(T('Post: báo lỗi định dạng ngay khi gõ (tên, mô tả, khoảng cách)'), 'ít nhất 3' in page.inner_text('#title-error') and 'ít nhất 10' in page.inner_text('#description-error') and 'từ 0 đến 100' in page.inner_text('#distance-error'))
    page.fill('#title', 'Bàn gỗ sồi')
    check(T('Post: lỗi biến mất khi sửa đúng'), page.inner_text('#title-error') == '' and page.get_attribute('#title', 'aria-invalid') is None)
    page.set_input_files('#image', str(TXT))
    check(T('Post: file không phải ảnh bị từ chối'), 'file ảnh' in page.inner_text('#image-error'))

    def post(title, desc, cat, cond, typ, dist=None, img=False):
        page.goto(url('post'))
        page.fill('#title', title); page.fill('#description', desc)
        page.select_option('#category', cat); page.select_option('#condition', cond)
        page.check(f'input[name=exchangeType][value={typ}]')
        if dist is not None: page.fill('#distance', str(dist))
        if img:
            page.set_input_files('#image', str(PNG))
            page.wait_for_selector('#image-preview:not([hidden])')
        page.click('button[type=submit]')
        page.wait_for_selector('#result:not([hidden])')

    post('Bàn gỗ sồi', 'Bàn làm việc còn chắc chắn, mặt gỗ đẹp', 'Nội thất', 'Good', 'Sell', 2, img=True)
    check(T('Post: xem trước ảnh và thẻ tin vừa đăng hiện ngay kèm ảnh'), page.locator('#result-card .product-card__image').count() == 1)
    rec = page.evaluate("JSON.parse(localStorage.getItem('cee.listings.v1'))[0]")
    check(T('Post: ảnh giả lập uploaded=false, chỉ lưu ảnh thu nhỏ'), rec['image']['uploaded'] is False and rec['image']['thumbnail'].startswith('data:image/jpeg'))
    check(T('Post: "Tin bạn đã đăng" cập nhật'), page.locator('#my-listings .product-card').count() == 1)
    check(T('Post: đăng tin không cộng rác thải'), page.evaluate("localStorage.getItem('cee.wasteLedger.v1')") is None)
    page.wait_for_timeout(20)
    post('Ghế xoay văn phòng', 'Ghế ít dùng, tựa lưng lưới thoáng', 'Nội thất', 'Like new', 'Give', 8)
    page.wait_for_timeout(20)
    post('Sách lập trình Python', 'Giáo trình cũ, có ghi chú bút chì', 'Sách & văn phòng phẩm', 'Fair', 'Exchange')

    # 3. Trang chủ sau khi đăng
    page.goto(url('index')); page.wait_for_selector('.product-card')
    titles = page.eval_on_selector_all('#latest-products .product-card__title', 'e => e.map(x => x.textContent)')
    check(T('Home: tin mới đăng đứng đầu'), titles[:3] == ['Sách lập trình Python', 'Ghế xoay văn phòng', 'Bàn gỗ sồi'], str(titles))
    check(T('Home: 11 món chờ trao đổi'), page.inner_text('#stat-available') == '11')

    # 4. Danh mục: tìm kiếm + lọc đa năng
    page.goto(url('category')); page.wait_for_selector('.product-card')
    n = lambda: page.locator('#product-grid .product-card').count()
    check(T('Category: hiển thị đủ 11 sản phẩm'), n() == 11)
    page.fill('#search-input', 'ghe xoay'); check(T('Category: tìm không dấu real-time'), n() == 1)
    page.fill('#search-input', '')
    page.select_option('#condition-select', 'Fair'); check(T('Category: lọc tình trạng Fair -> 3'), n() == 3)
    page.select_option('#condition-select', '')
    page.select_option('#exchange-select', 'Give'); check(T('Category: lọc loại hình Tặng -> 4'), n() == 4)
    page.select_option('#exchange-select', '')
    page.select_option('#category-select', 'Nội thất'); check(T('Category: lọc danh mục Nội thất -> 4'), n() == 4)
    page.fill('#distance-input', '5'); check(T('Category: + khoảng cách ≤5 km -> 2'), n() == 2)
    page.fill('#search-input', 'xyz'); check(T('Category: không có kết quả -> thông báo'), n() == 0 and 'Không có sản phẩm phù hợp' in page.inner_text('#result-status'))
    page.click('button[type=reset]'); page.wait_for_timeout(50)
    check(T('Category: nút Xóa bộ lọc trả về 11'), n() == 11)
    page.select_option('#sort-select', 'nearest')
    check(T('Category: sắp xếp gần nhất'), page.inner_text('#product-grid .product-card__title') == 'Bộ giáo trình Tin học đại cương')
    page.goto(url('category', '?category=' + 'Nội thất')); page.wait_for_selector('.product-card')
    check(T('Category: mở sẵn bộ lọc qua lối tắt Trang chủ'), n() == 4)

    # 5. Giao dịch thành công -> rác thải giảm (real-time)
    home = ctx.new_page(); home.on('pageerror', lambda e: errors.append(str(e)))
    home.goto(url('index')); home.wait_for_selector('.product-card')
    page.fill('#search-input', 'ban go soi')
    page.click('#product-grid .btn--outline')
    check(T('Transaction: thẻ hiện "Đã giao dịch" kèm 12 kg ước tính + thông báo'), '12 kg' in page.inner_text('.product-card__done') and 'Đã ghi nhận' in page.inner_text('#toast'))
    home.wait_for_function("document.getElementById('stat-waste').textContent === '12 kg'", timeout=5000)
    check(T('Transaction: Trang chủ ở tab khác tự cập nhật 12 kg, không cần tải lại'), home.inner_text('#stat-transactions') == '1')
    home.locator('#latest-products .product-card', has_text='Sách lập trình Python').locator('.btn--outline').click()
    check(T('Transaction: xác nhận ngay trên Trang chủ -> 13 kg, biểu đồ 2 danh mục'), home.inner_text('#stat-waste') == '13 kg' and home.locator('.breakdown__row').count() == 2)
    r = home.evaluate("CEE.waste.recordConfirmedTransaction({transactionId:'x',listingId:'x',exchangeType:'Give',transactionConfirmed:false,inputs:{}}).status")
    check(T('Transaction: giao dịch chưa xác nhận bị từ chối'), r == 'REJECTED_NOT_CONFIRMED')
    home.reload(); home.wait_for_selector('.product-card')
    check(T('Transaction: tải lại vẫn 13 kg, không cộng trùng'), home.inner_text('#stat-waste') == '13 kg' and home.inner_text('#stat-available') == '9')

    # 6. Đặt lại dữ liệu demo
    home.once('dialog', lambda d: d.accept())
    home.click('#reset-demo')
    home.wait_for_function("document.getElementById('stat-waste').textContent === '0 kg'")
    check(T('Reset: về 0 kg, còn 8 tin demo'), home.inner_text('#stat-available') == '8')

    # 7. Responsive + ảnh chụp
    for w, h, tag in [(375, 800, 'mobile'), (768, 1000, 'tablet'), (1280, 900, 'desktop')]:
        for name in ['index', 'category', 'post']:
            p = ctx.new_page(); p.set_viewport_size({'width': w, 'height': h})
            p.on('pageerror', lambda e: errors.append(str(e)))
            p.goto(url(name)); p.wait_for_timeout(200)
            check(T(f'Responsive {tag} {w}px: {name} không cuộn ngang'), p.evaluate('document.documentElement.scrollWidth <= innerWidth'))
            if mode == 'http':
                p.screenshot(path=str(TMP / f'cee_{name}_{tag}.png'), full_page=True)
            p.close()

    check(T('Console sạch: 0 lỗi'), errors == [], str(errors))
    check(T('Không có request ra ngoài'), external == [], str(external))
    ctx.close()

with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path=CHROME, args=['--no-sandbox'])
    run(HTTP, 'http', browser)
    run(ROOT.as_uri(), 'file', browser)
    browser.close()

bad = [r for r in results if not r[1]]
print(f'\n{len(results) - len(bad)}/{len(results)} PASS')
sys.exit(1 if bad else 0)
