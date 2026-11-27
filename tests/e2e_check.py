# Kiểm thử end-to-end bằng Chrome thật (Playwright cho Python).
# Cách chạy: (1) python3 demo-server.py ở thư mục gốc repo; (2) python3 tests/e2e_check.py
# Biến môi trường: CEE_BASE (mặc định http://127.0.0.1:8765), CEE_CHROME (đường dẫn Chrome; bỏ trống = Chromium của Playwright).
import os, sys, json, struct, zlib, tempfile
from playwright.sync_api import sync_playwright
BASE=os.environ.get('CEE_BASE','http://127.0.0.1:8000')
CHROME=os.environ.get('CEE_CHROME') or None
SHOTS=tempfile.gettempdir()

def make_png(path, w=8, h=8, rgb=(60,140,100)):
    raw=b''.join(b'\x00'+bytes(rgb)*w for _ in range(h))
    def ch(t,d):
        c=struct.pack('>I',len(d))+t+d
        return c+struct.pack('>I',zlib.crc32(t+d)&0xffffffff)
    open(path,'wb').write(b'\x89PNG\r\n\x1a\n'+ch(b'IHDR',struct.pack('>IIBBBBB',w,h,8,2,0,0,0))+ch(b'IDAT',zlib.compress(raw))+ch(b'IEND',b''))
TEST_PNG=os.path.join(SHOTS,'cee_test.png'); make_png(TEST_PNG)
results=[]
def check(name, cond, extra=''):
    results.append((name, bool(cond), extra)); print(('PASS' if cond else 'FAIL'), name, extra)

with sync_playwright() as p:
    b=p.chromium.launch(executable_path=CHROME, args=['--no-sandbox'])
    ctx=b.new_context(viewport={'width':1280,'height':900})
    page=ctx.new_page()
    errors=[]; external=[]
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type=='error' else None)
    page.on('request', lambda r: external.append(r.url) if not (r.url.startswith(BASE) or r.url.startswith('blob:')) else None)

    # 1. Trang chủ lần đầu: chỉ có tin demo, chưa có giao dịch
    page.goto(BASE+'/index.html'); page.wait_for_selector('.product-card')
    check('Home: hiển thị 6 tin demo, mỗi thẻ có nhãn "Tin demo"', page.locator('.product-card').count()==6 and page.locator('.product-card__demo').count()==6)
    check('Home: thống kê = 0 kg, ghi rõ chưa có giao dịch và là giả định', page.inner_text('#community-waste-value').strip()=='0 kg' and 'Chưa có giao dịch' in page.inner_text('#community-waste-note') and 'Giả định' in page.inner_text('#community-waste-note'))
    check('Home: 3 link điều hướng + mục Cách hoạt động 3 bước', page.locator('.site-nav__link').count()==3 and page.locator('.how-step').count()==3)
    check('Home: nhãn loại hình có tiếng Việt (Tặng/Bán/Đổi)', any(t in page.inner_text('#latest-products') for t in ['Give · Tặng','Sell · Bán','Exchange · Đổi']))
    check('Home: thẻ hiện khoảng cách', page.locator('.product-card__distance').count()==6)

    # 2. Đăng tin
    page.goto(BASE+'/post.html')
    cats=page.eval_on_selector_all('#category option','o=>o.map(x=>x.value)')
    check('Post: ô Danh mục hiển thị, lấy từ cấu hình', len(cats)==7 and cats[0]=='')
    types=page.eval_on_selector_all('input[name=exchangeType]','i=>i.map(x=>x.value)')
    check('Post: đúng 3 loại Give/Sell/Exchange', types==['Give','Sell','Exchange'])
    conds=page.eval_on_selector_all('#condition option','o=>o.map(x=>x.value).filter(Boolean)')
    check('Post: đúng 3 tình trạng', conds==['Like new','Good','Fair'])
    page.click('button.primary')
    errs=[t for t in page.eval_on_selector_all('.error','e=>e.map(x=>x.textContent)') if t]
    check('Post: gửi form rỗng báo 5 lỗi (tên, mô tả, tình trạng, danh mục, loại hình)', len(errs)==5, str(len(errs)))
    check('Post: chưa lưu gì khi form lỗi', page.evaluate("JSON.parse(localStorage.getItem('cee.listings.v1')||'[]').length")==0)
    page.fill('#distance','-3'); page.click('button.primary')
    check('Post: khoảng cách âm bị báo lỗi', 'không âm' in page.inner_text('#distance-error'))

    def post(title, desc, cond, cat, typ, dist=None, img=None):
        page.goto(BASE+'/post.html')
        page.fill('#title',title); page.fill('#description',desc)
        page.select_option('#condition',cond); page.select_option('#category',cat)
        page.check(f'input[name=exchangeType][value={typ}]')
        if dist is not None: page.fill('#distance',str(dist))
        if img: page.set_input_files('#image',img)
        page.click('button.primary')
        page.wait_for_selector('#result:not([hidden])')
    n0=len(external)
    post('Bàn gỗ sồi','Bàn làm việc còn chắc chắn','Good','Nội thất','Sell',2,TEST_PNG)
    check('Post: chọn ảnh giả lập, không có request ra ngoài', len(external)==n0)
    rec=page.evaluate("JSON.parse(localStorage.getItem('cee.listings.v1'))[0]")
    check('Post: ảnh chỉ lưu metadata giả lập (mock, uploaded=false)', rec['image']['mock'] is True and rec['image']['uploaded'] is False and 'data' not in rec['image'])
    check('Post: lưu khoảng cách dạng số', rec.get('distance')==2)
    page.wait_for_timeout(1100)
    post('Ghế xoay văn phòng','Ghế ít dùng, tựa lưng lưới','Like new','Nội thất','Give',8)
    page.wait_for_timeout(1100)
    post('Sách lập trình Python','Giáo trình cũ, có ghi chú bút chì','Fair','Sách & văn phòng phẩm','Exchange')
    check('Post: đăng tin KHÔNG ghi vào sổ rác thải', page.evaluate("localStorage.getItem('cee.wasteLedger.v1')")is None)

    # 3. Trang chủ sau khi đăng: tin mới nhất lên đầu, tối đa 6 thẻ
    page.goto(BASE+'/index.html'); page.wait_for_selector('.product-card')
    titles=page.eval_on_selector_all('.product-card__title','e=>e.map(x=>x.textContent)')
    check('Home: 3 tin vừa đăng đứng đầu, mới nhất trước', titles[:3]==['Sách lập trình Python','Ghế xoay văn phòng','Bàn gỗ sồi'], str(titles))
    check('Home: giới hạn 6 thẻ', len(titles)==6)
    badges=page.eval_on_selector_all('.condition-badge','e=>e.map(x=>x.textContent)')
    check('Home: badge đúng nhãn', badges[:3]==['Fair','Like new','Good'], str(badges))
    check('Home: tin tự đăng không có nhãn demo', page.locator('.product-card').nth(0).locator('.product-card__demo').count()==0)

    # 4. Danh mục: 3 tin đăng + 6 tin demo
    page.goto(BASE+'/category.html'); page.wait_for_selector('.product-card')
    check('Category: hiển thị 9 sản phẩm', page.locator('.product-card').count()==9)
    opts=page.eval_on_selector_all('#category-select option','o=>o.map(x=>x.value)')
    check('Category: 5 danh mục lấy từ dữ liệu', len(opts)==6 and opts[0]=='', str(opts))
    page.fill('#search-input','ghe xoay')
    check('Category: tìm không dấu "ghe xoay" -> 1', page.locator('.product-card').count()==1)
    page.fill('#search-input','')
    page.select_option('#category-select','Nội thất')
    check('Category: Nội thất -> 3', page.locator('.product-card').count()==3)
    page.fill('#distance-input','5')
    check('Category: Nội thất + ≤5 km -> Bàn gỗ sồi', page.locator('.product-card').count()==1 and 'Bàn gỗ' in page.inner_text('.product-card__title'))
    page.fill('#search-input','xyz')
    check('Category: không có kết quả -> thông báo rỗng', page.locator('.product-card').count()==0 and 'Không có sản phẩm phù hợp' in page.inner_text('#result-status'))
    page.fill('#search-input',''); page.select_option('#category-select',''); page.fill('#distance-input','5')
    check('Category: chỉ lọc ≤5 km -> 4', page.locator('.product-card').count()==4)
    page.press('#search-input','Enter')
    check('Category: Enter không tải lại trang', page.url.endswith('/category.html'))
    check('Category: nhãn khoảng cách có đơn vị', 'km' in page.inner_text('#distance-label'))

    # 5. Giao dịch thành công -> cộng ước tính (Nội thất 12 kg theo giả định)
    page.fill('#distance-input',''); page.fill('#search-input','ban go soi')
    page.click('.product-card__confirm')
    check('Transaction: thẻ chuyển sang "Đã giao dịch thành công" kèm ước tính', 'Đã giao dịch thành công' in page.inner_text('.product-card__done') and '12 kg' in page.inner_text('.product-card__done'))
    check('Transaction: không còn nút xác nhận trên thẻ đó', page.locator('.product-card__confirm').count()==0)
    r1=page.evaluate("CEEWasteReduction.recordConfirmedTransaction({transactionId:'t1',listingId:'x',exchangeType:'Give',transactionConfirmed:false,inputs:{}}).status")
    check('Waste: giao dịch chưa xác nhận -> không ghi', r1=='REJECTED_NOT_CONFIRMED')
    page.goto(BASE+'/index.html'); page.wait_for_selector('.product-card')
    check('Home: thống kê = 12 kg từ 1 giao dịch', page.inner_text('#community-waste-value').strip()=='12 kg' and '1 giao dịch' in page.inner_text('#community-waste-note'))
    page.locator('.product-card', has_text='Quạt bàn mini').locator('.product-card__confirm').click()
    page.wait_for_function("document.querySelector('#community-waste-value').textContent.trim()==='13,5 kg'")
    check('Home: xác nhận thêm ngay trên Trang chủ -> 13,5 kg, tự cập nhật', True)
    page.reload(); page.wait_for_selector('.product-card')
    check('Home: tải lại vẫn giữ 2 giao dịch, không cộng trùng', page.inner_text('#community-waste-value').strip()=='13,5 kg' and page.locator('.product-card__done').count()>=1)

    # 5b. Đặt lại dữ liệu demo
    page.once('dialog', lambda d: d.accept())
    page.click('#reset-demo')
    page.wait_for_function("document.querySelector('#community-waste-value').textContent.trim()==='0 kg'")
    check('Reset: về 0 kg và chỉ còn 6 tin demo', page.locator('.product-card__demo').count()==6 and page.evaluate("localStorage.getItem('cee.listings.v1')") is None)

    # 6. Responsive + ảnh chụp
    for name in ['index','category','post']:
        pg=ctx.new_page(); pg.set_viewport_size({'width':375,'height':800}); pg.goto(f'{BASE}/{name}.html'); pg.wait_for_timeout(400)
        check(f'Mobile 375px: {name} không cuộn ngang', pg.evaluate('document.documentElement.scrollWidth<=innerWidth'))
        pg.screenshot(path=os.path.join(SHOTS,f'cee_shot_{name}_m.png'), full_page=True); pg.close()
    for name in ['index','category','post']:
        pg=ctx.new_page(); pg.goto(f'{BASE}/{name}.html'); pg.wait_for_timeout(400)
        pg.screenshot(path=os.path.join(SHOTS,f'cee_shot_{name}.png'), full_page=True); pg.close()
    check('Không có lỗi console/JS', errors==[], str(errors))
    check('Không có request ra ngoài localhost', external==[], str(external))
    b.close()
bad=[r for r in results if not r[1]]
print(f'\n{len(results)-len(bad)}/{len(results)} PASS'); sys.exit(1 if bad else 0)
